import React, { useState } from 'react';
import GeneralInfo from './GeneralInfo';
import Description from './Description';
import Variations from './Variations';
import Meta from './Meta';
import Images from './Images';

const ProductForm = () => {
  const [product, setProduct] = useState({
    name: '',
    sku: '',
    price: 0,
    sale_price: 0,
    quantity: 0,
    description: { },
    variations: [],
    meta: [],
    images: { thumbnail: '', original: '' },
    gallery: [],
    brand: '',
    featured: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (response.ok) {
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <GeneralInfo product={product} setProduct={setProduct} />
      <Description product={product} setProduct={setProduct} />
      <Variations product={product} setProduct={setProduct} />
      <Meta product={product} setProduct={setProduct} />
      <Images product={product} setProduct={setProduct} />
      <button type="submit">Add Product</button>
    </form>
  );
};

export default ProductForm;
