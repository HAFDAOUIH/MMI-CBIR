import cv2
import numpy as np
import logging
from flask import Flask, request, jsonify
from sklearn.cluster import KMeans
import os
from skimage.feature import greycomatrix, greycoprops

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

def calculate_hu_moments_with_contours(image):
    try:
        logger.debug("Calculating Hu moments with contour overlay...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, thresholded = cv2.threshold(gray_image, 128, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresholded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Draw largest contour
        largest_contour = max(contours, key=cv2.contourArea, default=None)
        contour_image = image.copy()
        if largest_contour is not None:
            cv2.drawContours(contour_image, [largest_contour], -1, (0, 0, 255), 3)

        # Calculate Hu moments for the largest contour
        moments = cv2.moments(largest_contour)
        hu_moments = cv2.HuMoments(moments).flatten().tolist()
        return hu_moments, contour_image
    except Exception as e:
        logger.error(f"Error calculating Hu moments with contours: {e}")
        return [], image

def calculate_gabor_texture_with_regions(image):
    try:
        logger.debug("Calculating Gabor texture with region highlights...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gabor_kernel = cv2.getGaborKernel((21, 21), 5, 1, 10, 0.5, 0, ktype=cv2.CV_32F)
        gabor = cv2.filter2D(gray_image, cv2.CV_8UC3, gabor_kernel)

        # Normalize Gabor output to [0, 255]
        gabor_normalized = cv2.normalize(gabor, None, 0, 255, cv2.NORM_MINMAX)
        _, thresholded = cv2.threshold(gabor_normalized, 128, 255, cv2.THRESH_BINARY)

        # Find contours
        contours, _ = cv2.findContours(thresholded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        highlighted_image = image.copy()
        cv2.drawContours(highlighted_image, contours, -1, (0, 255, 0), 2)

        return gabor.flatten().tolist(), highlighted_image
    except Exception as e:
        logger.error(f"Error calculating Gabor texture with regions: {e}")
        return [], image

def calculate_edge_density(image):
    try:
        logger.debug("Calculating Edge Density...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray_image, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size
        return edge_density
    except Exception as e:
        logger.error(f"Error calculating Edge Density: {e}")
        return 0.0

def calculate_haralick_features(image):
    try:
        logger.debug("Calculating Haralick Features...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        glcm = greycomatrix(gray_image, distances=[1], angles=[0], symmetric=True, normed=True)
        features = {
            'contrast': greycoprops(glcm, 'contrast')[0, 0],
            'dissimilarity': greycoprops(glcm, 'dissimilarity')[0, 0],
            'homogeneity': greycoprops(glcm, 'homogeneity')[0, 0],
            'energy': greycoprops(glcm, 'energy')[0, 0],
            'correlation': greycoprops(glcm, 'correlation')[0, 0]
        }
        return features
    except Exception as e:
        logger.error(f"Error calculating Haralick Features: {e}")
        return {}

@app.route('/api/calculate_descriptors', methods=['POST'])
def calculate_descriptors():
    try:
        image_path = request.json.get('image_path')
        if not image_path:
            return jsonify({'error': 'image_path is required'}), 400

        image = cv2.imread(image_path)
        if image is None:
            return jsonify({'error': f'Unable to read image at path: {image_path}'}), 400

        histogram = calculate_color_histogram(image)
        dominant_colors = calculate_dominant_colors(image)
        texture_descriptors, texture_image = calculate_gabor_texture_with_regions(image)
        hu_moments, hu_image = calculate_hu_moments_with_contours(image)

        # Save images for texture and Hu moments highlights
        texture_image_path = os.path.join("static", "texture_highlighted.png")
        hu_image_path = os.path.join("static", "hu_highlighted.png")
        cv2.imwrite(texture_image_path, texture_image)
        cv2.imwrite(hu_image_path, hu_image)

        return jsonify({
            'histograms': histogram,
            'dominantColors': dominant_colors,
            'textureDescriptors': texture_descriptors,
            'huMoments': hu_moments,
            'textureImage': texture_image_path,
            'huImage': hu_image_path
        })

    except Exception as e:
        logger.error(f"Error in descriptor calculation: {e}")
        return jsonify({'error': 'Internal server error'}), 500
if __name__ == '__main__':
    app.run(debug=True, port=5001)
