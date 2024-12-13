import React from 'react';
import { Link } from 'react-router-dom'; // Use Link for navigation instead of anchor tags

const Navbar = ({ onUploadClick }) => {
    const navbarStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#333',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
    };

    const logoStyles = {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#fff',
        textDecoration: 'none',
        transition: 'color 0.3s ease',
    };

    const navLinksStyles = {
        listStyle: 'none',
        display: 'flex',
        margin: 0,
        padding: 0,
    };

    const navLinkItemStyles = {
        marginRight: '20px',
    };

    const navLinkStyles = {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '1rem',
        transition: 'color 0.3s ease',
    };

    const navbarRightStyles = {
        display: 'flex',
        alignItems: 'center',
    };

    const uploadButtonStyles = {
        padding: '8px 16px',
        backgroundColor: '#ff6347',
        border: 'none',
        color: 'white',
        fontSize: '1rem',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease',
    };

    const uploadButtonHoverStyles = {
        backgroundColor: '#e5533d',
    };

    return (
        <nav style={navbarStyles}>
            <div className="navbar-left">
                <Link to="/" style={logoStyles}>MMI-CBIR Dashboard</Link>
            </div>
            <div className="navbar-center">
                <ul style={navLinksStyles}>
                    <li style={navLinkItemStyles}><Link to="/" style={navLinkStyles}>Home</Link></li>
                    <li style={navLinkItemStyles}><Link to="/about" style={navLinkStyles}>About</Link></li>
                    <li style={navLinkItemStyles}><Link to="/gallery" style={navLinkStyles}>Gallery</Link></li>
                </ul>
            </div>
            <div className="navbar-right" style={navbarRightStyles}>
                <button
                    onClick={onUploadClick}
                    style={uploadButtonStyles}
                    onMouseOver={(e) => e.target.style.backgroundColor = uploadButtonHoverStyles.backgroundColor}
                    onMouseOut={(e) => e.target.style.backgroundColor = uploadButtonStyles.backgroundColor}
                >
                    Upload Images
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
