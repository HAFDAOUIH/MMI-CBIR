import axios from './api'; // assuming api.js exports axios instance

export const fetchImagesByCategory = async (category) => {
    const res = await axios.get(`/api/images/${category}`);
    return res.data; // expecting { images: [...] }
};
