import React, { useEffect, useState } from 'react';
import {fetchImagesByCategory, fetchImageDescriptors, getImageDescriptors} from '../services/imageService';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import CategoryMenu from '../components/CategoryMenu';
import ImageCard from '../components/ImageCard';
import DescriptorModal from '../components/DescriptorModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Spinner } from 'react-bootstrap'; // Add the Spinner component for loading

Modal.setAppElement('#root');

function DashboardPage() {
    const [images, setImages] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [categories, setCategories] = useState([
        'Grass', 'Field', 'Industry', 'RiverLake', 'Forest', 'Resident', 'Parking',
    ]);
    const [descriptorModalOpen, setDescriptorModalOpen] = useState(false); // Define modal open state
    const [selectedCategory, setSelectedCategory] = useState('Forest');
    const [currentPage, setCurrentPage] = useState(1);
    const [imagesPerPage] = useState(21);
    const [imageToEdit, setImageToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [cropper, setCropper] = useState(null);
    const [descriptorImage, setDescriptorImage] = useState(null);
    const [descriptorsCache, setDescriptorsCache] = useState({}); // Cache to store descriptors
    const [isLoading, setIsLoading] = useState(false); // Loading state for descriptors
    const [isViewingDescriptors, setIsViewingDescriptors] = useState(false);
    const [abortController, setAbortController] = useState(null); // AbortController to manage cancellations
    const [descriptors, setDescriptors] = useState({});
    const [isDescriptorModalOpen, setIsDescriptorModalOpen] = useState(false);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);

    const loadImages = async (category) => {
        setIsCategoryLoading(true); // Show spinner
        try {
            const data = await fetchImagesByCategory(category);
            setImages(data.images || []);
        } catch (error) {
            console.error("Error loading images:", error.message);
        } finally {
            setIsCategoryLoading(false); // Hide spinner
        }
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
        setImageToEdit(image);
        setIsEditing(true);
    };

    const handleSaveEdits = () => {
        if (cropper) {
            const croppedImageUrl = cropper.getCroppedCanvas().toDataURL();
            setIsEditing(false);
            toast.success('Image edited successfully!');
        }
    };

    const handleDeleteClick = (imageId) => {
        setImages(images.filter((img) => img._id !== imageId));
        toast.error('Image deleted successfully!');
    };

    const handleImageClick = async (image) => {
        if (descriptorsCache[image._id]) {
            setDescriptorImage(image);
            setIsViewingDescriptors(true);
            return;
        }

        setIsLoading(true);

        try {
            const data = await getImageDescriptors(image._id);
            if (data && data.dominantColors) { // Validate data
                setDescriptorsCache((prevCache) => ({
                    ...prevCache,
                    [image._id]: data,
                }));
                setDescriptorImage(image);
                setIsViewingDescriptors(true);
            } else {
                console.error("Descriptors not found for image:", image._id);
                toast.error("No descriptors found for the selected image.");
            }
        } catch (error) {
            console.error("Error fetching descriptors:", error.message);
        } finally {
            setIsLoading(false);
        }
    };



    const handleCloseDescriptorModal = () => {
        setIsDescriptorModalOpen(false);
        setDescriptors({});
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
                {/*<button*/}
                {/*    onClick={handleUploadClick}*/}
                {/*    style={{*/}
                {/*        padding: '12px 24px',*/}
                {/*        fontSize: '1.1rem',*/}
                {/*        backgroundColor: '#ff6347',*/}
                {/*        color: '#fff',*/}
                {/*        borderRadius: '4px',*/}
                {/*        border: 'none',*/}
                {/*        cursor: 'pointer',*/}
                {/*        transition: 'background-color 0.3s ease',*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Upload Images*/}
                {/*</button>*/}
            </div>

            {/* Main content area */}
            {isCategoryLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }} />
                    <span style={{ marginLeft: '10px', fontSize: '1.2rem' }}>Loading images...</span>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '20px',
                        padding: '20px',
                        justifyContent: 'center',
                    }}
                >
                    {currentImages.map((img) => (
                        <ImageCard
                            key={img._id}
                            image={img}
                            onDeleteSuccess={handleDeleteClick}
                            onEditClick={() => handleImageEdit(img)}
                            onImageClick={() => handleImageClick(img)} // Handle image click for descriptors
                        />
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <nav>
                    <ul style={{ listStyleType: 'none', display: 'flex', gap: '10px' }}>
                        {pageNumbers.map((number) => (
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
                                        transition: 'background-color 0.3s ease',
                                    }}
                                >
                                    {number}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Descriptor Modal */}
            {isDescriptorModalOpen && (
                <DescriptorModal
                    show={isDescriptorModalOpen}
                    onHide={handleCloseDescriptorModal}
                    descriptors={descriptors}
                />
            )}
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
            {/* Loading Spinner */}
            {isLoading && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <Spinner animation="border" role="status" />
                    <span>Loading descriptors...</span>
                </div>
            )}

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
