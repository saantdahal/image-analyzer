import torch
from .model_loader import load_model, DEVICE
from detection.services.preprocess import preprocess as _preprocess

def predict(image_path: str = None, tensor=None):
    """
    Run fake/real classification.
 
    Args:
        image_path: path to image file. Used if tensor is not supplied.
        tensor:     pre-computed [C,H,W] tensor (e.g. from preprocess()).
                    Pass this from the signal to avoid running preprocess twice.
 
    Returns:
        {"is_fake": bool, "confidence": float (0-1)}
    """
    if tensor is None:
        if image_path is None:
            raise ValueError("Either image_path or tensor must be provided")
        tensor, _ = _preprocess(image_path)
 
    model = load_model()
    batch = tensor.unsqueeze(0).to(DEVICE)
 
    with torch.no_grad():
        output = model(batch)
        probs = torch.softmax(output, dim=1)
 
    confidence, predicted = torch.max(probs, 1)
    return {
        "is_fake": bool(predicted.item()),
        "confidence": float(confidence.item()),
    }
