import axios from './api'; // Axios instance

// Fetch images by category
export const fetchImagesByCategory = async (category) => {
    try {
        const response = await axios.get(`/api/images/${category}`);
        return response.data; // Return images for the gallery
    } catch (error) {
        console.error('Error fetching images by category:', error);
        return { images: [] }; // Return empty array if an error occurs
    }
};

// Fetch descriptors by file path
export const fetchImageDescriptors = async (imagePath) => {
    try {
        const response = await axios.post('/api/calculate_descriptors', { image_path: imagePath });
        return response.data; // Return descriptors (histograms, dominantColors, etc.)
    } catch (error) {
        console.error('Error fetching descriptors:', error.message);
        throw error;
    }
};

// Fetch descriptors by image ID
export const getImageDescriptors = async (imageId) => {
    try {
        console.log("Fetching descriptors for image path:", imageId); // Log the imagePath
        const response = await axios.get(`/api/images/descriptors/${imageId}`);
        console.log("Descriptors received from backend:", response.data); // Log backend response
        return response.data;
    } catch (error) {
        console.error("Error fetching descriptors:", error.message);
        throw error;
    }
};

export const getSimilarImages = async (imageId) => {
    try {
        const response = await axios.get(`/api/images/similar/${imageId}`);
        return response.data; // Return the response containing similar images
    } catch (error) {
        console.error('Error fetching similar images:', error.message);
        throw error;
    }
};
