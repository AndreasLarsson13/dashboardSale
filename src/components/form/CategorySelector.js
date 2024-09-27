import React, { useState } from 'react';
import categoriesData from '../../data/categoriesData'; // Adjust path as needed

const CategorySelector = ({ product, setProduct }) => {
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  const handleMainCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setMainCategory(selectedCategory);
    setSubCategory('');
    setProduct({
      ...product,
      category: [{ name: selectedCategory, slug: selectedCategory.toLowerCase() }],
    });
  };

  const handleSubCategoryChange = (e) => {
    const selectedSubCategory = e.target.value;
    const updatedCategory = [
      ...product.category,
      { name: selectedSubCategory, slug: selectedSubCategory.toLowerCase() },
    ];
    setProduct({ ...product, category: updatedCategory });
  };

  const subcategories = mainCategory ? Object.keys(categoriesData[mainCategory] || {}) : [];

  return (
    <div>
      <label>Main Category:</label>
      <select value={mainCategory} onChange={handleMainCategoryChange}>
        <option value="">Select a category</option>
        {Object.keys(categoriesData).map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      {mainCategory && (
        <>
          <label>Subcategory:</label>
          <select value={subCategory} onChange={handleSubCategoryChange}>
            <option value="">Select a subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default CategorySelector;
