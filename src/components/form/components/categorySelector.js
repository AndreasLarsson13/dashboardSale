// components/FormElements/CategorySelector.jsx
import React from 'react';

function CategorySelector({
  mainCategory,
  subCategory,
  subSubCategory,
  subSubSubCategory,
  handleMainCategoryChange,
  handleSubCategoryChange,
  handleSubSubCategoryChange,
  handleSubSubSubCategoryChange,
  categoriesData, // Vi behöver skicka in hela kategoridatan
}) {
  // Dessa beräkningar behöver utföras här i komponenten
  const selectedMainCategory = categoriesData[Object.keys(categoriesData).find(category => categoriesData[category].value === mainCategory)];
  const subcategories = selectedMainCategory ? selectedMainCategory.child : [];

  const selectedSubCategory = subcategories.find(sub => sub.value === subCategory);
  const subSubcategories = selectedSubCategory ? selectedSubCategory.child : [];

  // Korrigering: Definiera selectedSubSubSubCategory här
  const selectedSubSubSubCategory = subSubcategories.find((subSub) => subSub.value === subSubCategory);
  // Och se till att subSubSubcategories hämtas korrekt från den definierade variabeln
  const subSubSubcategories = selectedSubSubSubCategory ? selectedSubSubSubCategory.child : [];

  return (
    <div style={{ padding: '10px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      {/* Huvudkategori */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Huvudkategori:</label>
        <select value={mainCategory} onChange={handleMainCategoryChange} style={{ marginBottom: '10px', width: '226px', fontSize: '19px', height: '28px' }}>
          <option value="">Välj huvudkategori</option>
          {Object.keys(categoriesData).map((category) => (
            <option key={categoriesData[category].value} value={categoriesData[category].value}>
              {categoriesData[category].label}
            </option>
          ))}
        </select>
      </div>

      {/* Underkategori 1 */}
      {subcategories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Underkategori 1:</label>
          <select value={subCategory} onChange={handleSubCategoryChange} style={{ marginBottom: '10px', width: '226px', fontSize: '19px', height: '28px' }}>
            <option value="">Välj underkategori</option>
            {subcategories.map((sub) => (
              <option key={sub.value} value={sub.value}>
                {sub.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Underkategori 2 */}
      {subSubcategories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Underkategori 2:</label>
          <select value={subSubCategory} onChange={handleSubSubCategoryChange} style={{ marginBottom: '10px', width: '226px', fontSize: '19px', height: '28px' }}>
            <option value="">Välj underkategori</option>
            {subSubcategories.map((subSub) => (
              <option key={subSub.value} value={subSub.value}>
                {subSub.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Underkategori 3 */}
      {subSubSubcategories && subSubSubcategories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Underkategori 3:</label>
          <select value={subSubSubCategory} onChange={handleSubSubSubCategoryChange} style={{ marginBottom: '10px', width: '226px', fontSize: '19px', height: '28px' }}>
            <option value="">Välj underkategori</option>
            {subSubSubcategories.map((subSubSub) => (
              <option key={subSubSub.value} value={subSubSub.value}>
                {subSubSub.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default CategorySelector;