import React from 'react';
import Navbar from '../components/Navbar'; // Ensure Navbar is included

const About = () => {
    return (
        <div>
            <Navbar/>
            <div style={{padding: '20px'}}>
                <h1>About the MMI-CBIR Project</h1>
                <p>
                    The MMI-CBIR (Multimedia Mining and Content-Based Image Retrieval) project is focused on developing
                    a web application that implements the core functionalities of an image indexing and retrieval
                    system.
                </p>
                <p>
                    The goal of this project is to:
                    <ul>
                        <li>Upload, download, and delete images</li>
                        <li>Organize images into categories</li>
                        <li>Apply transformations like cropping and resizing to images</li>
                        <li>Consume a REST API that calculates content descriptors for images using Flask</li>
                        <li>Perform image retrieval with and without relevance feedback</li>
                    </ul>
                </p>
                <p>Technologies used: React, Flask, and image processing techniques.</p>
            </div>
        </div>
            );
            };

export default About;
