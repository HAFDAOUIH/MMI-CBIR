// Inside FeedbackInsights.js

import React from 'react';

const FeedbackInsights = ({ updatedDescriptors, descriptorNames }) => {
    return (
        <div className="feedback-insights">
            <h3 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '50px' }}>FEEDBACK INSIGHTS</h3>
            <h4>Impact Summary</h4>
            <p>Updated rankings based on feedback. Top 5 images refreshed.</p>
            <table className="feedback-table">
                <thead>
                    <tr>
                        <th>Descriptor</th>
                        <th>Updated Value</th>
                    </tr>
                </thead>
                <tbody>
                    {descriptorNames.map((name, index) => (
                        <tr key={index}>
                            <td>{name}</td>
                            <td>{updatedDescriptors[index]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FeedbackInsights;
