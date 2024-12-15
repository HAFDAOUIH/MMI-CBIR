import React, { useState } from 'react';
import axios from '../services/api'; // Your axios instance
import DescriptorModal from './DescriptorModal'; // Import the modal for descriptors
import './ImageCard.css'; // Import external CSS file for styling

function ImageCard({ image, onDeleteSuccess, onEditClick }) {
    const [showDescriptors, setShowDescriptors] = useState(false); // State to control the modal
    const imageUrl = `http://localhost:5000/uploads/${image.filepath.split('/').pop()}?${new Date().getTime()}`;

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`/api/images/delete/${image._id}`);
            if (response.status === 200) {
                onDeleteSuccess(image._id);
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
        onEditClick(imageUrl);
    };

    const handleImageClick = () => {
        setShowDescriptors(true);
    };

    return (
        <div className="image-card-container">
            <img
                src={imageUrl}
                alt={image.filename}
                className="image-card-image"
                onClick={handleImageClick} // Show descriptors on click
            />
            <p className="image-card-filename">{image.filename}</p>

            <div className="image-card-buttons">
                <button onClick={handleDownload} className="button-download">
                    Download
                </button>
                <button onClick={handleDelete} className="button-delete">
                    Delete
                </button>
                <button onClick={handleEdit} className="button-edit">
                    Edit
                </button>
            </div>

            {/* Descriptor Modal */}
            {showDescriptors && (
                <DescriptorModal
                    show={showDescriptors}
                    onHide={() => setShowDescriptors(false)}
                    imageId={image._id}
                />
            )}
        </div>
    );
}

export default ImageCard;
