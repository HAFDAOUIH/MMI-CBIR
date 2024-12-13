import axios from './api';  // Axios instance

export const fetchImagesByCategory = async (category) => {
    try {
        // Make sure the category is being passed correctly to the backend route
        const response = await axios.get(`/api/images/${category}`);
        return response.data;  // Return the data for image gallery
    } catch (error) {
        console.error('Error fetching images by category:', error);
        return { images: [] };  // Return empty array if error occurs
    }
};

export const fetchImageDescriptors = async (imageId) => {
    try {
        // Ensure this matches the backend route for descriptors
        const response = await axios.get(`/api/images/descriptors/${imageId}`);
        return response.data; // Return descriptor data
    } catch (error) {
        console.error('Error fetching descriptors for image:', error);
        throw error; // Rethrow error for frontend handling
    }
};
