import React, { useState } from 'react';
import DescriptorModal from './DescriptorModal';

function SimilarImagesSection({ similarImages, feedbackMap, markRelevant, markNonRelevant }) {
    const [isDescriptorModalOpen, setIsDescriptorModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const openDescriptorModal = async (image) => {
        try {
            setSelectedImage(image);
            setIsDescriptorModalOpen(true);
        } catch (err) {
            console.error("Failed to fetch descriptors for the image", err);
        }
    };

    const closeDescriptorModal = () => {
        setIsDescriptorModalOpen(false);
        setSelectedImage(null);
    };

    const buttonStyle = {
        padding: '10px 15px',
        margin: '5px',
        backgroundColor: '#333', // Match navbar gray
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s ease',
    };

    const sortedImages = [...similarImages].sort((a, b) => b.similarityScore - a.similarityScore);

    return (
        <div style={{ marginTop: '40px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '70px' }}>SIMILAR IMAGES</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                {sortedImages.map((img) => (
                    <div key={img._id} style={{ position: 'relative', textAlign: 'center', padding: '10px' }}>
                        <button
                            onClick={() => openDescriptorModal(img)}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: '#333',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}
                        >
                            View Descriptors
                        </button>
                        <img
                            src={`http://localhost:5000/uploads/${img.filepath.split('/').pop()}`}
                            alt={img.filename}
                            style={{
                                width: '150px',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
                            }}
                        />
                        <p>{img.filename}</p>
                        <p>Category: {img.category || 'Unknown'}</p>
                        <button
                            onClick={() => markRelevant(img)}
                            style={{
                                ...buttonStyle,
                                backgroundColor: feedbackMap[img._id] === 'relevant' ? '#333' : '#fff',
                                color: feedbackMap[img._id] === 'relevant' ? '#fff' : '#000',
                                border: '1px solid #333',
                            }}
                        >
                            Relevant
                        </button>
                        <button
                            onClick={() => markNonRelevant(img)}
                            style={{
                                ...buttonStyle,
                                backgroundColor: feedbackMap[img._id] === 'non-relevant' ? '#f44336' : '#fff',
                                color: feedbackMap[img._id] === 'non-relevant' ? '#fff' : '#000',
                                border: '1px solid #f44336',
                            }}
                        >
                            Not Relevant
                        </button>
                    </div>
                ))}
            </div>

            {/* Descriptor Modal */}
            {isDescriptorModalOpen && selectedImage && (
                <DescriptorModal
                    show={isDescriptorModalOpen}
                    onHide={closeDescriptorModal}
                    imageId={selectedImage._id}
                    descriptors={selectedImage.descriptors}
                />
            )}
        </div>
    );
}

export default SimilarImagesSection;
