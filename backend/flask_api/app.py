import cv2
import numpy as np
import logging
from flask import Flask, request, jsonify
from sklearn.cluster import KMeans
import os
app = Flask(__name__)

class ExcludeLibraryLogs(logging.Filter):
    def filter(self, record):
        return not (
                "InotifyEvent" in record.getMessage() or
                "/__pycache__/" in record.getMessage()
        )

# Setup logger
handler = logging.StreamHandler()
handler.addFilter(ExcludeLibraryLogs())

logging.basicConfig(
    level=logging.INFO,  # Default log level
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[handler]
)

logger = logging.getLogger(__name__)

logger.info("Logging setup complete.")

def calculate_color_histogram(image):
    """
    Calculate and return the RGB histograms of the image.
    """
    try:
        logger.debug("Calculating RGB histograms...")

        # Split the image into its Blue, Green, and Red channels
        chans = cv2.split(image)
        colors = ("blue", "green", "red")

        histograms = {}
        for chan, color in zip(chans, colors):
            # Calculate histogram for each channel
            hist = cv2.calcHist([chan], [0], None, [256], [0, 256])
            if hist is None or hist.size == 0:
                logger.error(f"Histogram for {color} channel is empty.")
                histograms[color] = [0] * 256
            else:
                histograms[color] = hist.flatten().tolist()

        logger.debug(f"RGB histograms calculated: { {k: v[:5] for k, v in histograms.items()} }")
        return histograms
    except Exception as e:
        logger.error(f"Error calculating RGB histograms: {e}")
        return {"blue": [0] * 256, "green": [0] * 256, "red": [0] * 256}

def calculate_dominant_colors(image, k=5):
    try:
        logger.debug("Calculating dominant colors...")
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        reshaped_image = image_rgb.reshape((-1, 3))
        kmeans = KMeans(n_clusters=k, random_state=42).fit(reshaped_image)
        dominant_colors = kmeans.cluster_centers_.astype(int).tolist()
        return dominant_colors
    except Exception as e:
        logger.error(f"Error calculating dominant colors: {e}")
        return []

def calculate_gabor_texture(image):
    try:
        logger.debug("Calculating Gabor texture...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gabor_kernel = cv2.getGaborKernel((21, 21), 5, 1, 10, 0.5, 0, ktype=cv2.CV_32F)
        gabor = cv2.filter2D(gray_image, cv2.CV_8UC3, gabor_kernel)
        return gabor.flatten().tolist()
    except Exception as e:
        logger.error(f"Error calculating Gabor texture: {e}")
        return []

def calculate_hu_moments(image):
    try:
        logger.debug("Calculating Hu moments...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        moments = cv2.moments(gray_image)
        hu_moments = cv2.HuMoments(moments).flatten().tolist()
        return hu_moments
    except Exception as e:
        logger.error(f"Error calculating Hu moments: {e}")
        return []

@app.route('/api/calculate_descriptors', methods=['POST'])
def calculate_descriptors():
    try:
        # Log request data
        image_path = request.json.get('image_path')
        if not image_path:
            logger.error("No image_path provided in the request.")
            return jsonify({'error': 'image_path is required'}), 400

        logger.debug(f"Received image_path: {image_path}")

        # Attempt to read the image
        image = cv2.imread(image_path)
        if image is None:
            logger.error(f"Unable to read the image at path: {image_path}")
            return jsonify({'error': f'Unable to read image at path: {image_path}'}), 400

        logger.debug(f"Image loaded successfully: {image.shape}")

        # Calculate descriptors
        histogram = calculate_color_histogram(image)
        dominant_colors = calculate_dominant_colors(image)
        texture = calculate_gabor_texture(image)
        hu_moments = calculate_hu_moments(image)

        histogram = {color: [float(value) for value in hist] for color, hist in histogram.items()}
        dominant_colors = [list(map(int, color)) for color in dominant_colors]
        texture = [float(value) for value in texture]
        hu_moments = [float(moment) for moment in hu_moments]
        # Log results
        logger.debug(f"Descriptors calculated: histogram={len(histogram)}, dominant_colors={dominant_colors}, texture={len(texture)}, hu_moments={hu_moments}")

        # Return the results
        return jsonify({
            'histograms': histogram,
            'dominantColors': dominant_colors,
            'textureDescriptors': texture,
            'huMoments': hu_moments
        })

    except Exception as e:
        logger.error(f"Error in descriptor calculation: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
