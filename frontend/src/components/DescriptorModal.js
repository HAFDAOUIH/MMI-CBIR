import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { fetchImageDescriptors } from '../services/imageService';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement);

const DescriptorModal = ({ show, onHide, imageId }) => {
    const [descriptors, setDescriptors] = useState(null);

    useEffect(() => {
        if (show) {
            const fetchDescriptors = async () => {
                try {
                    const data = await fetchImageDescriptors(imageId);
                    setDescriptors(data);
                } catch (error) {
                    console.error('Error fetching descriptors:', error.message);
                }
            };

            fetchDescriptors();
        }
    }, [show, imageId]);

    if (!descriptors || descriptors.histogram.length === 0) {
        return (
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>No Descriptors Available</Modal.Title>
                </Modal.Header>
                <Modal.Body>No descriptors were found for this image.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Image Descriptors</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Color Histogram</h5>
                <Bar
    key={JSON.stringify(descriptors.histogram)} // Add a unique key to force re-rendering
    data={{
        labels: Array.from({ length: descriptors.histogram.length }, (_, i) => i),
        datasets: [
            {
                label: 'Color Histogram',
                data: descriptors.histogram,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
            },
        ],
    }}
    options={{
        responsive: true, // Keep it responsive
        maintainAspectRatio: true, // Maintain aspect ratio
        scales: {
            x: {
                title: { display: true, text: 'Bins' },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
            },
            y: {
                title: { display: true, text: 'Frequency' },
                min: 0, // Ensure the Y-axis starts from 0
            },
        },
    }}
                />
                <h5>Dominant Colors</h5>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {descriptors.dominantColors.map((color, index) => (
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
