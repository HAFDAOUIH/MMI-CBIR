import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropImage';  // Ensure the path is correct

const ImageCropper = ({ imageUrl, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const onCropCompleteHandler = async (_, croppedAreaPixels) => {
        const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
        onCropComplete(croppedImage);  // Pass cropped image back to parent component
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '400px' }}>
            <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}  // 1:1 aspect ratio (you can adjust this)
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropCompleteHandler}
            />
        </div>
    );
};

export default ImageCropper;
