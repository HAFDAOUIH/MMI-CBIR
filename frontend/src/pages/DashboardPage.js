import React, { useEffect, useState } from 'react';
import { fetchImagesByCategory } from '../services/imageService'; // Make sure this function is defined in your service file
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';

function DashboardPage() {
    const [images, setImages] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const defaultCategory = 'forest'; // Change this to a dynamic category if needed

    const loadImages = () => {
        fetchImagesByCategory(defaultCategory).then(data => {
            setImages(data.images || []);
        });
    };

    useEffect(() => {
        loadImages();
    }, []);

    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsUploadModalOpen(false);
    };

    const handleUploadSuccess = () => {
        loadImages(); // Refresh images in the gallery after successful upload
    };

    return (
        <div>
            <Navbar onUploadClick={handleUploadClick} />
            <h1 style={{ textAlign: 'center' }}>Image Gallery - {defaultCategory}</h1>
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                {images.map(img => {
                    const imageUrl = `http://localhost:5000/uploads/${img.filepath.split('/').pop()}?${new Date().getTime()}`;
                    console.log('Generated image URL:', imageUrl);  // Log the image URL
                    return (
                        <div key={img._id} style={{ margin: '10px', textAlign: 'center' }}>
                            <img
                                src={imageUrl}
                                alt={img.filename}
                                width="200"
                            />
                            <p>{img.filename}</p>
                        </div>
                    );
                })}
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseModal}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
}

export default DashboardPage;
