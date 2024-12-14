import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, RadialLinearScale, Legend, Tooltip } from 'chart.js';
import { getImageDescriptors } from '../services/imageService';
import { Bar, Radar } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, Legend, Tooltip);

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
    const { histogram, dominantColors, textureDescriptors, huMoments } = descriptors;

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

    const createTextureRadarData = (textureDescriptors) => ({
        labels: Array.from({ length: Math.min(textureDescriptors.length, 50) }, (_, i) => `Descriptor ${i + 1}`),
        datasets: [
            {
                label: 'Texture Descriptors',
                data: textureDescriptors.slice(0, 50), // Limit to first 50
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    });

    const createHuMomentsBarData = (huMoments) => ({
        labels: huMoments.map((_, i) => `Moment ${i + 1}`),
        datasets: [
            {
                label: 'Hu Moments',
                data: huMoments.map((moment) => parseFloat(moment.toFixed(6))), // Rounded to 6 decimals
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    });

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Image Descriptors</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Color Histograms</h5>
                <div style={{height: '400px'}}>
                    <Bar data={combinedHistogramData} options={combinedHistogramOptions}/>
                </div>
                <h5>Dominant Colors</h5>
                {dominantColors && dominantColors.length > 0 ? (
                    <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px'}}>
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
                <h5>Texture Descriptors (Radar Chart)</h5>
                <div style={{height: '400px', marginBottom: '20px'}}>
                    <Radar
                        data={createTextureRadarData(textureDescriptors)}
                        options={{
                            scales: {r: {beginAtZero: true}},
                            plugins: {legend: {display: true, position: 'top'}},
                        }}
                    />
                </div>
                <h5>Hu Moments (Bar Chart)</h5>
                <div style={{height: '400px', marginBottom: '20px'}}>
                    <Bar
                        data={createHuMomentsBarData(huMoments)}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true,
                            scales: {
                                x: {title: {display: true, text: 'Moments'}},
                                y: {title: {display: true, text: 'Value'}, beginAtZero: true},
                            },
                            plugins: {legend: {display: false}},
                        }}
                    />
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
