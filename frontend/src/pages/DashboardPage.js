
import React, { useEffect, useState } from 'react';
import { fetchImagesByCategory } from '../services/imageService';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import CategoryMenu from '../components/CategoryMenu';
import ImageCard from '../components/ImageCard';
import { fabric } from 'fabric'; // Fabric.js for image transformations

function DashboardPage() {
    const [images, setImages] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [categories, setCategories] = useState([
        'Grass', 'Field', 'Industry', 'RiverLake', 'Forest', 'Resident', 'Parking'
    ]);
    const [selectedCategory, setSelectedCategory] = useState('Forest');
    const [currentPage, setCurrentPage] = useState(1);
    const [imagesPerPage] = useState(21);
    const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state for notification
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [fabricCanvas, setFabricCanvas] = useState(null); // Canvas for image editing

    const loadImages = (category) => {
        fetchImagesByCategory(category).then(data => {
            setImages(data.images || []);
        });
    };

    useEffect(() => {
        loadImages(selectedCategory);
    }, [selectedCategory]);

    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsUploadModalOpen(false);
    };

    const handleDeleteSuccess = (imageId) => {
        setImages(images.filter(img => img._id !== imageId));
        setSnackbarMessage('Image deleted successfully');
        setOpenSnackbar(true);
    };

    const handleUploadSuccess = () => {
        loadImages(selectedCategory);
        setSnackbarMessage('Image uploaded successfully');
        setOpenSnackbar(true); // Show success notification
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    // Pagination Logic
    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(images.length / imagesPerPage); i++) {
        pageNumbers.push(i);
    }

    const handleImageEdit = (imageUrl) => {
        const canvas = new fabric.Canvas('canvas', {
            width: 800,
            height: 600,
        });

        fabric.Image.fromURL(imageUrl, (img) => {
            canvas.add(img);
            setFabricCanvas(canvas); // Store the canvas instance for further use
        });
    };

    const handleSaveEdits = async () => {
        const editedImage = fabricCanvas.toDataURL(); // Get the edited image data
        // Send the edited image data to the server or update state
        // You can implement the upload logic or store the edited image
        setSnackbarMessage('Image edits saved successfully');
        setOpenSnackbar(true);
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f7f7f7' }}>
            <Navbar onUploadClick={handleUploadClick} />
            <h1 style={{ textAlign: 'center', fontSize: '2.5rem', margin: '20px 0', color: '#333' }}>
                Image Gallery - {selectedCategory}
            </h1>

            <CategoryMenu
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
            />

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button
                    onClick={handleUploadClick}
                    style={{
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        backgroundColor: '#ff6347',
                        color: '#fff',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease'
                    }}
                >
                    Upload Images
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px',
                padding: '20px',
                justifyContent: 'center'
            }}>
                {currentImages.map(img => (
                    <ImageCard key={img._id} image={img} onDeleteSuccess={handleDeleteSuccess} onEditClick={handleImageEdit} />
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <nav>
                    <ul style={{ listStyleType: 'none', display: 'flex', gap: '10px' }}>
                        {pageNumbers.map(number => (
                            <li key={number}>
                                <a
                                    onClick={() => paginate(number)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#f1f1f1',
                                        color: '#333',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                >
                                    {number}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Image Edit Canvas */}
            <div>
                <canvas id="canvas"></canvas>
                <button onClick={handleSaveEdits} style={{ padding: '10px 20px', marginTop: '10px' }}>
                    Save Edits
                </button>
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
