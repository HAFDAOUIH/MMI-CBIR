import React, { useState } from 'react';

function SimilarImagesSection({ similarImages, feedbackMap, markRelevant, markNonRelevant }) {
    const [sortCriteria, setSortCriteria] = useState('similarityScore');

    const sortedImages = [...similarImages].sort((a, b) => {
        if (sortCriteria === 'similarityScore') {
            return (b.similarityScore || 0) - (a.similarityScore || 0);
        } else if (sortCriteria === 'category') {
            return (a.category || '').localeCompare(b.category || '');
        }
        return 0;
    });

    return (
        <div style={{ marginTop: '40px' }}>
            <h2>Similar Images</h2>
            <div>
                <label>Sort by: </label>
                <select onChange={(e) => setSortCriteria(e.target.value)}>
                    <option value="similarityScore">Similarity Score</option>
                    <option value="category">Category</option>
                </select>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    padding: '10px',
                }}
            >
                {sortedImages.map((img) => (
                    <div key={img._id} style={{ textAlign: 'center' }}>
                        <img
                            src={`http://localhost:5000/uploads/${img.filepath.split('/').pop()}`}
                            alt={img.filename}
                            style={{
                                width: '150px',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
                            }}
                        />
                        <p>{img.filename}</p>
                        <p>Similarity Score: {img.similarityScore ? img.similarityScore.toFixed(2) : "N/A"}</p>
                        <p>Category: {img.category || "Unknown"}</p>
                        <button
                            onClick={() => markRelevant(img)}
                            style={{
                                backgroundColor: feedbackMap[img._id] === 'relevant' ? '#4CAF50' : '#fff',
                                color: feedbackMap[img._id] === 'relevant' ? '#fff' : '#000',
                                border: '1px solid #4CAF50',
                                borderRadius: '5px',
                                padding: '5px 10px',
                                margin: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Relevant
                        </button>
                        <button
                            onClick={() => markNonRelevant(img)}
                            style={{
                                backgroundColor: feedbackMap[img._id] === 'non-relevant' ? '#f44336' : '#fff',
                                color: feedbackMap[img._id] === 'non-relevant' ? '#fff' : '#000',
                                border: '1px solid #f44336',
                                borderRadius: '5px',
                                padding: '5px 10px',
                                margin: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Not Relevant
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SimilarImagesSection;
