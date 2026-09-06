import os
import threading
import logging

from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import Complaint

logger = logging.getLogger(__name__)

def _compute_lbp_score(face_rgb) -> float:
    """
    Local Binary Pattern — hand-implemented, no external library.
    For each pixel, compares its 8 neighbours clockwise starting from top-right.
    Neighbour >= center → 1, else → 0. Forms an 8-bit binary number.
    Uniformity score = max bin frequency in histogram → higher = more uniform texture = more suspicious.
    """
    import numpy as np

    if face_rgb.ndim == 3:
        gray = (0.299 * face_rgb[:,:,0] +
                0.587 * face_rgb[:,:,1] +
                0.114 * face_rgb[:,:,2]).astype(np.uint8)
    else:
        gray = face_rgb.astype(np.uint8)

    h, w = gray.shape
    lbp_map = np.zeros((h - 2, w - 2), dtype=np.uint8)

    offsets = [(-1,-1), (-1, 0), (-1, 1),
               ( 0, 1),
               ( 1, 1), ( 1, 0), ( 1,-1),
               ( 0,-1)]

    for i, (dy, dx) in enumerate(offsets):
        neighbour = gray[1+dy : h-1+dy, 1+dx : w-1+dx] if dy != 0 or dx != 0 \
                    else gray[1:h-1, 1:w-1]
        center    = gray[1:h-1, 1:w-1]
        lbp_map  |= ((neighbour >= center).astype(np.uint8) << i)

    hist, _ = np.histogram(lbp_map.ravel(), bins=256, range=(0, 256), density=True)

    score = float(hist.max())
    return round(min(score * 10, 1.0), 4) 

def _derive_verdict_and_decision(is_fake: bool, confidence_pct: float, lbp_score: float):
    """
    Derives AI verdict and recommended decision from model output + LBP.
    Both thresholds are intentionally conservative for a crime portal.
    """
    from .models import AIVerdict, RecommendedDecision

    if not is_fake and confidence_pct < 60:
        verdict = AIVerdict.INCONCLUSIVE
    elif not is_fake:
        verdict = AIVerdict.AUTHENTIC
    elif confidence_pct >= 85 or lbp_score >= 0.80:
        verdict = AIVerdict.FAKE
    else:
        verdict = AIVerdict.LIKELY_MANIPULATED

    if verdict == AIVerdict.AUTHENTIC:
        decision = RecommendedDecision.NO_ACTION
    elif verdict == AIVerdict.INCONCLUSIVE:
        decision = RecommendedDecision.FURTHER_REVIEW
    elif verdict == AIVerdict.LIKELY_MANIPULATED:
        decision = RecommendedDecision.ESCALATE
    else:  
        decision = RecommendedDecision.REFER_FOR_PROSECUTION

    return verdict, decision


def _run_ai_analysis(complaint_id: int):
    try:
        complaint = Complaint.objects.get(pk=complaint_id)
    except Complaint.DoesNotExist:
        logger.warning("Complaint %s not found for AI analysis", complaint_id)
        return
    if not complaint.evidence_image:
        return
    try:
        from detection.services.preprocess import preprocess
        from detection.services.inference import predict
        from detection.services.gradcam import generate_cam
        from detection.services.model_loader import load_model, DEVICE

        tensor, image_rgb  = preprocess(complaint.evidence_image.path)
        result            = predict(tensor=tensor)
        is_fake           = result["is_fake"]
        confidence_pct    = round(result["confidence"] * 100, 2)

        lbp_score         = _compute_lbp_score(image_rgb)
        verdict, decision = _derive_verdict_and_decision(is_fake, confidence_pct, lbp_score)

        model        = load_model()
        target_layer = model.features[-1]   

        heatmap_filename = f"heatmap_complaint_{complaint_id}.jpg"
        heatmap_path     = os.path.join(settings.MEDIA_ROOT, "heatmaps", heatmap_filename)
        os.makedirs(os.path.dirname(heatmap_path), exist_ok=True)


        generate_cam(model=model, tensor=tensor.unsqueeze(0).to(DEVICE),
                     target_layer=target_layer, target_class=int(is_fake),
                     save_path=heatmap_path)
        

        ai_flagged = is_fake and confidence_pct >= 70.0

        Complaint.objects.filter(pk=complaint_id).update(
            ai_confidence           = confidence_pct,
            ai_is_fake              = is_fake,
            ai_flagged              = ai_flagged,
            ai_heatmap              = f"heatmaps/{heatmap_filename}",
            ai_model_version        = "densenet121_v1",   
            ai_lbp_score            = lbp_score,
            ai_verdict              = verdict,
            ai_recommended_decision = decision,
            status = Complaint.Status.PENDING if ai_flagged else Complaint.Status.ONGOING,
        )
        logger.info("AI done | complaint=%s fake=%s conf=%.1f%% lbp=%.4f verdict=%s flagged=%s",
                    complaint_id, is_fake, confidence_pct, lbp_score, verdict, ai_flagged)
    except Exception:
        logger.exception("AI analysis failed for complaint %s", complaint_id)


@receiver(post_save, sender=Complaint)
def trigger_ai_analysis(sender, instance, created, **kwargs):
    logger.info("post_save fired | complaint=%s created=%s has_image=%s ai_version=%s",
                instance.pk, created, bool(instance.evidence_image), instance.ai_model_version)
    if not instance.evidence_image:
        return
    if not created and instance.ai_model_version:
        return
    complaint_id = instance.pk
    def spawn_thread():
        t = threading.Thread(target=_run_ai_analysis, args=(complaint_id,),
                             daemon=True, name=f"ai-analysis-complaint-{complaint_id}")
        t.start()
        logger.info("Spawned AI thread for complaint %s", complaint_id)
    transaction.on_commit(spawn_thread)
    