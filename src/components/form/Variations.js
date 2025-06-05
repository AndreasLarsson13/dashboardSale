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

  // Fetch products with token
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        if (isMounted) setError('User not logged in');
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await axios.get(
          'https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { uid: user.uid, uidEmail: user.email }
          }
        );
        console.log('Fetched products:', response.data);
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };

    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // Fetch variations options
  useEffect(() => {
    let isMounted = true;
    const fetchVariations = async () => {
      try {
        const controller = new AbortController();
        const signal = controller.signal;

        const res = await fetch('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/productsoptions', { signal });
        const data = await res.json();

        if (isMounted) {
          setVariationOptions(data);
          setError(null);
        }

        return () => controller.abort();
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching variations:', err);
          setError('Failed to load variations');
        }
      }
    };

    fetchVariations();
    return () => { isMounted = false; };
  }, []);

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
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `images/${product.brand}/${product.name}/variations/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      setUploadStatus((prev) => ({ ...prev, [variationId]: 'uploading' }));

      uploadTask.on(
  'state_changed',
  null,
  (error) => {
    setUploadStatus((prev) => ({ ...prev, [variationId]: 'error' }));
  },
  async () => {
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    setUploadStatus((prev) => ({ ...prev, [variationId]: 'uploaded' }));
    setImagePreviews((prev) => ({
      ...prev,
      [variationId]: downloadURL,
    }));

    setSelectedVariations((prevVariations) => {
      const updatedVariations = prevVariations.map((variation) =>
        variation._id === variationId
          ? { ...variation, variationImg: downloadURL }
          : variation
      );
      // Update parent here with latest customInputs as well
      updateParentVariations(updatedVariations, customInputs);
      return updatedVariations;
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
      variationImg: v.variationImg || false
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
      // Deselect variation
      newSelected = selectedVariations.filter((v) => v._id !== variation._id);
      delete newInputs[variation._id];
    } else {
      // Select variation, preserve previous image if any
      newSelected = [
        ...selectedVariations,
        {
          ...variation,
          variationImg: prevVariation ? prevVariation.variationImg : undefined,
        }
      ];
      const defaultPrice = {
        SEK: {
          value: '',
          dateChanged: new Date().toISOString().split('T')[0],
          originalCurrency: true
        }
      };
      newInputs[variation._id] = {
        sku: variation.sku || '',
        price: variation.price || defaultPrice
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

  // Simple dropdown toggle for demo
  const toggleDropdown = () => setIsDropdownOpen((open) => !open);


    const areVariationsValid = selectedVariations.length > 0;


  return (
    <div>


      <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 10,
                cursor: 'pointer',
                background: '#f1f1f1',
                borderBottom: '1px solid #ddd',
                fontWeight: 'bold',
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
      {error && <div style={{ color: 'red' }}>Fel: {error}</div>}

     {/*  <button onClick={toggleDropdown} style={{ marginBottom: '10px' }}>
        Variations {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button> */}

      { (
        <div style={{ marginBottom: 20 }}>
         

          {variationOptions.map((variation) => {
            const isSelected = selectedVariations.some(v => v._id === variation._id);
            const uploadState = uploadStatus[variation._id] || 'idle';
            const preview = imagePreviews[variation._id] || (selectedVariations.find(v => v._id === variation._id)?.variationImg);

            return (
              isDropdownOpen && <div key={variation._id} style={{ marginBottom: '15px', borderBottom: '1px solid #eee' }}>
                 {variationOptions.length === 0 && <div>Laddar variationer...</div>}
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleVariationSelect(variation)}
                  />{' '}
                  {variation.name_parrent} - {variation.name || variation._id}
                </label>

                {isSelected && (
                  <>
                   {/*  <div style={{ marginTop: '5px' }}>
                      <input
                        type="text"
                        placeholder="SKU"
                        value={customInputs[variation._id]?.sku || ''}
                        onChange={(e) => handleInputChange(variation._id, 'sku', e.target.value)}
                        style={{ marginRight: '10px' }}
                      />
                      <input
                        type="number"
                        placeholder="Price SEK"
                        value={customInputs[variation._id]?.price?.SEK?.value || ''}
                        onChange={(e) => handleInputChange(variation._id, 'price', e.target.value)}
                      />
                    </div> */}

                   {/* {!variation.image &&<div style={{ marginTop: '10px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files.length > 0) {
                            handleImageUpload(variation._id, e.target.files[0]);
                          }
                        }}
                      />
                      <div>
                        {uploadState === 'uploading' && <span>Laddar upp bild...</span>}
                        {uploadState === 'error' && <span style={{ color: 'red' }}>Fel vid uppladdning</span>}
                        {uploadState === 'uploaded' && preview && (
                          <img
                            src={preview}
                            alt={`Variation ${variation._id}`}
                            style={{ marginTop: '5px', width: '100px', height: 'auto' }}
                          />
                        )}
                      </div>
                    </div>}  */}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VariationsDropdown;
