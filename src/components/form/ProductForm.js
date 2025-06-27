import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

// Import your generic list component
import SelectableItemList from './components/selectableProductList';

// Import your other form components
import GeneralInfo from './GeneralInfo';
import Description from './editDescription';
import Meta from './Meta';
import EditImages from './editImage';

const ProductForm = ({ product, setProduct, onSubmit, isEditing, mode }) => { // <--- Added isEditing prop
  const auth = getAuth();
  const user = auth.currentUser;

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // --- useEffect to fetch filter options (Brands and Categories) ---
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!user) {
        console.warn('Användare ej autentiserad för att hämta filteralternativ.');
        return;
      }
      try {
        const token = await user.getIdToken();
        const brandsRes = await axios.get('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/brands', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableBrands(brandsRes.data);
//localhosthttp://localhost:8088
        const categoriesRes = await fetch('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/categories');
        const categoriesData = await categoriesRes.json();
        setAvailableCategories(categoriesData);

      } catch (err) {
        console.error('Fel vid hämtning av filteralternativ:', err);
      }
    };
    fetchFilterOptions();
  }, [user]);

  // --- UNIFIED fetchDataFunction for both Product Variations and Options ---
  const fetchItemsData = useCallback(async (filters, user, signal, type) => {
    const params = new URLSearchParams();
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.category && !filters.search) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    if (filters.showOnlyOptions !== undefined) {
      params.append('showOnlyOptions', filters.showOnlyOptions);
    }
    
    params.append('type', type);
//https://serverkundportal-dot-natbutiken.lm.r.appspot.com/ http://localhost:8088
    const token = await user.getIdToken();
    const response = await axios.get(
        `https://serverkundportal-dot-natbutiken.lm.r.appspot.com/productsoptions?${params.toString()}`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { uid: user.uid, uidEmail: user.email },
            signal: signal,
        }
    );
    return response.data;
  }, []);

  // --- Handlers for Product Variations ---
  const handleSelectedVariationsUpdate = useCallback((variations) => {
    const currentVariationIds = JSON.stringify(product.variations.map(v => v.id || v._id).sort());
    const newVariationIds = JSON.stringify(variations.map(v => v.id || v._id).sort());

    if (currentVariationIds !== newVariationIds) {
      setProduct((prev) => {
        const updatedVariations = variations.map((v) => {
          const { isNew, ...rest } = v;
          const variationImageLink = prev.gallery[0]?.extraColor?.[rest._id || rest.id] || rest.variationImg || false;
          return {
            id: rest._id || rest.id,
            sku: rest.sku,
            price: rest.price,
            variationImg: variationImageLink,
            product: true,
            name: rest.name,
            name_parrent: rest.name_parrent,
          };
        });
        return { ...prev, variations: updatedVariations };
      });
    }
  }, [product.variations, product.gallery, setProduct]);

  // --- Image handling for Variations ---
  const handleImageLinkAdd = useCallback((variationId, file) => {
    // --- PLACEHOLDER FOR ACTUAL FIREBASE UPLOAD LOGIC ---
    const uploadedLink = `https://example.com/uploaded_image/${variationId}_${file.name}`; 
    
    setProduct((prev) => {
      const newGallery = [...prev.gallery];
      if (newGallery.length === 0) {
          newGallery.push({});
      }
      if (!newGallery[0].extraColor) {
        newGallery[0].extraColor = {};
      }
      newGallery[0].extraColor[variationId] = uploadedLink;
      
      const updatedVariations = prev.variations.map(v =>
        (v.id || v._id) === variationId ? { ...v, variationImg: uploadedLink } : v
      );

      return { ...prev, gallery: newGallery, variations: updatedVariations };
    });
  }, [setProduct]);

  const handleRemoveExtraColors = useCallback((variationId) => {
    setProduct((prev) => {
      const newGallery = prev.gallery.map((item, index) => {
        if (index === 0 && item.extraColor) {
          const { [variationId]: _, ...remainingColors } = item.extraColor;
          return { ...item, extraColor: remainingColors };
        }
        return item;
      });

      const updatedVariations = prev.variations.map(v =>
        (v.id || v._id) === variationId ? { ...v, variationImg: false } : v
      );

      return { ...prev, gallery: newGallery, variations: updatedVariations };
    });
  }, [setProduct]);

  const handleVariationRemove = useCallback((variationId) => {
    handleRemoveExtraColors(variationId);
  }, [handleRemoveExtraColors]);

  // --- Handlers for Options ---
  const handleSelectedOptionsUpdate = useCallback((optionsList) => {
    const currentOptionIds = JSON.stringify(product.options.map(o => o.id || o._id).sort());
    const newOptionIds = JSON.stringify(optionsList.map(o => o.id || o._id).sort());

    if (currentOptionIds !== newOptionIds) {
      setProduct((prev) => ({
        ...prev,
        options: optionsList.map((o) => {
            const { isNew, ...rest } = o;
            return {
                id: rest._id || rest.id,
                sku: rest.sku,
                price: rest.price,
                name: rest.name,
                title: rest.title,
            };
        }),
      }));
    }
  }, [product.options, setProduct]);

  // Stabilize renderAdditionalFields for Variations
  const renderVariationsFields = useCallback((item, onInputChange, imageUploadCallback) => {
    return (
      <>
        <div style={{ marginLeft: 10, minWidth: 200 }} onClick={e => e.stopPropagation()}>
          <input
            type="text"
            placeholder="SKU"
            value={item.sku || ''}
            onChange={(e) => onInputChange(item._id, 'sku', e.target.value)}
            style={{ width: '48%', marginRight: '4%', padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="number"
            placeholder="Pris (SEK)"
            value={item.price?.SEK?.value || ''}
            onChange={(e) => onInputChange(item._id, 'price', e.target.value)}
            style={{ width: '48%', padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginLeft: 10, minWidth: 100 }} onClick={e => e.stopPropagation()}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                imageUploadCallback(item._id, e.target.files[0]);
              }
            }}
          />
          {item.variationImg && (
            <img
              src={item.variationImg}
              alt="Variation"
              style={{ marginTop: 5, maxWidth: 60, maxHeight: 60, objectFit: 'cover' }}
            />
          )}
        </div>
      </>
    );
  }, []);

  // Stabilize renderAdditionalFields for Options
  const renderOptionsFields = useCallback((item, onInputChange) => {
    return (
      <>
        <div style={{ marginLeft: 10, minWidth: 200 }} onClick={e => e.stopPropagation()}>
            {item.sku && (
                <input
                    type="text"
                    placeholder="SKU"
                    value={item.sku || ''}
                    onChange={(e) => onInputChange(item._id, 'sku', e.target.value)}
                    style={{ width: '48%', marginRight: '4%', padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
            )}
            {item.price?.value !== undefined && (
                <input
                    type="number"
                    placeholder="Pris (SEK)"
                    value={item.price.value || ''}
                    onChange={(e) => onInputChange(item._id, 'price', e.target.value)}
                    style={{ width: '48%', padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
            )}
        </div>
      </>
    );
  }, []);

  return (
    <form onSubmit={onSubmit} className="form-container">
      {/* <--- Here's the change for the header ---> */}
      <h2>{isEditing ? `Redigera Produkt: ${product.name}` : 'Lägg till ny produkt'}</h2>

      <GeneralInfo product={product} setProduct={setProduct} />
      <Description
        product={product}
        setProduct={setProduct}
        languages={['se', 'en', 'fi']}
        languageLabels={{ se: 'Svenska', en: 'Engelska', fi: 'Finska' }}
        isEditable={isEditing} // <--- Pass the isEditing prop here!
      />
      <EditImages product={product} setProduct={setProduct} />

      {/* SelectableItemList for Variations */}
      <SelectableItemList
        headerText="Produktvariationer"
        fetchDataFunction={(filters, userData, signal) => fetchItemsData(filters, userData, signal, 'variation')}
        initialSelectedItems={product.variations || []}
        onItemsUpdate={handleSelectedVariationsUpdate}
        onItemRemove={handleVariationRemove}
        showBrandFilter={true}
        showOptionCheckbox={false}
        initialOptionCheckboxChecked={false}
        showCategoryFilter={true}
        availableBrands={availableBrands}
        availableCategories={availableCategories}
        itemKeyExtractor={(item) => item._id}
        itemDisplayLabelExtractor={(item) => item.name}
        itemParentLabelExtractor={(item) => item.name_parrent}
/*         renderAdditionalFields={renderVariationsFields}
 */        onImageLinkAdd={handleImageLinkAdd}
      />

      {/* SelectableItemList for Options */}
      <SelectableItemList
        headerText="Tillbehör"
        fetchDataFunction={(filters, userData, signal) => fetchItemsData(filters, userData, signal, 'options')}
        initialSelectedItems={product.options || []}
        onItemsUpdate={handleSelectedOptionsUpdate}
        showBrandFilter={true}
        showOptionCheckbox={true}
        initialOptionCheckboxChecked={true}
        showCategoryFilter={false}
        availableBrands={availableBrands}
        availableCategories={availableCategories}
        itemKeyExtractor={(item) => item._id}
        itemDisplayLabelExtractor={(item) => item.name || item.title}
        itemParentLabelExtractor={(item) => null}
/*         renderAdditionalFields={renderOptionsFields}
 */      />

      <Meta product={product} setProduct={setProduct} mode={mode} />

      <button type="submit" className="submit-button">
        {isEditing ? 'Uppdatera Produkt' : 'Lägg till Produkt'} {/* <--- Update button text */}
      </button>
    </form>
  );
};

export default ProductForm;