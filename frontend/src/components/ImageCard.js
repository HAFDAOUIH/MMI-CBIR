import React from 'react';

function ImageCard({ image }) {
    const imageUrl = `http://localhost:5000/uploads/${image.filepath.split('/').pop()}?${new Date().getTime()}`;

    return (
        <div key={image._id} style={{ margin: '10px', textAlign: 'center' }}>
            <img
                src={imageUrl}
                alt={image.filename}
                width="200"
            />
            <p>{image.filename}</p>
        </div>
    );
}

export default ImageCard;
