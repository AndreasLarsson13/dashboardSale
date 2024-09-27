import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa';

const RelatedProductsDropdown = ({ onRelatedProductsUpdate, onRelatedProductRemove, product }) => {
  const [selectedRelatedProducts, setSelectedRelatedProducts] = useState(product.relatedProducts || []);
  const [productOptions, setProductOptions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:4011/products');
        const data = await response.json();
        setProductOptions(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSelect = (event) => {
    const selectedId = event.target.value;

    if (selectedId) {
      const selectedProductData = productOptions.find(product => product._id === selectedId);
      if (selectedProductData) {
        setSelectedRelatedProducts(prev => {
          const exists = prev.find(p => p._id === selectedProductData._id);
          if (!exists) {
            const updatedRelatedProducts = [...prev, selectedProductData];
            onRelatedProductsUpdate(updatedRelatedProducts); // Update parent component
            return updatedRelatedProducts;
          }
          return prev;
        });
      }
    }
  };

  const handleRemoveRelatedProduct = (index) => {
    setSelectedRelatedProducts(prev => {
      const removedProduct = prev[index];
      const updatedRelatedProducts = prev.filter((_, i) => i !== index);
      onRelatedProductsUpdate(updatedRelatedProducts); // Update parent component
      onRelatedProductRemove(removedProduct._id); // Notify parent component about removal
      return updatedRelatedProducts;
    });
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          cursor: 'pointer',
          background: '#f1f1f1',
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold',
        }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span style={{ marginRight: '10px' }}>
          {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span>Relaterade produkter</span>

        <span style={{ marginLeft: 'auto', color: selectedRelatedProducts.length > 0 ? 'green' : 'red' }}>
          {selectedRelatedProducts.length > 0 ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {isDropdownOpen && (
        <div style={{ padding: '10px' }}>
          <label>Välj en produkt:</label>
          <select onChange={handleProductSelect}>
            <option value="">-- Välj --</option>
            {productOptions.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>

          {selectedRelatedProducts.length > 0 && (
            <div>
              <h3>Valda relaterade produkter:</h3>
              <ul style= {{width: '400px'}}              >
                {selectedRelatedProducts.map((relatedProduct, index) => (
                  <li key={relatedProduct._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{relatedProduct.name}</span>
                    <button type="button" onClick={() => handleRemoveRelatedProduct(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelatedProductsDropdown;
