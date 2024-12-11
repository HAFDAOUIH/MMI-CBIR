import React from 'react';

function Navbar({ onUploadClick }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            background: '#eee'
        }}>
            <h2>My Image Dashboard</h2>
            <button onClick={onUploadClick}>Upload Images</button>
        </div>
    );
}

export default Navbar;
