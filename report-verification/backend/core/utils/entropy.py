import cv2
import numpy as np

def calculate_entropy(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    histogram = cv2.calcHist([gray], [0], None, [256], [0, 256])
    histogram = histogram / histogram.sum()

    entropy = -np.sum(histogram * np.log2(histogram + 1e-7))

    return float(entropy)
