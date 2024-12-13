import React from 'react';

const CategoryMenu = ({ categories, selectedCategory, onCategorySelect }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <select
                value={selectedCategory}
                onChange={(e) => onCategorySelect(e.target.value)}
                style={{
                    padding: '12px 20px',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f1f1f1',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                {categories.map((category) => (
                    <option key={category} value={category} style={{ padding: '10px' }}>
                        {category}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CategoryMenu;
