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

    const {
        histogram,
        dominantColors,
        textureDescriptors,
        huMoments,
        textureImage,
        huImage,
        glcmFeatures,
        edgeHistogram
    } = descriptors || {};

    const glcmData = glcmFeatures || {};
    const edgeData = edgeHistogram || [];
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

    const createTextureRadarData = (textureDescriptors) => {
        if (!textureDescriptors || textureDescriptors.length === 0) {
            console.warn("Texture descriptors are undefined or empty.");
            return {
                labels: [],
                datasets: [],
            };
        }

        // Generate labels for the Gabor features (mean, variance, energy for each filter)
        const numFeatures = textureDescriptors.length / 3;
        const labels = [];
        for (let i = 0; i < numFeatures; i++) {
            labels.push(`Filter ${i + 1} - Mean`, `Filter ${i + 1} - Variance`, `Filter ${i + 1} - Energy`);
        }

        return {
            labels,
            datasets: [
                {
                    label: "Summarized Gabor Descriptors",
                    data: textureDescriptors,
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
            ],
        };
    };


    const createHuMomentsRadarData = (huMoments, referenceMoments = null) => {
        const huLabels = [
            "Φ1: Spatial Spread", // Hu Moment 1
            "Φ2: Central Symmetry", // Hu Moment 2
            "Φ3: Skewness", // Hu Moment 3
            "Φ4: Flatness/Elongation", // Hu Moment 4
            "Φ5: Irregularities", // Hu Moment 5
            "Φ6: Curvature", // Hu Moment 6
            "Φ7: Reflection Symmetry", // Hu Moment 7
        ];

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
            labels: huLabels,
            datasets,
        };
    };


    const createGLCMBarData = (glcmFeatures) => {
        if (!glcmFeatures || Object.keys(glcmFeatures).length === 0) {
            console.warn("GLCM features are undefined or empty.");
            return {
                labels: [],
                datasets: [],
            };
        }

        return {
            labels: Object.keys(glcmFeatures),
            datasets: [
                {
                    label: "GLCM Features",
                    data: Object.values(glcmFeatures).flat(),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        };
    };



    const createEdgeHistogramBarData = (edgeHistogram) => {
        if (!edgeHistogram || edgeHistogram.length === 0) {
            console.warn("Edge histogram is undefined or empty.");
            return {
                labels: [],
                datasets: [],
            };
        }

        return {
            labels: Array.from({ length: edgeHistogram.length }, (_, i) => `Bin ${i + 1}`),
            datasets: [
                {
                    label: "Edge Histogram",
                    data: edgeHistogram,
                    backgroundColor: "rgba(153, 102, 255, 0.5)",
                    borderColor: "rgba(153, 102, 255, 1)",
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" className="animated-modal">
            <Modal.Header closeButton>
                <Modal.Title>Image Descriptors</Modal.Title>
            </Modal.Header>
            <Modal.Body className="descriptor-body">
                <h5>Color Histograms</h5>
                {/* Histograms */}
                <div className="section">
                    <Bar data={combinedHistogramData} options={combinedHistogramOptions}/>
                </div>

                {/* Dominant Colors */}
                <h5>Dominant Colors</h5>
                <div className="section">
                    <div className="color-palette">
                        {dominantColors.map((color, index) => (
                            <div
                                key={index}
                                className="color-box"
                                style={{backgroundColor: `rgb(${color.join(",")})`}}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Texture Descriptors */}
                <h5>Gabor Texture Descriptors</h5>

                <div className="section">
                    <div className="chart-container">
                        <div className="saxa">
                            <Radar data={createTextureRadarData(textureDescriptors)} options={radarOptions}/>
                        </div>
                        {textureImage ? (
                            <div className="image-wrapper">
                                <img
                                    src={`http://localhost:5001${textureImage}`}  // textureImage already includes /static
                                    alt="Texture Highlights"
                                    onError={(e) => {
                                        e.target.style.display = 'none'; // Hide the image if it fails to load
                                        console.error('Failed to load texture image:', textureImage);
                                    }}
                                />
                            </div>
                        ) : (
                            <p>Texture highlights are not available.</p>
                        )}
                    </div>
                </div>

                {/* Hu Moments */}
                <h5>Hu Moments (Shape Features)</h5>
                <div className="section">
                    <div className="chart-container">
                        <div className="saxa">
                            <Radar data={createHuMomentsRadarData(huMoments)} options={radarOptions}/>
                        </div>
                        {huImage ? (
                            <div className="image-wrapper">
                                <img
                                    src={`http://localhost:5001${huImage}`}
                                    alt="Hu Moment Highlights"
                                    onError={(e) => {
                                        e.target.style.display = 'none'; // Hide the image if it fails to load
                                        console.error('Failed to load Hu moments image:', huImage);
                                    }}
                                />
                            </div>
                        ) : (
                            <p>Hu moments highlights are not available.</p>
                        )}
                    </div>
                </div>
                <h5>GLCM Features</h5>
                {/* GLCM Features */}
                <div className="sectionn">

                    {glcmFeatures && Object.keys(glcmFeatures).length > 0 ? (
                        <Bar data={createGLCMBarData(glcmFeatures)} options={combinedHistogramOptions}/>
                    ) : (
                        <p>GLCM features are not available for this image.</p>
                    )}
                </div>

                {/* Edge Histogram */}
                <h5>Edge Histogram</h5>

                <div className="sectionn">
                    {edgeHistogram && edgeHistogram.length > 0 ? (
                        <Bar data={createEdgeHistogramBarData(edgeHistogram)} options={combinedHistogramOptions}/>
                    ) : (
                        <p>Edge histogram is not available for this image.</p>
                    )}
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
