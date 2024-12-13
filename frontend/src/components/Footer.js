import React from 'react';

const Footer = () => {
    const footerStyles = {
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px 0',
        textAlign: 'center',
        fontSize: '1rem',
        position: 'relative',
        bottom: 0,
        width: '100%',
        marginTop: '20px',
    };

    const linkStyles = {
        color: '#ff6347',
        textDecoration: 'none',
        margin: '0 10px',
    };

    return (
        <footer style={footerStyles}>
            <p>&copy; 2025 MMI-CBIR. All Rights Reserved.</p>
            <p>
                <a href="/about" style={linkStyles}>About Us</a>
                <a href="/contact" style={linkStyles}>Contact</a>
            </p>
        </footer>
    );
};

export default Footer;
