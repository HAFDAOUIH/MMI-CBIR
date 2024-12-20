import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getImageDescriptors, getSimilarImages } from '../services/imageService';
import DescriptorModal from './DescriptorModal';
import Navbar from './Navbar';
import Footer from './Footer';
import axios from 'axios';
import SimilarImagesSection from './SimilarImagesSection';
import FeedbackInsights from './FeedbackInsights';
import AnnotateImages from './AnnotateImages';
import ProgressBar from './ProgressBar';

const ImageDetailPage = () => {
    const { id } = useParams(); // Get the image ID from the URL
    const [image, setImage] = useState(null); // Holds image details
    const [descriptors, setDescriptors] = useState(null); // Holds descriptors data
    const [isDescriptorModalOpen, setIsDescriptorModalOpen] = useState(false); // Modal state
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [similarImages, setSimilarImages] = useState([]);
    const [relevantImages, setRelevantImages] = useState([]); // Relevant images for feedback
    const [nonRelevantImages, setNonRelevantImages] = useState([]); // Non-relevant images for feedback
    const [progress, setProgress] = useState(0);
    const [previousDescriptors, setPreviousDescriptors] = useState(null);
    const [updatedDescriptors, setUpdatedDescriptors] = useState(null);
    const [feedbackImpact, setFeedbackImpact] = useState('');
    const [annotations, setAnnotations] = useState({});
    const [feedbackMap, setFeedbackMap] = useState({}); // Map to store feedback (keyed by image ID)

    useEffect(() => {
        const fetchImageData = async () => {
            try {
                setIsLoading(true);

                // Fetch image details and descriptors
                const descriptorsData = await getImageDescriptors(id);
                setImage({
                    filename: descriptorsData.filename,
                    filepath: descriptorsData.filepath,
                });
                setDescriptors(descriptorsData);

                // Fetch similar images
                const similarImagesData = await getSimilarImages(id);
                setSimilarImages(similarImagesData.similarImages);
            } catch (err) {
                console.error('Error fetching image details or similar images:', err.message);
                setError('Failed to load image details or similar images.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchImageData();
    }, [id]);

    const handleRelevanceFeedback = async () => {
        try {
            setProgress(50); // Simulate progress during processing
            const response = await axios.post('http://localhost:5000/api/images/relevance-feedback', {
                queryDescriptors: descriptors.textureDescriptors,
                relevantImages: relevantImages.map((img) => img.textureDescriptors),
                nonRelevantImages: nonRelevantImages.map((img) => img.textureDescriptors),
            });

            const updatedQueryDescriptors = response.data.newQueryDescriptors;

            // Fetch updated similar images based on the new query descriptors
            const updatedSimilarImages = await axios.post('http://localhost:5000/api/images/similar', {
                queryDescriptors: updatedQueryDescriptors,
            });

            setPreviousDescriptors(descriptors);
            setUpdatedDescriptors(updatedQueryDescriptors);
            setSimilarImages(updatedSimilarImages.data.similarImages);

            setFeedbackImpact(`Updated rankings based on feedback. Top ${updatedSimilarImages.data.similarImages.length} images refreshed.`);
            setProgress(100); // Mark progress as complete
        } catch (error) {
            console.error('Error during relevance feedback:', error.message);
        }
    };

    const markRelevant = (img) => {
        setFeedbackMap((prev) => ({
            ...prev,
            [img._id]: 'relevant',
        }));
        setRelevantImages((prev) => [...prev, img]);
    };

    const markNonRelevant = (img) => {
        setFeedbackMap((prev) => ({
            ...prev,
            [img._id]: 'non-relevant',
        }));
        setNonRelevantImages((prev) => [...prev, img]);
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h3>Loading...</h3>
                <p>Please wait while we load the image details.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
                <h3>Error</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Navbar */}
            <Navbar />

            {/* Main Image Section */}
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h1 style={{ marginBottom: '10px' }}>{image.filename}</h1>
                <img
                    src={`http://localhost:5000/uploads/${image.filepath.split('/').pop()}`}
                    alt={image.filename}
                    style={{
                        width: '20%',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
                    }}
                />

                {/* Buttons Section */}
                <div style={{ marginTop: '20px' }}>
                    <button onClick={() => setIsDescriptorModalOpen(true)} style={buttonStyle}>
                        View Descriptors
                    </button>
                </div>

                {/* Descriptor Modal */}
                {isDescriptorModalOpen && (
                    <DescriptorModal
                        show={isDescriptorModalOpen}
                        onHide={() => setIsDescriptorModalOpen(false)}
                        imageId={id}
                        descriptors={descriptors}
                    />
                )}

                {/* Similar Images Section */}
                <SimilarImagesSection
                    similarImages={similarImages}
                    feedbackMap={feedbackMap}
                    markRelevant={markRelevant}
                    markNonRelevant={markNonRelevant}
                />

                {/* Feedback Progress */}
                <ProgressBar progress={progress} />

                {/* Feedback Insights */}
                {updatedDescriptors && (
                    <FeedbackInsights
                        previousDescriptors={previousDescriptors}
                        updatedDescriptors={updatedDescriptors}
                        impact={feedbackImpact}
                    />
                )}

                {/* Image Annotations */}
                <AnnotateImages annotations={annotations} setAnnotations={setAnnotations} />

                {/* Feedback Submission */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={handleRelevanceFeedback}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: '#fff',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            margin: '10px',
                        }}
                    >
                        Submit Feedback
                    </button>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

// Inline button styles
const buttonStyle = {
    padding: '10px 15px',
    margin: '5px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
};

export default ImageDetailPage;
