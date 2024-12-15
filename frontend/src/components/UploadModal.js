import React, { useState } from 'react';
import axios from '../services/api';

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [category, setCategory] = useState('Forest');
    const [isUploading, setIsUploading] = useState(false); // Add loading state

    const categories = ['Grass', 'Field', 'Industry', 'RiverLake', 'Forest', 'Resident', 'Parking'];

    // Early return if modal is not open
    if (!isOpen) return null;

    const handleFileChange = (e) => {
        // Convert FileList to array
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handleUpload = async () => {
        if (!category || selectedFiles.length === 0) {
            alert('Please select files and a category!');
            return;
        }

        setIsUploading(true); // Set uploading state

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });
        formData.append('category', category);

        try {
            const response = await axios.post('/api/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUploadSuccess();
            setIsUploading(false); // Reset uploading state
            onClose();
            // add for handle open new page when downloading
            window.location.href = `/image-detail/${response.data.images[0]._id}`;

        } catch (err) {
            console.error('Upload failed:', err.response?.data || err.message);
            alert('Failed to upload images');
            setIsUploading(false); // Reset uploading state
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{
                background: '#fff',
                padding: '20px',
                width: '400px',
                borderRadius: '8px',
                boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
            }}>
                <h3>Upload Images</h3>
                <input
                    type="file"
                    name="images"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <select
                    name="category"
                    value={category}
                    onChange={handleCategoryChange}
                    style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleUpload}
                    style={{ marginRight: '10px', backgroundColor: '#ff6347', padding: '8px 16px', color: 'white' }}
                    disabled={isUploading} // Disable button when uploading
                >
                    {isUploading ? 'Uploading...' : 'Upload'}
                </button>
                <button onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
            </div>
        </div>
    );
}

export default UploadModal;
