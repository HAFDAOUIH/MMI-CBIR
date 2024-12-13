import React from 'react';
import Navbar from '../components/Navbar'; // Ensure Navbar is included

function Home() {
    return (
        <div>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h1>Welcome to the MMI-CBIR Dashboard</h1>
                <p>This is the Home page where you can find information about image indexing and retrieval.</p>
                <p>Explore the gallery and upload images to start indexing!</p>
            </div>
        </div>
    );
}

export default Home;
