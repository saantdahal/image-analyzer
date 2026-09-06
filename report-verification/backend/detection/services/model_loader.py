import torch
from torchvision import models
from collections import OrderedDict
from django.conf import settings
import os

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL_PATH = os.path.join(settings.ML_MODELS_DIR, "DenseNet121.pth")

_model = None 

print("Loading model from:", MODEL_PATH)
print("Exists:", os.path.exists(MODEL_PATH))

def load_model():
    global _model

    if _model is not None:
        return _model
    model = models.densenet121(weights=None)
    in_features = model.classifier.in_features
    model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(0.3),
            torch.nn.Linear(in_features, 2)
        )

    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)

    new_state = OrderedDict()
    for k, v in state_dict.items():
        new_state[k.replace("module.", "")] = v

    model.load_state_dict(new_state)
    model.to(DEVICE).eval()

    _model = model
    return model