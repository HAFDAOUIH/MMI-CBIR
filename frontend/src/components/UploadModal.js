import React, { useState } from 'react';
import axios from '../services/api'; // Axios instance

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [category, setCategory] = useState('');

    const categories = ['Grass', 'Field', 'Industry', 'RiverLake', 'Forest', 'Resident', 'Parkin']; // Predefined categories

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handleUpload = async () => {
        if (!category || selectedFiles.length === 0) {
            alert('Please select files and a category!');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('images', selectedFiles[i]);
        }
        formData.append('category', category);

        try {
            // Log the form data to the console to inspect it before sending it
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);  // Check that the data is correct
            }

            // Send the POST request to the backend
            const response = await axios.post('/api/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', response.data);  // Inspect response from backend
            alert('Images uploaded successfully!');
            onUploadSuccess(); // Refresh images in the gallery
            onClose(); // Close the modal
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload images');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)'
        }}>
            <div style={{
                background: '#fff',
                margin: '100px auto',
                padding: '20px',
                width: '300px',
                borderRadius: '8px'
            }}>
                <h3>Upload Images</h3>
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'block', marginBottom: '10px' }}
                />

                {/* Dropdown to select the category */}
                <select
                    value={category}
                    onChange={handleCategoryChange}
                    style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                >
                    <option value="">Select Category</option>
                    {categories.map((categoryOption, index) => (
                        <option key={index} value={categoryOption}>{categoryOption}</option>
                    ))}
                </select>

                <button onClick={handleUpload} style={{ marginRight: '10px' }}>Upload</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default UploadModal;
