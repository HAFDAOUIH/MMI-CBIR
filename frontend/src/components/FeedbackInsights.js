import React from 'react';

function FeedbackInsights({ previousDescriptors, updatedDescriptors, impact }) {
    const descriptorKeys = Object.keys(updatedDescriptors);

    return (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <h2>Feedback Insights</h2>
            <div>
                <h3>Impact Summary</h3>
                <p>{impact}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <div>
                    <h4>Previous Descriptors</h4>
                    <ul>
                        {descriptorKeys.map((key) => (
                            <li key={key}>
                                {key}: {previousDescriptors[key]}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4>Updated Descriptors</h4>
                    <ul>
                        {descriptorKeys.map((key) => (
                            <li key={key}>
                                {key}: {updatedDescriptors[key]}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default FeedbackInsights;
