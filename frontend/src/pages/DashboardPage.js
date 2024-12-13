import React, { useEffect, useState } from 'react';
import { fetchImagesByCategory } from '../services/imageService';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import CategoryMenu from '../components/CategoryMenu';
import ImageCard from '../components/ImageCard';
import { toast, ToastContainer } from 'react-toastify'; // Import React-Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for Toastify
import Modal from 'react-modal';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

Modal.setAppElement('#root');

function DashboardPage() {
    const [images, setImages] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [categories, setCategories] = useState([
        'Grass', 'Field', 'Industry', 'RiverLake', 'Forest', 'Resident', 'Parking'
    ]);
    const [selectedCategory, setSelectedCategory] = useState('Forest');
    const [currentPage, setCurrentPage] = useState(1);
    const [imagesPerPage] = useState(21);
    const [imageToEdit, setImageToEdit] = useState(null); // The image to edit
    const [isEditing, setIsEditing] = useState(false); // Whether the edit modal is open
    const [cropper, setCropper] = useState(null); // Store the cropper instance

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

    const handleUploadSuccess = () => {
        loadImages(selectedCategory);
        toast.success('Image uploaded successfully!');
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleImageEdit = (image) => {
        setImageToEdit(image); // Set the image to edit
        setIsEditing(true); // Open the modal
    };

    const handleSaveEdits = () => {
        if (cropper) {
            const croppedImageUrl = cropper.getCroppedCanvas().toDataURL(); // Get the cropped image
            setIsEditing(false); // Close the modal
            // Do something with the cropped image (e.g., save to the server or update the state)
            toast.success('Image edited successfully!');
        }
    };

    const handleDeleteClick = (imageId) => {
        setImages(images.filter(img => img._id !== imageId)); // Remove the image from the state
        toast.success('Image deleted successfully!');
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
                    <ImageCard
                        key={img._id}
                        image={img}
                        onDeleteSuccess={handleDeleteClick}
                        onEditClick={() => handleImageEdit(img)} // Open edit modal on click
                    />
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

            {/* Image Edit Modal */}
            {isEditing && (
                <Modal isOpen={isEditing} onRequestClose={() => setIsEditing(false)} style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    },
                    content: {
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        right: '10%',
                        bottom: '10%',
                        padding: '20px',
                        background: '#fff',
                        borderRadius: '10px',
                        border: 'none',
                        maxWidth: '80%',
                    },
                }}>
                    <h3>Edit Image</h3>
                    {/* Cropper for image editing */}
                    <Cropper
                        src={imageToEdit ? `http://localhost:5000/uploads/${imageToEdit.filepath.split('/').pop()}` : ''}
                        style={{ height: 400, width: '100%' }}
                        initialAspectRatio={1}
                        guides={false}
                        cropBoxResizable={true}
                        onInitialized={(instance) => setCropper(instance)}
                    />
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={handleSaveEdits}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Save Edits
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#f44336',
                                color: '#fff',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                marginLeft: '10px',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* React-Toastify Notifications */}
            <ToastContainer />

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseModal}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
}

export default DashboardPage;
