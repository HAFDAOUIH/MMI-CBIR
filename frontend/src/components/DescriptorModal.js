import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Filler,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";
import { getImageDescriptors } from "../services/imageService";
import "./DescriptorModal.css"; // Custom styling

// Register required Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Filler
);

const DescriptorModal = ({ show, onHide, imageId, referenceImageDescriptors }) => {
    const [descriptors, setDescriptors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (show && imageId) {
            const fetchDescriptors = async () => {
                setIsLoading(true);
                try {
                    const data = await getImageDescriptors(imageId);
                    setDescriptors(data);
                } catch (error) {
                    console.error("Error fetching descriptors:", error.message);
                    setDescriptors(null);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchDescriptors();
        } else {
            setDescriptors(null);
        }
    }, [show, imageId]);

    if (isLoading) {
        return (
            <Modal show={show} onHide={onHide} className="animated-modal">
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
            <Modal show={show} onHide={onHide} className="animated-modal">
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

    const { histogram, dominantColors, textureDescriptors, huMoments, textureImage, huImage } = descriptors;

    const combinedHistogramData = {
        labels: Array.from({ length: 256 }, (_, i) => i),
        datasets: [
            {
                label: "Blue Channel",
                data: histogram.blue,
                backgroundColor: "rgba(0, 0, 255, 0.5)",
                borderColor: "blue",
                borderWidth: 1,
            },
            {
                label: "Green Channel",
                data: histogram.green,
                backgroundColor: "rgba(0, 255, 0, 0.5)",
                borderColor: "green",
                borderWidth: 1,
            },
            {
                label: "Red Channel",
                data: histogram.red,
                backgroundColor: "rgba(255, 0, 0, 0.5)",
                borderColor: "red",
                borderWidth: 1,
            },
        ],
    };

    const combinedHistogramOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: { title: { display: true, text: "Bins" } },
            y: { title: { display: true, text: "Frequency" }, beginAtZero: true },
        },
        plugins: {
            legend: { display: true, position: "top" },
        },
    };

    const radarOptions = {
        scales: {
            r: {
                angleLines: { display: true },
                suggestedMin: 0,
                suggestedMax: 1,
                ticks: {
                    display: true,
                    backdropColor: "rgba(255, 255, 255, 0)", // Transparent backdrop for ticks
                },
            },
        },
        plugins: {
            legend: { display: true, position: "top" },
        },
        responsive: true,
        maintainAspectRatio: true,
    };

    const createTextureRadarData = (textureDescriptors) => ({
        labels: Array.from({ length: Math.min(textureDescriptors.length, 50) }, (_, i) => `Descriptor ${i + 1}`),
        datasets: [
            {
                label: "Texture Descriptors",
                data: textureDescriptors.slice(0, 50),
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    });

    const createHuMomentsRadarData = (huMoments, referenceMoments = null) => {
        const datasets = [
            {
                label: "Hu Moments (Normalized)",
                data: huMoments,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
        ];

        if (referenceMoments) {
            datasets.push({
                label: "Reference Image Moments",
                data: referenceMoments,
                backgroundColor: "rgba(99, 255, 132, 0.2)",
                borderColor: "rgba(99, 255, 132, 1)",
                borderWidth: 1,
            });
        }

        return {
            labels: huMoments.map((_, i) => `Moment ${i + 1}`),
            datasets,
        };
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" className="animated-modal">
            <Modal.Header closeButton>
                <Modal.Title>Image Descriptors</Modal.Title>
            </Modal.Header>
            <Modal.Body className="descriptor-body">
                <div className="section">
                    <h5>Color Histograms</h5>
                    <Bar data={combinedHistogramData} options={combinedHistogramOptions} />
                </div>

                <div className="section">
                    <h5>Dominant Colors</h5>
                    <div className="color-palette">
                        {dominantColors.map((color, index) => (
                            <div
                                key={index}
                                className="color-box"
                                style={{ backgroundColor: `rgb(${color.join(",")})` }}
                            ></div>
                        ))}
                    </div>
                </div>

                <div className="section">
                    <h5>Gabor Texture Descriptors</h5>
                    <div className="chart-container">
                        <Radar data={createTextureRadarData(textureDescriptors)} options={radarOptions} />
                        <img src={`http://localhost:5001/${textureImage}`} alt="Texture Highlights" />
                    </div>
                </div>

                <div className="section">
                    <h5>Hu Moments (Shape Features)</h5>
                    <div className="chart-container">
                        <Radar data={createHuMomentsRadarData(huMoments)} options={radarOptions} />
                        <img src={`http://localhost:5001/${huImage}`} alt="Hu Moment Highlights" />
                    </div>
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
