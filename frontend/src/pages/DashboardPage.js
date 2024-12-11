import React, { useEffect, useState } from 'react';
import { fetchImagesByCategory } from '../services/imageService';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';

function DashboardPage() {
    const [images, setImages] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const defaultCategory = 'forest'; // You can change this or make it dynamic

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
        // After successful upload, reload images
        loadImages();
    };

    return (
        <div>
            <Navbar onUploadClick={handleUploadClick} />
            <h1 style={{ textAlign: 'center' }}>Image Gallery - {defaultCategory}</h1>
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                {images.map(img => (
                    <div key={img._id} style={{margin: '10px', textAlign: 'center'}}>
                        <img src={`http://localhost:5000/${img.filepath}`} alt={img.filename} width="200" />
                        <p>{img.filename}</p>
                    </div>
                ))}
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
