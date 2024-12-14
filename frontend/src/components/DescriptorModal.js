import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js';
import {fetchImageDescriptors, getImageDescriptors} from '../services/imageService';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement);

const DescriptorModal = ({ show, onHide, imageId }) => {
    const [descriptors, setDescriptors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (show && imageId) {
            const fetchDescriptors = async () => {
                setIsLoading(true);
                try {
                    const data = await getImageDescriptors(imageId);
                    console.log("Fetched Descriptors:", data); // Log descriptors
                    setDescriptors(data);
                } catch (error) {
                    console.error('Error fetching descriptors:', error.message);
                    setDescriptors(null); // Reset descriptors on error
                } finally {
                    setIsLoading(false);
                }
            };

            fetchDescriptors();
        } else {
            setDescriptors(null); // Reset descriptors when modal is closed
        }
    }, [show, imageId]);

    // Helper function to create chart data
    const createHistogramData = (histogram, color) => ({
        labels: Array.from({ length: 256 }, (_, i) => i),
        datasets: [
            {
                label: `${color} Histogram`,
                data: histogram && histogram.length > 0 ? histogram : Array(256).fill(0), // Fallback to zeros
                backgroundColor: color,
            },
        ],
    });

    if (isLoading) {
        return (
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Loading Descriptors...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Please wait while we fetch the image descriptors...</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    if (!descriptors) {
        return (
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>No Descriptors Available</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Descriptors for the selected image could not be fetched or are unavailable.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    const { histogram, dominantColors } = descriptors;

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Image Descriptors</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Color Histograms</h5>
                {['blue', 'green', 'red'].map((color) => (
                    <div key={color} style={{ marginBottom: '20px' }}>
                        <Bar
                            data={createHistogramData(histogram[color], color)}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                scales: {
                                    x: { title: { display: true, text: 'Bins' } },
                                    y: { title: { display: true, text: 'Frequency' }, beginAtZero: true },
                                },
                            }}
                        />
                    </div>
                ))}
                <h5>Dominant Colors</h5>
                {dominantColors && dominantColors.length > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {dominantColors.map((color, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    backgroundColor: `rgb(${color.join(',')})`,
                                    border: '1px solid black',
                                }}
                            ></div>
                        ))}
                    </div>
                ) : (
                    <p>Dominant colors are not available for this image.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DescriptorModal;