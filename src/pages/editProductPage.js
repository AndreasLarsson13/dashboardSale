// src/pages/EditProductPage.jsx
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

import ProductForm from '../components/form/ProductForm'; // Import the new generic form component

const EditProductPage = () => {
  const { id } = useParams();
  const auth = getAuth();
  const user = auth.currentUser;

  const defaultProductStructure = useMemo(() => ({
    name: '', sku: '', supplierArticleNumber: '',
    price: { value: 0, currency: 'SEK', dateChanged: '' },
    sale_price: { value: 0, currency: 'SEK', dateChanged: '' },
    buying_price: { value: 0, currency: 'SEK', dateChanged: '' },
    quantity: 0, description: { se: '' },
    variations: [], options: [], meta: [],
    image: { thumbnail: '', original: '' }, gallery: [],
    brand: '', featured: false, category: [], categoryPaths: [],
    productCountryOfOrigin: 'AX',
    packaging: { weightPack: 0, widthPack: 0, heightPack: 0, lengthPack: 0 },
    sellInCountries: {}, shippingCurrency: 'SEK',
    shippingSpecial: { combinedWith: [], units: 1, enabled: false },
    searchKeywords: [],
    specialProductData: { info: { se: '' }, salesOption: 'direct', enabled: false },
    isProductOption: false, hideProductFromView: false,
  }), []);

  const [product, setProduct] = useState(defaultProductStructure);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products/${id}`);
        const fetchedData = response.data;
        const newProduct = {
          ...defaultProductStructure, ...fetchedData,
          price: { ...defaultProductStructure.price, ...(fetchedData.price || {}) },
          sale_price: { ...defaultProductStructure.sale_price, ...(fetchedData.sale_price || {}) },
          buying_price: { ...defaultProductStructure.buying_price, ...(fetchedData.buying_price || {}) },
          description: { ...defaultProductStructure.description, ...(fetchedData.description || {}) },
          shippingSpecial: { ...defaultProductStructure.shippingSpecial, ...(fetchedData.shippingSpecial || {}) },
          specialProductData: { ...defaultProductStructure.specialProductData, ...(fetchedData.specialProductData || {}) },
          packaging: { ...defaultProductStructure.packaging, ...(fetchedData.packaging || {}) },
          searchKeywords: Array.isArray(fetchedData.searchKeywords) ? fetchedData.searchKeywords : [],
          category: Array.isArray(fetchedData.category) ? fetchedData.category : [],
          categoryPaths: Array.isArray(fetchedData.categoryPaths) ? fetchedData.categoryPaths : [],
          gallery: Array.isArray(fetchedData.gallery) ? fetchedData.gallery : [],
          variations: Array.isArray(fetchedData.variations) ? fetchedData.variations : [],
          options: Array.isArray(fetchedData.options) ? fetchedData.options : []
        };
        setProduct(newProduct);
      } catch (err) {
        console.error('Fel vid hämtning av produkt:', err);
        setError('Kunde inte ladda produktdata. Kontrollera nätverksanslutningen eller försök igen senare.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductData();
  }, [id, defaultProductStructure]);

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!user) { alert('Användaren är inte inloggad.'); return; }
    try { //https://serverkundportal-dot-natbutiken.lm.r.appspot.com/ http://localhost:8088
      const response = await axios.put(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products/${id}`, product, {
        headers: { 'Content-Type': 'application/json' },
        params: { uid: user.uid, uidEmail: user.email },
      });
      if (response.status === 200) { alert('Produkten uppdaterades framgångsrikt!'); }
      else { console.error('Misslyckades med att uppdatera produkt:', response.status, response.data); alert(`Kunde inte uppdatera produkten. Fel: ${response.status} ${response.data?.message || 'Okänt fel'}`); }
    } catch (error) { console.error('Fel vid uppdatering av produkt:', error); alert('Ett oväntat fel inträffade vid uppdatering av produkten.'); }
  };

  if (isLoading) { return <div className="loading-message">Laddar produktdata... Var god vänta.</div>; }
  if (error) { return <div className="error-message">Fel: {error}</div>; }
  if (!product || !product.name) { return <div className="no-product-found">Ingen produkt hittades med ID: {id} eller data är ofullständig.</div>; }

  return (
    <ProductForm
      product={product}
      setProduct={setProduct}
      onSubmit={handleSubmitEdit}
        isEditing={true}
      mode = 'edit'
    />
  );
};

export default EditProductPage;