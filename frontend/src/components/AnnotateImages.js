import React from 'react';

function AnnotateImages({ annotations, setAnnotations }) {
    const handleAnnotationChange = (id, value) => {
        setAnnotations((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <div>
            <h2>Image Annotations</h2>
            {Object.keys(annotations).map((imageId) => (
                <div key={imageId}>
                    <p>Image ID: {imageId}</p>
                    <textarea
                        value={annotations[imageId]}
                        onChange={(e) => handleAnnotationChange(imageId, e.target.value)}
                        style={{ width: '100%', height: '80px', margin: '10px 0' }}
                    ></textarea>
                </div>
            ))}
        </div>
    );
}

export default AnnotateImages;
