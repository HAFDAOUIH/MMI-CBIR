import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import Footer from './components/Footer'; // Import Footer component
import Home from './pages/Home'; // Import Home component
import About from './pages/About'; // Import About component
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImageDetailPage from './components/ImageDetailPage';

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    {/* Home page */}
                    <Route path="/" element={<Home />} />

                    {/* About page */}
                    <Route path="/about" element={<About />} />

                    {/* Gallery page (Dashboard) */}
                    <Route path="/gallery" element={<GalleryLayout />} />

                    {/* Image detail page */}
                    <Route path="/image-detail/:id" element={<ImageDetailPage />} />
                </Routes>
            </div>
        </Router>
    );
}

function GalleryLayout() {
    const location = useLocation();

    return (
        <div>
            {/* Gallery page content */}
            <DashboardPage />

            {/* Footer only shows in the /gallery route */}
            {location.pathname === '/gallery' && <Footer />}
        </div>
    );
}

export default App;
