import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getImageDescriptors } from '../services/imageService';
import DescriptorModal from './DescriptorModal';

const ImageDetailPage = () => {
    const { id } = useParams(); // Get the image ID from the URL
    const [image, setImage] = useState(null);
    const [descriptors, setDescriptors] = useState(null);
    const [isDescriptorModalOpen, setIsDescriptorModalOpen] = useState(false);

    useEffect(() => {
        // Fetch image details and descriptors
        const fetchImage = async () => {
            const imageDescriptors = await getImageDescriptors(id);
            setDescriptors(imageDescriptors);
        };
        fetchImage();
    }, [id]);

    if (!image) return <p>Loading...</p>;

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>{image.filename}</h1>
            <img src={`http://localhost:5000/uploads/${image.filepath}`} alt={image.filename} style={{ width: '50%' }} />
            <div>
                <button onClick={() => setIsDescriptorModalOpen(true)}>View Descriptors</button>
                <button>Download</button>
                <button>Edit</button>
                <button>Delete</button>
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

export default ImageDetailPage;
