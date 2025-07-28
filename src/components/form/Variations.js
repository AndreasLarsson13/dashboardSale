import React, { useState, useEffect, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { storage } from './firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const VariationsDropdown = ({
  onVariationsUpdate,
  onImageLinkAdd,
  onVariationRemove = () => {},
  isSingleImageUploaded,
  product
}) => {
  const [selectedVariations, setSelectedVariations] = useState([]);
  const [variationOptions, setVariationOptions] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const [customInputs, setCustomInputs] = useState({});

  // Filter states
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for filter options
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Load selected variations when product or variationOptions change
  useEffect(() => {
    if (!product?.variations) {
        setSelectedVariations([]);
        setCustomInputs({});
        setImagePreviews({});
        setUploadStatus({});
        return;
    }

    const selected = [];
    const inputs = {};
    const previews = {};
    const statuses = {};

    product.variations.forEach((v) => {
      const match = variationOptions.find((opt) => opt._id === v.id);
      if (match) {
        const selectedVar = {
          ...match,
          variationImg: v.variationImg || '',
        };
        selected.push(selectedVar);

        inputs[v.id] = {
          sku: v.sku || '',
          price: v.price && v.price.SEK ? v.price : {
            SEK: {
              value: '',
              dateChanged: new Date().toISOString().split('T')[0],
              originalCurrency: true,
            },
          },
        };

        if (v.variationImg) {
          previews[v.id] = v.variationImg;
          statuses[v.id] = 'uploaded';
        }
      }
    });

    setSelectedVariations(selected);
    setCustomInputs(inputs);
    setImagePreviews(previews);
    setUploadStatus(statuses);
  }, [product, variationOptions]);

  // Fetch variation options and filter options
  useEffect(() => {
    let isMounted = true;
    const auth = getAuth();

    const fetchVariations = async ({ brand = '', category = '', search = '' } = {}) => {
      const params = new URLSearchParams();
      if (brand) params.append('brand', brand);
      if (category && !search) params.append('category', category); 
      if (search) params.append('search', search);

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/productsoptions?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch variations');
        const data = await res.json();
        if (isMounted) {
          setVariationOptions(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching variations:', err);
          setError('Failed to load variations');
        }
      }
    };

    const fetchFilterOptions = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.warn('User not authenticated for fetching filter options.');
        if (isMounted) {
          setAvailableBrands([]);
          setAvailableCategories([]);
          setError('User not authenticated. Cannot fetch filter options.');
        }
        return;
      }

      try {
        const token = await user.getIdToken();

        const brandsRes = await axios.get(`${process.env.REACT_APP_API_URL}/brands`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { uid: user.uid, uidEmail: user.email },
        });
        if (isMounted) {
          setAvailableBrands(brandsRes.data);
        }

        const categoriesRes = await fetch(`${process.env.REACT_APP_API_URL}/categories`);
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesRes.json();
        if (isMounted) {
          setAvailableCategories(categoriesData);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching filter options:', err);
          setError('Failed to load filter options');
        }
      }
    };

    fetchVariations({ 
      brand: brandFilter,
      category: categoryFilter,
      search: searchTerm
    });
    
    fetchFilterOptions(); 

    return () => {
      isMounted = false;
    };
  }, [brandFilter, categoryFilter, searchTerm]);

  const compressImageToWebP = async (file) => {
    const options = {
      maxSizeMB: 1,
      fileType: 'image/webp',
      useWebWorker: true
    };
    return await imageCompression(file, options);
  };

  const handleImageUpload = async (variationId, file) => {
    try {
      const compressedFile = await compressImageToWebP(file);
      const productBrand = product?.brand || 'unknown_brand';
      const productName = product?.name || 'unknown_product';
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `images/${productBrand}/${productName}/variations/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      setUploadStatus((prev) => ({ ...prev, [variationId]: 'uploading' }));

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error('Upload error:', error);
          setUploadStatus((prev) => ({ ...prev, [variationId]: 'error' }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadStatus((prev) => ({ ...prev, [variationId]: 'uploaded' }));
          setImagePreviews((prev) => ({ ...prev, [variationId]: downloadURL }));

          setSelectedVariations((prevVariations) => {
            const updated = prevVariations.map((v) =>
              v._id === variationId ? { ...v, variationImg: downloadURL } : v
            );
            updateParentVariations(updated, customInputs);
            return updated;
          });

          onImageLinkAdd(variationId, downloadURL);
        }
      );
    } catch (err) {
      setUploadStatus((prev) => ({ ...prev, [variationId]: 'error' }));
      console.error('Error uploading image:', err);
    }
  };

  const updateParentVariations = useCallback(
    (selectedVars, inputs) => {
      const variationsToSave = selectedVars.map((v) => ({
        id: v._id,
        sku: inputs[v._id]?.sku || '',
        price: inputs[v._id]?.price || {},
        variationImg: v.variationImg || false,
        product: true
      }));
      onVariationsUpdate(variationsToSave);
    },
    [onVariationsUpdate]
  );

  const handleVariationSelect = (variation) => {
    let newSelected;
    let newInputs = { ...customInputs };

    const prevVariation = selectedVariations.find(v => v._id === variation._id);

    if (prevVariation) {
      newSelected = selectedVariations.filter((v) => v._id !== variation._id);
      delete newInputs[variation._id];
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[variation._id];
        return newPreviews;
      });
      setUploadStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[variation._id];
        return newStatus;
      });
      onVariationRemove(variation._id);
    } else {
      newSelected = [...selectedVariations, variation];
      const defaultPrice = {
        SEK: {
          value: '',
          dateChanged: new Date().toISOString().split('T')[0],
          originalCurrency: true
        }
      };
      const existingProductVariation = product?.variations.find(v => v.id === variation._id);
      newInputs[variation._id] = {
        sku: existingProductVariation?.sku || variation.sku || '',
        price: (existingProductVariation?.price && existingProductVariation.price.SEK) ? existingProductVariation.price : defaultPrice 
      };
    }

    setSelectedVariations(newSelected);
    setCustomInputs(newInputs);
    updateParentVariations(newSelected, newInputs);
  };

  const handleInputChange = (id, field, value) => {
    const updatedInputs = {
      ...customInputs,
      [id]: {
        ...customInputs[id],
        [field]:
          field === 'price'
            ? {
                SEK: {
                  value: Number(value),
                  dateChanged: new Date().toISOString().split('T')[0],
                  originalCurrency: true
                }
              }
            : value
      }
    };

    setCustomInputs(updatedInputs);
    updateParentVariations(selectedVariations, updatedInputs);
  };

  // De valda variationerna som alltid ska visas
  const selectedDisplayVariations = selectedVariations;
  
  // De o-valda variationerna som matchar filter och sökterm
  // Här filtrerar vi BARA bort de som redan är valda.
  // Sök- och filter-logiken hanteras redan av backend via variationOptions.
  const unselectedAndFilteredVariations = variationOptions.filter(v => 
    !selectedVariations.some(sel => sel._id === v._id)
  );

  const areVariationsValid = selectedVariations.length > 0;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 10 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 10,
          cursor: 'pointer',
          background: '#f1f1f1',
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold',
          userSelect: 'none'
        }}
        onClick={() => setIsDropdownOpen((open) => !open)}
      >
        <span style={{ marginRight: 10 }}>
          {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span>Variationer</span>
        <span style={{ marginLeft: 'auto', color: areVariationsValid ? 'green' : 'red' }}>
          {areVariationsValid ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {error && <div style={{ color: 'red', marginTop: 10 }}>Fel: {error}</div>}

      {isDropdownOpen && (
        <div style={{ marginTop: 10 }}>
          {/* Valda Variationer (Alltid synliga) */}
          {selectedDisplayVariations.length > 0 && (
            <div style={{ marginBottom: 10, border: '1px solid #ccc', borderRadius: 4, padding: 8, background: '#f9f9f9' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 5 }}>Valda Variationer:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedDisplayVariations.map((variation) => (
                  <div
                    key={variation._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      border: '1px solid #a6e0ff',
                      borderRadius: 4,
                      backgroundColor: '#e6f7ff',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                    onClick={() => handleVariationSelect(variation)} // Klicka för att avmarkera
                  >
                    <span style={{ marginRight: 5 }}>{variation.name_parrent} / {variation.name}</span>
                    <FaCheckCircle style={{ color: 'green', fontSize: 12 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sökfält och filter */}
          <div style={{ marginBottom: 10, display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Sök variationer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            >
              <option value="">Alla Märken</option>
              {availableBrands.map((brand) => (
                <option key={brand._id} value={brand.slug}> 
                  {brand.name}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            >
              <option value="">Alla Kategorier</option>
              {availableCategories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lista med o-valda och filtrerade variationer (scrollbar) */}
          <div 
            style={{ 
              maxHeight: 300, 
              overflowY: 'auto', 
              border: '1px solid #ccc', 
              borderRadius: 4,
              display: 'grid', // Använd grid för desktop
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Exempel: 250px min-bredd
              gap: 8, // Mellanrum mellan grid-element
              padding: 8, // Padding inuti grid-containern
              '@media (max-width: 768px)': { // Media query för mobil
                gridTemplateColumns: '1fr', // En kolumn på mobil
              }
            }}
          >
            {unselectedAndFilteredVariations.length === 0 && (
                <div style={{ padding: 10, textAlign: 'center', color: '#666', gridColumn: '1 / -1' }}>
                    Inga matchande variationer hittades.
                </div>
            )}
            
            {unselectedAndFilteredVariations.map((variation) => {
              return (
                <div
                  key={variation._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 8,
                    border: '1px solid #eee', // Ändrade till border för varje grid-item
                    borderRadius: 4,
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // Lätt skugga
                    transition: 'box-shadow 0.2s ease-in-out',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
                  onClick={() => handleVariationSelect(variation)}
                >
                  <input
                    type="checkbox"
                    checked={false}
                    readOnly
                    style={{ marginRight: 10 }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div>**{variation.name_parrent}** / {variation.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>ID: {variation._id}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariationsDropdown;