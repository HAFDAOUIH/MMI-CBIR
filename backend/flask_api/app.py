import cv2
import numpy as np
import logging
from flask import Flask, request, jsonify
from sklearn.cluster import KMeans

app = Flask(__name__)

# Setup logger
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def calculate_color_histogram(image):
    try:
        logger.debug("Calculating color histogram...")
        hist = cv2.calcHist([image], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        hist = hist.flatten()

        # Convert the histogram to a list of numbers (not strings)
        hist = hist.tolist()
        logger.debug(f"Color histogram calculated: {hist[:5]}...")  # Debugging by printing first 5 values
        return hist
    except Exception as e:
        logger.error(f"Error calculating color histogram: {e}")
        return []

def calculate_dominant_colors(image, k=5):
    """
    This function calculates the dominant colors of an image using K-means clustering.

    :param image: The image from which to calculate the dominant colors
    :param k: The number of dominant colors to extract
    :return: A list of dominant colors as RGB tuples
    """
    try:
        logger.debug(f"Calculating dominant colors for image with shape: {image.shape}")

        # Convert the image to RGB (if it's in BGR, which is OpenCV default)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Reshape the image to a 2D array where each row is a pixel and the columns are the RGB values
        reshaped_image = image_rgb.reshape((-1, 3))

        # Apply K-means clustering to find the dominant colors
        kmeans = KMeans(n_clusters=k, random_state=42).fit(reshaped_image)

        # Extract the centroids of the clusters (these are the dominant colors)
        dominant_colors = kmeans.cluster_centers_.astype(int)  # Ensure we get integer values for RGB

        logger.debug(f"Dominant colors calculated: {dominant_colors}")

        # Convert to list of RGB values
        dominant_colors_list = [tuple(color) for color in dominant_colors]

        return dominant_colors_list
    except Exception as e:
        logger.error(f"Error calculating dominant colors: {e}")
        return []


def calculate_gabor_texture(image):
    try:
        logger.debug(f"Image shape before Gabor Texture calculation: {image.shape}")

        # Convert to grayscale before applying Gabor
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        if gray_image is None or gray_image.size == 0:
            logger.error("Error: Grayscale image is empty.")
            return []

        # Apply Gabor filter - Experiment with kernel size and other parameters
        gabor_kernel = cv2.getGaborKernel((21, 21), 5, 1, 10, 0.5, 0, ktype=cv2.CV_32F)
        gabor = cv2.filter2D(gray_image, cv2.CV_8UC3, gabor_kernel)

        if gabor is None or gabor.size == 0:
            logger.error("Error: Gabor texture is empty.")
            return []

        logger.debug(f"Gabor texture calculated with {len(gabor.flatten())} values.")
        return gabor.flatten().tolist()
    except Exception as e:
        logger.error(f"Error in calculating Gabor texture: {e}")
        return []

def calculate_hu_moments(image):
    try:
        logger.debug(f"Image shape before Hu Moments calculation: {image.shape}")

        # Convert to grayscale
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        logger.debug(f"Grayscale image shape: {gray_image.shape}")

        if gray_image is None or gray_image.size == 0:
            logger.error("Error: Grayscale image is empty.")
            return []

        moments = cv2.moments(gray_image)
        hu_moments = cv2.HuMoments(moments)

        if hu_moments is None:
            logger.error("Error: Hu moments are empty.")
            return []

        hu_moments_list = [moment[0] for moment in hu_moments]
        logger.debug(f"Hu moments calculated: {hu_moments_list}")
        return hu_moments_list
    except Exception as e:
        logger.error(f"Error in calculating Hu moments: {e}")
        return []

@app.route('/api/calculate_descriptors', methods=['POST'])
def calculate_descriptors():
    image_path = request.json['image_path']
    logger.debug(f"Fetching descriptors for image: {image_path}")

    # Read the image
    image = cv2.imread(image_path)
    if image is None:
        logger.error(f"Error: Could not read image from path {image_path}")
        return jsonify({'error': 'Invalid image path'}), 400

    logger.debug(f"Image loaded successfully with shape: {image.shape}")

    # Calculate descriptors
    histogram = calculate_color_histogram(image)
    dominant_colors = calculate_dominant_colors(image)
    texture = calculate_gabor_texture(image)  # Gabor texture calculation
    hu_moments = calculate_hu_moments(image)  # Hu moments calculation

    # Return the descriptors as a JSON response
    return jsonify({
        'histogram': histogram,
        'dominant_colors': dominant_colors,
        'textureDescriptors': texture,
        'huMoments': hu_moments
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
