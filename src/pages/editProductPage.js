import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get the product ID from the URL
import GeneralInfo from '../components/form/GeneralInfo';
import Description from '../components/form/Description';
import VariationsDropdown from '../components/form/EditVariations';
import Meta from '../components/form/Meta';
import Images from '../components/form/editImage';

const EditProductPage = () => {
  const { id } = useParams(); // Get the product ID from the URL parameter
      console.log(id)
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
  });

  const [isSingleImageUploaded, setIsSingleImageUploaded] = useState(false);

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products/${id}`); // Use id from useParams
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('Failed to fetch product:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]); // Depend on the id so it fetches the product when the ID changes

  // Handlers for country change and variation updates
  const handleCountryChange = (countries) => {
    setProduct((prev) => ({
      ...prev,
      countries,
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

  const handleRemoveExtraColors = (variationId) => {
    setProduct((prev) => {
      const newGallery = [...prev.gallery];
      if (newGallery[0] && newGallery[0].extraColor) {
        const { [variationId]: _, ...remainingColors } = newGallery[0].extraColor;
        newGallery[0].extraColor = remainingColors;
      }
      return { ...prev, gallery: newGallery };
    });
  };

  const handleVariationRemove = (variationId) => {
    handleRemoveExtraColors(variationId);
    setProduct((prev) => {
      const updatedVariations = prev.variations.filter((v) => v.id !== variationId);
      return { ...prev, variations: updatedVariations };
    });
  };

  // Handlers for image upload
  const handleSingleImageUpload = (image) => {
    setProduct((prev) => ({
      ...prev,
      image,
    }));
    setIsSingleImageUploaded(true);
  };

  const handleGalleryImageAdd = (images) => {
    setProduct((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ...images],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name || !product.brand) {
      alert('Please fill in the name and brand before submitting.');
      return;
    }

    try {
      const response = await fetch(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products/${id}`, {
        method: 'PUT', // Use PUT to update the existing product
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      if (response.ok) {
        alert('Product updated successfully!');
      } else {
        console.error('Failed to update product:', await response.text());
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <GeneralInfo 
        product={product} 
        setProduct={setProduct} 
        onCountryChange={handleCountryChange} 
      />
      <Description 
        product={product} 
        setProduct={setProduct} 
      />
      <Images 
        product={product} 
        setProduct={setProduct} 
        onSingleImageUpload={handleSingleImageUpload} 
        onGalleryImageAdd={handleGalleryImageAdd} 
      />
      <VariationsDropdown
        onVariationsUpdate={handleVariationsUpdate}
        onImageLinkAdd={handleImageLinkAdd}
        onVariationRemove={handleVariationRemove}
        isSingleImageUploaded={isSingleImageUploaded}
        product={product} 
      />
      <Meta 
        product={product} 
        setProduct={setProduct} 
      />
      <button type="submit">Update</button>
    </form>
  );
};

export default EditProductPage;
