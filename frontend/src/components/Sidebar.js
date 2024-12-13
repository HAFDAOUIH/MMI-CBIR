// ''
import React from 'react';

const Sidebar = () => {
    const sidebarStyles = {
        position: 'fixed',
        top: '0',
        left: '0',
        height: '100%',
        width: '250px',
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    };

    const sidebarLinksStyles = {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    };

    const sidebarLinkItemStyles = {
        margin: '15px 0',
    };

    const sidebarLinkStyles = {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '1.2rem',
        display: 'block',
        padding: '10px',
        transition: 'background-color 0.3s ease',
    };

    const sidebarLinkHoverStyles = {
        backgroundColor: '#ff6347',
        borderRadius: '4px',
    };

    return (
        <div style={sidebarStyles}>
            <ul style={sidebarLinksStyles}>
                <li style={sidebarLinkItemStyles}><a href="/home" style={sidebarLinkStyles}>Home</a></li>
                <li style={sidebarLinkItemStyles}><a href="/gallery" style={sidebarLinkStyles}>Gallery</a></li>
                <li style={sidebarLinkItemStyles}><a href="/upload" style={sidebarLinkStyles}>Upload</a></li>
                <li style={sidebarLinkItemStyles}><a href="/about" style={sidebarLinkStyles}>About</a></li>
            </ul>
        </div>
    );
};

export default Sidebar;
