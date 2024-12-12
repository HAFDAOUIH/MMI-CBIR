import React, { useEffect, useState } from 'react';
import { fetchImagesByCategory } from '../services/imageService'; // Ensure this function is defined in your service file
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import CategoryMenu from '../components/CategoryMenu'; // CategoryMenu component
import ImageCard from '../components/ImageCard'; // ImageCard component

function DashboardPage() {
    const [images, setImages] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [categories, setCategories] = useState([
        'Grass', 'Field', 'Industry', 'RiverLake', 'Forest', 'Resident', 'Parkin'
    ]); // Updated list of categories
    const [selectedCategory, setSelectedCategory] = useState('Forest'); // Default category

    const loadImages = (category) => {
        fetchImagesByCategory(category).then(data => {
            setImages(data.images || []);
        });
    };

    useEffect(() => {
        loadImages(selectedCategory); // Load images for the selected category
    }, [selectedCategory]); // Re-run when category is changed

    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsUploadModalOpen(false);
    };

    const handleUploadSuccess = () => {
        loadImages(selectedCategory); // Refresh images in the gallery after successful upload
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    return (
        <div>
            <Navbar onUploadClick={handleUploadClick} />
            <h1 style={{ textAlign: 'center' }}>Image Gallery - {selectedCategory}</h1>

            {/* Category Menu Component */}
            <CategoryMenu
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {images.map(img => (
                    <ImageCard key={img._id} image={img} />
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
