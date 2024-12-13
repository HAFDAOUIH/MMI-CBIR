import React, { useEffect, useState } from 'react';
import { fetchImagesByCategory } from '../services/imageService';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import CategoryMenu from '../components/CategoryMenu';
import ImageCard from '../components/ImageCard';
import { fabric } from 'fabric'; // Fabric.js for image transformations
import { toast, ToastContainer } from 'react-toastify'; // Import React-Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for Toastify
import Modal from 'react-modal';  // Correct import

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
    const [fabricCanvas, setFabricCanvas] = useState(null); // Canvas for image editing
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message state
    const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar open state

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

    const handleDeleteClick = (imageId) => {
        // Perform the deletion logic here (e.g., API request)
        setImages(images.filter(img => img._id !== imageId)); // Update images state after deletion

        // Set the snackbar message and show the notification
        setSnackbarMessage('Image deleted successfully!');
        setOpenSnackbar(true);

        // Automatically hide the snackbar after 5 seconds
        setTimeout(() => {
            setOpenSnackbar(false);
        }, 5000);
    };

    useEffect(() => {
        loadImages(); // Load images when the component mounts
    }, []);

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
                        onDeleteSuccess={handleDeleteClick} // Directly delete without confirmation
                        onEditClick={handleImageEdit}
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

            {/* Snackbar Notification */}
            {openSnackbar && (
                <div style={{
                    position: 'fixed',
                    top: '100px',
                    left: '8%',
                    transform: 'translateX(-50%)', // Centers the snackbar horizontally
                    backgroundColor: 'red',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    fontSize: '16px',
                    zIndex: 9999, // Ensure the snackbar appears on top of other elements
                }}>
                    {snackbarMessage}
                </div>
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
