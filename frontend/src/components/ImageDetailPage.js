import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getImageDescriptors } from '../services/imageService';
import DescriptorModal from './DescriptorModal';

const ImageDetailPage = () => {
    const { id } = useParams(); // Get the image ID from the URL
    const [image, setImage] = useState(null); // Holds image details
    const [descriptors, setDescriptors] = useState(null); // Holds descriptors data
    const [isDescriptorModalOpen, setIsDescriptorModalOpen] = useState(false); // Modal state
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchImageData = async () => {
            try {
                setIsLoading(true);

                // Fetch image descriptors from the backend
                const descriptorsData = await getImageDescriptors(id);
                setDescriptors(descriptorsData);

                // Mock image details for now (Adjust if backend provides image details)
                setImage({
                    filename: `Image ${id}`,
                    filepath: descriptorsData.textureImage || '', // Replace with actual path
                });

            } catch (err) {
                console.error('Error fetching image data:', err.message);
                setError('Failed to load image details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchImageData();
    }, [id]);

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h3>Loading...</h3>
                <p>Please wait while we load the image details.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
                <h3>Error</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (!image || !descriptors) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h3>No Data</h3>
                <p>Image details or descriptors could not be found.</p>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>{image.filename}</h1>
            <img
                src={`http://localhost:5000/uploads/${image.filepath.split('/').pop()}`}
                alt={image.filename}
                style={{ width: '50%', borderRadius: '8px', boxShadow: '0px 4px 6px rgba(0,0,0,0.2)' }}
            />
            <div style={{ marginTop: '20px' }}>
                <button onClick={() => setIsDescriptorModalOpen(true)} style={buttonStyle}>
                    View Descriptors
                </button>
                <button onClick={() => downloadImage(image)} style={buttonStyle}>
                    Download
                </button>
                <button style={buttonStyle}>Edit</button>
                <button style={deleteButtonStyle}>Delete</button>
            </div>

            {isDescriptorModalOpen && (
                <DescriptorModal
                    show={isDescriptorModalOpen}
                    onHide={() => setIsDescriptorModalOpen(false)}
                    imageId={id}
                    descriptors={descriptors}
                />
            )}
        </div>
    );
};

// Utility function to handle image download
const downloadImage = (image) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/uploads/${image.filepath.split('/').pop()}`;
    link.download = image.filename;
    link.click();
};

// Inline button styles for consistency
const buttonStyle = {
    padding: '10px 15px',
    margin: '5px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
};

const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f44336',
};

export default ImageDetailPage;
