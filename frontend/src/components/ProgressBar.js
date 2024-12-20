import React from 'react';

function ProgressBar({ progress }) {
    return (
        <div style={{ marginTop: '20px' }}>
            <h4>Feedback Progress</h4>
            <div
                style={{
                    width: '100%',
                    backgroundColor: '#ccc',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    height: '20px',
                }}
            >
                <div
                    style={{
                        width: `${progress}%`,
                        backgroundColor: '#4CAF50',
                        height: '100%',
                        transition: 'width 0.3s ease-in-out',
                    }}
                ></div>
            </div>
        </div>
    );
}

export default ProgressBar;
