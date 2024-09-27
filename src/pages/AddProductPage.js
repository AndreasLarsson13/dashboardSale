import React, { useState } from 'react';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth to get the current user
import GeneralInfo from '../components/form/GeneralInfo';
import Description from '../components/form/Description';
import VariationsDropdown from '../components/form/Variations';
import Meta from '../components/form/Meta';
import Images from '../components/form/Images';
import RelatedProductsDropdown from '../components/form/Related'; // Ensure this import is correct

const AddProductPage = () => {
  const auth = getAuth();
  const user = auth.currentUser; // Get the current logged-in user

  const [product, setProduct] = useState({
    name: '',
    sku: '',
    price: 0,
    sale_price: 0,
    quantity: 0,
    description: { se: '' },
    variations: [],
    meta: [],
    image: { thumbnail: '', original: '' },
    gallery: [],
    brand: '',
    featured: false,
    category: [],
    countries: [],
    weightPack: 0,
    widthPack: 0,
    heightPack: 0,
    lengthPack: 0,
    relatedProducts: [], // Add related products state
    createdDate: new Date().toISOString()
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

    try {
      const response = await fetch(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/reviewProducts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product), // Submit product data including countries and related products
      });
      if (response.ok) {
        alert('Product added successfully!');
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
          <VariationsDropdown
            onVariationsUpdate={handleVariationsUpdate}
            onImageLinkAdd={handleImageLinkAdd}
            isSingleImageUploaded={isSingleImageUploaded}
            product={product}
          />
          <Meta product={product} setProduct={setProduct} />
          <RelatedProductsDropdown
            product={product}
            onRelatedProductsUpdate={handleRelatedProductsUpdate}
            onRelatedProductRemove={handleRelatedProductRemove}
          />
          <button type="submit">Lägg till</button>
        </form>
      ) : (
        <div>Please log in to add products.</div>
      )}
    </>
  );
};

export default AddProductPage;
