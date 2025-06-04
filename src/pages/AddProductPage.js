import React, { useState } from 'react';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth to get the current user
import GeneralInfo from '../components/form/GeneralInfo';
import Description from '../components/form/Description';
import VariationsDropdown from '../components/form/Variations';
import OptionsDropdown from '../components/form/Options';

import Meta from '../components/form/Meta';
import Images from '../components/form/Images';
import RelatedProductsDropdown from '../components/form/Related'; // Ensure this import is correct

const AddProductPage = () => {
  const auth = getAuth();
  const user = auth.currentUser; // Get the current logged-in user

  const [product, setProduct] = useState({
    name: '',
    sku: '',
    supplierArticleNumber: '',
    price: {},
    buying_price: {},
    sale_price: {},
    quantity: 0,
    description: { se: '' },
    variations: [],
    meta: [],
    image: { thumbnail: '', original: '' },
    gallery: [],
    brand: '',
    featured: false,
    category: [],
    categoryPath: [],
   /*  countries: [], */
    weightPack: 0,
    widthPack: 0,
    heightPack: 0,
    lengthPack: 0,
    vat: {
      "SE" : 0.25,
      "AX" : 0.255,
      "FI" : 0.255
    },
    isProductOption: false,
    relatedProducts: [], // Add related products state
    createdDate: new Date().toISOString(),
    priceUpdateDate: new Date().toISOString(),
    searchKeywords: [],
    shippingCosts: { }, // Nytt fält
    currency: "",
    hideProductFromView: false,
    shippingCurrency: 'EUR', // Nytt fält
    productCountryOfOrigin: '',
    campaigns: [],
  });

  const [isSingleImageUploaded, setIsSingleImageUploaded] = useState(false);

  const handleCountryChange = (countries) => {
    setProduct((prev) => ({
      ...prev,
      countries,
    }));
  };

  const handleRelatedProductsUpdate = (updatedProducts) => {
    setProduct((prev) => ({
      ...prev,
      relatedProducts: updatedProducts,
    }));
  };

  const handleRelatedProductRemove = (productId) => {
    setProduct((prev) => ({
      ...prev,
      relatedProducts: prev.relatedProducts.filter(product => product._id !== productId),
    }));
  };

  const handleVariationsUpdate = (variations) => {
    setProduct((prev) => ({
      ...prev,
      variations: variations.map((v) => (v.isNew ? v : v)),
    }));
  };

   const handleOptionsUpdate = (variations) => {
    setProduct((prev) => ({
      ...prev,
      options: variations.map((v) => (v.isNew ? v : v)),
    }));
  };


  const handleImageLinkAdd = (variationId, link) => {
    setProduct((prev) => {
      const newGallery = [...prev.gallery];
      if (newGallery.length > 0) {
        const firstItem = newGallery[0];
        if (!firstItem.extraColor) {
          firstItem.extraColor = {};
        }

        firstItem.extraColor[variationId] = link;
        newGallery[0] = firstItem;
      }
      return { ...prev, gallery: newGallery };
    });
  };

  const handleSingleImageUpload = (image) => {
    setProduct((prev) => ({
      ...prev,
      image,
    }));
    setIsSingleImageUploaded(true);
  };

  const handleGalleryImageAdd = (image) => {
    const newImage = {
      ...image,
    };
    setProduct((prev) => ({
      ...prev,
      gallery: [...prev.gallery, newImage],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('User is not logged in');
      return;
    }

    product.uid = user.uid;
    product.email = user.email;

    if (!product.name || !product.brand) {
      alert('Please fill in the name and brand before submitting.');
      return;
    }
  /*   product.originalPriceCurrencyAndDate = {
      originalPrice: product.price[product.currency].value,
      originalCurrency: product.currency, // Use the latest currency
      originalShippingPrice: product.shippingCosts,
      dateOfPrice: new Date().toISOString().split('T')[0],
    } */

/*     https://serverkundportal-dot-natbutiken.lm.r.appspot.com
 */    try {
      const response = await fetch(`http://localhost:8088/reviewProducts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product), // Submit product data including countries and related products
      });
      if (response.ok) {
        alert('Produkten las till utan problem!');
      } else {
        console.error('Failed to add product:', await response.text());
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // Conditionally show the form or a message if the user is not logged in
  return (
    <>
      {user ? (
        <form onSubmit={handleSubmit} className='form'>
          <GeneralInfo product={product} setProduct={setProduct} onCountryChange={handleCountryChange} />
          <Description product={product} setProduct={setProduct} />
          <Images
            product={product}
            setProduct={setProduct}
            onSingleImageUpload={handleSingleImageUpload}
            onGalleryImageAdd={handleGalleryImageAdd}
          />
 <OptionsDropdown
            onVariationsUpdate ={handleOptionsUpdate}
           /*  onImageLinkAdd={handleImageLinkAdd} */
            /* isSingleImageUploaded={isSingleImageUploaded} */
            product={product}
          />
          <VariationsDropdown
            onVariationsUpdate={handleVariationsUpdate}
            onImageLinkAdd={handleImageLinkAdd}
            isSingleImageUploaded={isSingleImageUploaded}
            product={product}
          />
          <Meta product={product} setProduct={setProduct} />
         {/*  <RelatedProductsDropdown
            product={product}
            onRelatedProductsUpdate={handleRelatedProductsUpdate}
            onRelatedProductRemove={handleRelatedProductRemove}
          /> */}
          <button type="submit">Lägg till</button>
        </form>
      ) : (
        <div>Please log in to add products.</div>
      )}
    </>
  );
};

export default AddProductPage;
