import React from 'react';
import axios from '../services/api'; // Your axios instance

function ImageCard({ image, onDeleteSuccess, onEditClick }) {
    const imageUrl = `http://localhost:5000/uploads/${image.filepath.split('/').pop()}?${new Date().getTime()}`;

    const handleDelete = async () => {
        try {
            // Call the delete API endpoint
            const response = await axios.delete(`/api/images/delete/${image._id}`);
            if (response.status === 200) {
                onDeleteSuccess(image._id); // Pass image ID for successful deletion
            }
        } catch (error) {
            alert('Failed to delete the image');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = image.filename;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error downloading the image:', error);
            alert('Failed to download the image');
        }
    };

    const handleEdit = () => {
        // Trigger edit function when clicking the Edit button
        onEditClick(imageUrl);
    };

    return (
        <div style={{
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
        }}>
            <img
                src={imageUrl}
                alt={image.filename}
                style={{ width: '100%', borderRadius: '8px', transition: 'transform 0.3s' }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            />
            <p>{image.filename}</p>

            <div style={{ marginTop: '10px' }}>
                <button
                    onClick={handleDownload}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    Download
                </button>
                <button
                    onClick={handleDelete}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Delete
                </button>
                <button
                    onClick={handleEdit}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: '10px',
                    }}
                >
                    Edit
                </button>
            </div>
        </div>
    );
}

export default ImageCard;
