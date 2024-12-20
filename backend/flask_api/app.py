import cv2
import numpy as np
import logging
from flask import Flask, request, jsonify
from sklearn.cluster import KMeans
import os
from skimage.feature import graycomatrix, graycoprops
from flask import send_from_directory
import uuid

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
        _, thresholded = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

        contours, _ = cv2.findContours(thresholded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            logger.error("No contours found in the image.")
            return [0] * 7, image

        largest_contour = max(contours, key=cv2.contourArea, default=None)
        if cv2.contourArea(largest_contour) == 0:
            logger.error("Largest contour has zero area.")
            return [0] * 7, image

        contour_image = image.copy()
        cv2.drawContours(contour_image, [largest_contour], -1, (0, 0, 255), 3)

        moments = cv2.moments(largest_contour)
        if moments["m00"] == 0:
            logger.error("Moments m00 is zero; cannot calculate Hu moments.")
            return [0] * 7, contour_image

        hu_moments = cv2.HuMoments(moments).flatten().tolist()
        logger.debug(f"Hu Moments: {hu_moments}")

        return hu_moments, contour_image
    except Exception as e:
        logger.error(f"Error calculating Hu moments with contours: {e}")
        return [0] * 7, image


def calculate_gabor_texture_with_regions(image):
    try:
        logger.debug("Calculating Gabor texture with region highlights...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Define Gabor kernels for multiple orientations and scales
        orientations = [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4]  # Directions
        frequencies = [0.05, 0.1, 0.3]  # Scales (frequencies)

        gabor_responses = []
        highlighted_image = image.copy()

        for theta in orientations:
            for frequency in frequencies:
                # Generate Gabor kernel
                gabor_kernel = cv2.getGaborKernel((21, 21), 4, theta, frequency, 0.5, 0, ktype=cv2.CV_32F)

                # Apply Gabor filter
                filtered = cv2.filter2D(gray_image, cv2.CV_8UC3, gabor_kernel)
                gabor_responses.append(filtered)

                # Normalize and threshold to detect regions
                normalized = cv2.normalize(filtered, None, 0, 255, cv2.NORM_MINMAX)
                _, thresholded = cv2.threshold(normalized, 200, 255, cv2.THRESH_BINARY)

                # Find and draw contours on the highlighted image
                contours, _ = cv2.findContours(thresholded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cv2.drawContours(highlighted_image, contours, -1, (0, 255, 0), 2)

        # Flatten descriptors for numerical features
        combined_gabor_features = [filtered.mean() for filtered in gabor_responses]

        logger.debug(f"Gabor texture descriptors: {combined_gabor_features[:10]}...")

        return combined_gabor_features, highlighted_image
    except Exception as e:
        logger.error(f"Error calculating Gabor texture with regions: {e}")
        return [], image




def calculate_edge_histogram(image):
    try:
        logger.debug("Calculating Edge Histogram Descriptor...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Use Sobel edge detection
        edges_x = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
        edges_y = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)

        # Compute magnitude of gradients
        magnitude = cv2.magnitude(edges_x, edges_y)

        # Quantize the edge magnitude into a histogram
        hist, _ = np.histogram(magnitude, bins=10, range=(0, 255))
        return hist.tolist()
    except Exception as e:
        logger.error(f"Error calculating Edge Histogram Descriptor: {e}")
        return []

def calculate_glcm_features(image):
    try:
        logger.debug("Calculating GLCM features...")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Compute GLCM matrix
        glcm = graycomatrix(gray_image, distances=[1], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4], levels=256, symmetric=True, normed=True)

        # Extract properties
        contrast = graycoprops(glcm, 'contrast').flatten().tolist()
        dissimilarity = graycoprops(glcm, 'dissimilarity').flatten().tolist()
        homogeneity = graycoprops(glcm, 'homogeneity').flatten().tolist()
        energy = graycoprops(glcm, 'energy').flatten().tolist()
        correlation = graycoprops(glcm, 'correlation').flatten().tolist()

        return {
            "contrast": contrast,
            "dissimilarity": dissimilarity,
            "homogeneity": homogeneity,
            "energy": energy,
            "correlation": correlation
        }
    except Exception as e:
        logger.error(f"Error calculating GLCM features: {e}")
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
        glcm_features = calculate_glcm_features(image)
        edge_histogram = calculate_edge_histogram(image)

        logger.info(f"GLCM Features: {glcm_features}")
        logger.info(f"Edge Histogram: {edge_histogram}")

        unique_id = str(uuid.uuid4())[:8]  # Generate a short unique ID
        texture_image_filename = f"texture_highlighted_{uuid.uuid4().hex}.png"
        hu_image_filename = f"hu_highlighted_{uuid.uuid4().hex}.png"

        # Save images in the static folder
        texture_image_path = os.path.join("static", texture_image_filename)
        hu_image_path = os.path.join("static", hu_image_filename)
        cv2.imwrite(texture_image_path, texture_image)
        cv2.imwrite(hu_image_path, hu_image)

        return jsonify({
            'histograms': histogram,
            'dominantColors': dominant_colors,
            'textureDescriptors': texture_descriptors,
            'huMoments': hu_moments,
            'textureImage': f"/static/{texture_image_filename}",
            'huImage': f"/static/{hu_image_filename}",
            'glcmFeatures': glcm_features,
            'edgeHistogram': edge_histogram
        })

    except Exception as e:
        logger.error(f"Error in descriptor calculation: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/relevance_feedback', methods=['POST'])
def relevance_feedback():
    try:
        data = request.json
        query_descriptors = data.get('query_descriptors')
        relevant_images = data.get('relevant_images', [])
        non_relevant_images = data.get('non_relevant_images', [])

        # Validation
        if not query_descriptors:
            return jsonify({'error': 'Query descriptors are required'}), 400
        if not relevant_images and not non_relevant_images:
            return jsonify({'error': 'Relevant or non-relevant images must be provided'}), 400

        # Convert to numpy arrays
        query_descriptors = np.array(query_descriptors)
        relevant_descriptors = np.array(relevant_images) if relevant_images else np.zeros_like(query_descriptors)
        non_relevant_descriptors = np.array(non_relevant_images) if non_relevant_images else np.zeros_like(query_descriptors)

        # Calculate new query descriptors using QPM
        alpha = float(data.get('alpha', 1.0))
        beta = float(data.get('beta', 0.5))
        updated_query = query_descriptors + alpha * relevant_descriptors.mean(axis=0)
        if len(non_relevant_images) > 0:
            updated_query -= beta * non_relevant_descriptors.mean(axis=0)

        return jsonify({'new_query_descriptors': updated_query.tolist()})
    except Exception as e:
        logger.error(f"Error in relevance feedback: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)



if __name__ == '__main__':
    app.run(debug=True, port=5001)
