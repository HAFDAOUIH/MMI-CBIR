import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Legend } from 'chart.js';
import { getImageDescriptors } from '../services/imageService';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Legend);

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

    // Prepare data for combined histogram plot
    const combinedHistogramData = {
        labels: Array.from({ length: 256 }, (_, i) => i),
        datasets: [
            {
                label: 'Blue Channel',
                data: histogram.blue,
                backgroundColor: 'rgba(0, 0, 255, 0.5)',
                borderColor: 'blue',
                borderWidth: 1,
            },
            {
                label: 'Green Channel',
                data: histogram.green,
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                borderColor: 'green',
                borderWidth: 1,
            },
            {
                label: 'Red Channel',
                data: histogram.red,
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                borderColor: 'red',
                borderWidth: 1,
            },
        ],
    };

    const combinedHistogramOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: { title: { display: true, text: 'Bins' } },
            y: { title: { display: true, text: 'Frequency' }, beginAtZero: true },
        },
        plugins: {
            legend: { display: true, position: 'top' },
        },
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Image Descriptors</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Color Histograms (Combined)</h5>
                <div style={{ height: '400px' }}>
                    <Bar data={combinedHistogramData} options={combinedHistogramOptions} />
                </div>
                <h5>Dominant Colors</h5>
                {dominantColors && dominantColors.length > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
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
