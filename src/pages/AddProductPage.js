// src/pages/AddProductPage.jsx
import React, { useState, useMemo } from 'react'; // Added useMemo
import { getAuth } from 'firebase/auth';
import axios from 'axios';

import ProductForm from '../components/form/ProductForm';

const AddProductPage = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const defaultProductStructure = useMemo(() => ({
    name: '', sku: '', supplierArticleNumber: '',
    price: { value: 0, currency: 'SEK', dateChanged: '' },
    buying_price: { value: 0, currency: 'SEK', dateChanged: '' },
    sale_price: { value: 0, currency: 'SEK', dateChanged: '' },
    quantity: 0, description: { se: '' },
    variations: [], options: [], meta: [],
    image: { thumbnail: '', original: '' }, gallery: [],
    brand: '', featured: false, category: [], categoryPaths: [],
    productCountryOfOrigin: 'AX',
    packaging: { weightPack: 0, lengthPack: 0, widthPack: 0, heightPack: 0, enable: false },
    vat: { "SE" : 0.25, "AX" : 0.255, "FI" : 0.255 },
    isProductOption: false, relatedProducts: [],
    createdDate: new Date().toISOString(), priceUpdateDate: new Date().toISOString(),
    searchKeywords: [], compadibleWithProduct: [], shippingCosts: { },
    currency: "", hideProductFromView: false, shippingCurrency: 'EUR', campaigns: [],
  }), []);

  const [product, setProduct] = useState(defaultProductStructure);

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!user) { alert('User is not logged in'); return; }
    const productToSubmit = { ...product, uid: user.uid, email: user.email };
    if (!productToSubmit.name || !productToSubmit.brand) { alert('Please fill in the name and brand before submitting.'); return; }
    try {
      const response = await fetch(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/reviewProducts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productToSubmit),
      });
      if (response.ok) {
        alert('Produkten lades till utan problem!');
        setProduct(defaultProductStructure);
      } else {
        const errorText = await response.text(); console.error('Failed to add product:', errorText);
        alert(`Kunde inte lägga till produkten. Fel: ${response.status} ${errorText || 'Okänt fel'}`);
      }
    } catch (error) { console.error('Error adding product:', error); alert('Error adding product.'); }
  };

  if (!user) { return <div>Please log in to add products.</div>; }

  return (
    <ProductForm
      product={product}
      setProduct={setProduct}
      onSubmit={handleSubmitAdd}
      isEditing={false}
      mode = 'add'
    />
  );
};

export default AddProductPage;