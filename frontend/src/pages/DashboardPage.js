import React, { useEffect, useState } from 'react';
import { fetchImagesByCategory } from '../services/imageService';

function DashboardPage() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        // Fetch images from a default category, e.g., 'forest'
        fetchImagesByCategory('forest').then(data => {
            setImages(data.images);
        });
    }, []);

    return (
        <div>
            <h1>Image Gallery</h1>
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                {images.map(img => (
                    <div key={img._id} style={{margin: '10px'}}>
                        <img src={`http://localhost:5000/${img.filepath}`} alt={img.filename} width="200" />
                        <p>{img.filename}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardPage;
