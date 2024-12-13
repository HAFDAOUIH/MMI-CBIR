import React from 'react';

const CategoryMenu = ({ categories, selectedCategory, onCategorySelect }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <select
                value={selectedCategory}
                onChange={(e) => onCategorySelect(e.target.value)}
                style={{ padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CategoryMenu;
