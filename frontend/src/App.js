// ''
import React from 'react';
import DashboardPage from './pages/DashboardPage';
import Footer from './components/Footer'; // Import Footer component
import './App.css';

function App() {
    return (
        <div>
            <DashboardPage />
            <Footer />  {/* Add Footer below the page content */}
        </div>
    );
}

export default App;
