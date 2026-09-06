# import os
# import torch
# from django.conf import settings
# from rest_framework.viewsets import ModelViewSet
# from rest_framework.response import Response
# from rest_framework import status
# from detection.models.detect import DetectionResult
# from detection.serializers.detectserializer import DetectionResultSerializer
# from detection.services.inference import predict
# from detection.services.preprocess import preprocess
# from detection.services.model_loader import DEVICE, load_model
# from detection.services.gradcam import generate_cam
# from core.utils.entropy import calculate_entropy


# resnet18 = load_model()  

# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.response import Response
# from rest_framework import status
# from django.contrib.auth import get_user_model
# import torch

# User = get_user_model()

class DetectionResultViewSet:
    pass
    # queryset = DetectionResult.objects.all()
    # serializer_class = DetectionResultSerializer
    # parser_classes = [MultiPartParser, FormParser]  

    # def create(self, request, *args, **kwargs):
    #     images = request.FILES.getlist("images")
    #     if not images:
    #         single = request.FILES.get("image")
    #         if single:
    #             images = [single]

    #     print("NUM IMAGES:", len(images))

    #     if not images:
    #         return Response(
    #             {"error": "At least one image is required"},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )

    #     if len(images) > 20:
    #         return Response(
    #             {"error": "Max 20 images allowed"},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )

    #     tensors = []
    #     instances = []
    #     entropy_values = []

    #     for image in images:
    #         instance = DetectionResult.objects.create(
    #             user=User.objects.first(),
    #             image=image,
    #             status="processing"
    #         )

    #         tensor, face_rgb = preprocess(instance.image.path)

    #         entropy = calculate_entropy(face_rgb)

    #         tensors.append(tensor)
    #         instances.append(instance)
    #         entropy_values.append(entropy)

    #     batch_tensor = torch.stack(tensors).to(DEVICE)

    #     with torch.no_grad():
    #         output = resnet18(batch_tensor)
    #         probs = torch.softmax(output, dim=1)

    #     results = []

    #     for i, instance in enumerate(instances):
    #         confidence, pred = torch.max(probs[i], dim=0)

    #         entropy = entropy_values[i]

    #         if entropy < 2.0:
    #             confidence = confidence * 0.85

    #         instance.confidence_score = round(float(confidence.item()) * 100, 2)
    #         instance.is_fake = bool(pred.item())
    #         instance.status = "completed"

    #         heatmap_filename = f"heatmap_{instance.id}.jpg"
    #         heatmap_path = os.path.join(
    #             settings.MEDIA_ROOT, "heatmaps", heatmap_filename
    #         )

    #         generate_cam(
    #             model=resnet18,
    #             tensor=tensors[i].unsqueeze(0).to(DEVICE),
    #             target_layer=resnet18.layer4[-1],
    #             target_class=int(pred.item()),
    #             save_path=heatmap_path
    #         )

    #         instance.heatmap = f"heatmaps/{heatmap_filename}"
    #         instance.save()

    #         results.append({
    #             "id": instance.id,
    #             "image": request.build_absolute_uri(instance.image.url),
    #             "confidence": f"{instance.confidence_score}%",
    #             "is_fake": instance.is_fake,
    #             "heatmap": request.build_absolute_uri(
    #                 f"{settings.MEDIA_URL}{instance.heatmap}"
    #             ),
    #             "entropy": entropy_values[i]
    #         })

    #     return Response(results, status=status.HTTP_201_CREATED)
    