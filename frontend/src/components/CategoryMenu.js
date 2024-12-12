import React from 'react';

function CategoryMenu({ categories, selectedCategory, onCategorySelect }) {
    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h3>Select Category</h3>
            <select
                value={selectedCategory}
                onChange={(e) => onCategorySelect(e.target.value)}
                style={{ padding: '5px 10px', fontSize: '16px' }}
            >
                {categories.map(category => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default CategoryMenu;
