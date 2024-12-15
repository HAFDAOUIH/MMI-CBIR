import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getImageDescriptors, getSimilarImages } from '../services/imageService';
import DescriptorModal from './DescriptorModal';
import Navbar from './Navbar';
import Footer from './Footer';

const ImageDetailPage = () => {
    const { id } = useParams(); // Get the image ID from the URL
    const [image, setImage] = useState(null); // Holds image details
    const [descriptors, setDescriptors] = useState(null); // Holds descriptors data
    const [isDescriptorModalOpen, setIsDescriptorModalOpen] = useState(false); // Modal state
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [similarImages, setSimilarImages] = useState([]);

    useEffect(() => {
        const fetchImageData = async () => {
            try {
                setIsLoading(true);

                // Fetch image details and descriptors
                const descriptorsData = await getImageDescriptors(id);
                setImage({
                    filename: descriptorsData.filename,
                    filepath: descriptorsData.filepath,
                });
                setDescriptors(descriptorsData);

                // Fetch similar images
                const similarImagesData = await getSimilarImages(id);
                setSimilarImages(similarImagesData.similarImages);
            } catch (err) {
                console.error('Error fetching image details or similar images:', err.message);
                setError('Failed to load image details or similar images.');
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

    if (!image) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h3>No Data</h3>
                <p>Image details could not be found.</p>
            </div>
        );
    }

    // Utility function to download the image
    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = `http://localhost:5000/${image.filepath}`;
        link.download = image.filename;
        link.click();
    };

    const handleDelete = () => {
        alert('Delete functionality is not implemented in this demo.');
    };

    const handleEdit = () => {
        alert('Edit functionality is not implemented in this demo.');
    };

    return (
        <div>
            {/* Navbar */}
            <Navbar />

            {/* Main Image Section */}
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h1 style={{ marginBottom: '10px' }}>{image.filename}</h1>
                <img
                    src={`http://localhost:5000/uploads/${image.filepath.split('/').pop()}`}                    alt={image.filename}
                    style={{
                        width: '50%',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
                    }}
                />

                {/* Buttons Section */}
                <div style={{ marginTop: '20px' }}>
                    <button onClick={() => setIsDescriptorModalOpen(true)} style={buttonStyle}>
                        View Descriptors
                    </button>

                </div>

                {/* Descriptor Modal */}
                {isDescriptorModalOpen && (
                    <DescriptorModal
                        show={isDescriptorModalOpen}
                        onHide={() => setIsDescriptorModalOpen(false)}
                        imageId={id}
                        descriptors={descriptors}
                    />
                )}

                {/* Similar Images Section */}
                <div style={{marginTop: '40px'}}>
                    <h2>Similar Images</h2>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center', // Center horizontally
                            alignItems: 'center',     // Center vertically (optional)
                            flexWrap: 'wrap',         // Allow items to wrap to the next line
                            gap: '20px',              // Add space between items
                            padding: '10px',
                        }}
                    >
                        {similarImages.map((img) => (
                            <div key={img._id} style={{textAlign: 'center'}}> {/* Ensure text is centered */}
                                <img
                                    src={`http://localhost:5000/uploads/${img.filepath.split('/').pop()}`}
                                    alt={img.filename}
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        objectFit: 'cover',  // Maintain aspect ratio
                                        borderRadius: '8px',
                                        boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => window.location.href = `/image-detail/${img._id}`}
                                />
                                <p style={{marginTop: '10px', fontSize: '0.9rem'}}>{img.filename}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Footer */}
            <Footer/>
        </div>
    );
};

// Inline button styles
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
