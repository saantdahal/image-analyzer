import cv2
import numpy as np

def apply_edge_detection(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    edges = cv2.Canny(gray, 100, 200)

    edges_3ch = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)

    return edges_3ch
