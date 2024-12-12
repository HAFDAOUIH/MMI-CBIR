import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',  // Backend URL (adjust if necessary)
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export default axiosInstance;
