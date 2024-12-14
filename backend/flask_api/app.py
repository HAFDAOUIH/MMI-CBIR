from flask import Flask, request, jsonify
import cv2
import numpy as np
from sklearn.cluster import KMeans

app = Flask(__name__)

def calculate_color_histogram(image):
    hist = cv2.calcHist([image], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
    return hist.flatten().tolist()

def calculate_dominant_colors(image, k=5):
    reshaped_image = image.reshape((-1, 3))
    kmeans = KMeans(n_clusters=k).fit(reshaped_image)
    return kmeans.cluster_centers_.tolist()

def calculate_gabor_texture(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gabor_kernel = cv2.getGaborKernel((21, 21), 5, 1, 10, 0.5, 0, ktype=cv2.CV_32F)
    gabor = cv2.filter2D(gray, cv2.CV_8UC3, gabor_kernel)
    return gabor.flatten().tolist()

def calculate_hu_moments(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    moments = cv2.moments(gray)
    hu_moments = cv2.HuMoments(moments)
    return [moment[0] for moment in hu_moments]

@app.route('/api/calculate_descriptors', methods=['POST'])
def calculate_descriptors():
    image_path = request.json['image_path']
    image = cv2.imread(image_path)

    if image is None:
        return jsonify({'error': 'Invalid image path'}), 400

    histogram = calculate_color_histogram(image)
    dominant_colors = calculate_dominant_colors(image)

    return jsonify({
        'histogram': histogram,
        'dominant_colors': dominant_colors,
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
