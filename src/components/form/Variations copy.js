import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import { storage } from './firebaseConfig'; // Adjust the path to your Firebase config
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { styles } from './styleCart';

const VariationsDropdown = ({ 
  onVariationsUpdate, 
  onImageLinkAdd, 
  onVariationRemove = () => {},  
  isSingleImageUploaded, 
  product 
}) => {
  const [selectedVariations, setSelectedVariations] = useState([]);
  const [variationOptions, setVariationOptions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newVariation, setNewVariation] = useState('');
  const [imageFiles, setImageFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showImageUploadInput, setShowImageUploadInput] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        const response = await fetch('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/productsoptions');
        const data = await response.json();
        setVariationOptions(data);
      } catch (error) {
        console.error('Error fetching variations:', error);
      }
    };

    fetchVariations();
  }, []);

  const resizeImage = (file, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const newHeight = Math.min(img.height, maxHeight);
        const newWidth = newHeight * aspectRatio;

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/webp', 0.8);
      };

      img.onerror = () => {
        reject(new Error('Failed to load the image'));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleVariationSelect = (event) => {
    const selectedId = /* parseInt(event.target.value, 10) */ event.target.value;
    console.log(selectedId)
    if (selectedId) {
      
      const selectedOptionData = variationOptions.find(option => option._id === selectedId);
      console.log(selectedOptionData)
      if (selectedOptionData) {
        setSelectedVariations(prev => {
          const exists = prev.find(v => v._id === selectedOptionData._id);
          if (!exists) {
            const updatedVariations = [...prev, selectedOptionData];
            const transformedVariations = updatedVariations.map(selected => {
              const option = variationOptions.find(v => v._id === selected._id);
              // Only add price if it has changed
              if (option && option.price === selected.price) {
                return { id: option._id };
              }
              return { id: option._id, price: selected.price };
            });
            onVariationsUpdate(transformedVariations);
            return updatedVariations;
          }
          return prev;
        });
      }
    }
  };

  const handleImageUpload = async (id, value) => {
    if (imageFiles[id]) {
      try {
        const file = imageFiles[id];

        const compressedOriginal = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });

        const compressedThumbnail = await imageCompression(file, {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 120,
          useWebWorker: true,
        });

        const originalWebP = await resizeImage(compressedOriginal, 800);
        const thumbnailWebP = await resizeImage(compressedThumbnail, 120);

        const originalStorageRef = ref(
          storage,
          `images/${product.brand}/${product.name}/variations/${file.name}.webp`
        );
        const thumbnailStorageRef = ref(
          storage,
          `images/${product.brand}/${product.name}/variations/${file.name}_thumb.webp`
        );

        const originalUploadTask = uploadBytesResumable(originalStorageRef, originalWebP);
        const thumbnailUploadTask = uploadBytesResumable(thumbnailStorageRef, thumbnailWebP);

        setUploadStatus((prev) => ({ ...prev, [id]: 'uploading' }));

        await Promise.all([
          new Promise((resolve, reject) => {
            originalUploadTask.on('state_changed', null, reject, resolve);
          }),
          new Promise((resolve, reject) => {
            thumbnailUploadTask.on('state_changed', null, reject, resolve);
          }),
        ]);

        const originalURL = await getDownloadURL(originalStorageRef);
        const thumbnailURL = await getDownloadURL(thumbnailStorageRef);

        setSelectedVariations((prev) => {
          const updatedVariations = prev.map((variation) => {
            if (variation.id === id) {
              return {
                ...variation,
                gallery: [
                  { thumbnail: thumbnailURL, original: originalURL },
                  ...(variation.gallery || []),
                ],
                extraColor: { link: originalURL },
              };
            }
            return variation;
          });

          const transformedVariations = updatedVariations.map((selected) => {
            const option = variationOptions.find((v) => v._id === selected._id);
            if (option && option.price === selected.price) {
              return { id: option._id };
            }
            return { id: selected._id, price: selected.price };
          });

          onVariationsUpdate(transformedVariations);
          onImageLinkAdd(value, originalURL);
          setUploadStatus((prev) => ({ ...prev, [id]: 'completed' }));
          setShowImageUploadInput((prev) => ({ ...prev, [id]: false }));
          return updatedVariations;
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadStatus((prev) => ({ ...prev, [id]: 'error' }));
      }
    }
  };

  const handleImageChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImageFiles(prev => ({ ...prev, [id]: file }));
      setImagePreviews(prev => ({ ...prev, [id]: previewUrl }));
      setUploadStatus(prev => ({ ...prev, [id]: 'pending' }));
      setShowImageUploadInput(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleRemoveImagePreview = (id) => {
    setImagePreviews(prev => ({ ...prev, [id]: null }));
    setImageFiles(prev => ({ ...prev, [id]: null }));
    setUploadStatus(prev => ({ ...prev, [id]: 'pending' }));
    setShowImageUploadInput(prev => ({ ...prev, [id]: false }));
  };

  const handleRemoveVariation = (index) => {
    const removedVariation = selectedVariations[index];
    setSelectedVariations(prev => {
      const updatedVariations = prev.filter((_, i) => i !== index);
      const transformedVariations = updatedVariations.map(selected => {
        const option = variationOptions.find(v => v._id === selected._id);
        if (option && option.price === selected.price) {
          return { id: option._id };
        }
        return selected;
      });
      onVariationsUpdate(transformedVariations);
      onVariationRemove(removedVariation.id);
      return updatedVariations;
    });
  };

  const handleEditVariation = (index) => {
    setEditingIndex(index);
    setNewVariation(selectedVariations[index].price);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      setSelectedVariations(prev => {
        const updatedVariations = [...prev];
        const editedVariation = { ...updatedVariations[editingIndex], price: parseInt(newVariation) };
        updatedVariations[editingIndex] = editedVariation;
        const transformedVariations = updatedVariations.map(selected => {
          const option = variationOptions.find(v => v._id === selected._id);
          if (option && option.price === selected.price) {
            return { id: option._id };
          }
          return { id: selected._id, price: selected.price };
        });
        setEditingIndex(null);
        setNewVariation('');
        onVariationsUpdate(transformedVariations);
        return updatedVariations;
      });
    }
  };

  const hasImages = Object.keys(imageFiles).length > 0;
  const areVariationsValid = selectedVariations.every(variation => variation.price && variation.value);

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
          fontWeight: 'bold'
        }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span style={{ marginRight: '10px' }}>
          {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span>Variations</span>

        <span style={{ marginLeft: 'auto', color: !areVariationsValid ? 'green' : 'red' }}>
          {areVariationsValid ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {isDropdownOpen && isSingleImageUploaded && (
        <div style={{ padding: '10px' }}>
          <label>Välj variation (inte ett krav):</label>
          <select onChange={handleVariationSelect}>
            <option value="">-- Select --</option>
            {variationOptions.map((option) => (
              <option
                key={option.id}
                value={option._id}
                style={{ backgroundColor: option.meta }}>
                {option.namn}
              </option>
            ))}
          </select>

          <h3>Valda variationer:</h3>
          <ul>
            {selectedVariations.map((variation, index) => (
              <li key={variation._id} style={styles.card}>
                {editingIndex === index ? (
                  <div>
                    <input
                      type="number"
                      value={newVariation}
                      onChange={(e) => setNewVariation(e.target.value)}
                      style={styles.input}
                    />
                    <button type="button" onClick={handleSaveEdit} className="btnYellow" style={styles.button}>
                      Spara ändring
                    </button>
                    <button type="button" onClick={() => setEditingIndex(null)} className="btnRed" style={styles.button}>
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <div style={styles.cardContent}>
                    <div style={styles.variationInfo}>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={styles.variationText}>
                          {variation.attribute.name.se} {variation.value} - Pris: {variation.price} kr
                        </p>
                        <div style={styles.buttonGroup}>
                          <button
                            type="button"
                            onClick={() => handleEditVariation(index)}
                            className="btnYellow"
                            style={styles.button}
                          >
                            Ändra
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariation(index)}
                            className="btnRed"
                            style={styles.button}
                          >
                            Ta bort
                          </button>
                        </div>
                      </div>
                    </div>
              
                    <div>
                      {!variation.img ? (
                        showImageUploadInput[variation._id] ? (
                          <div>
                            {imagePreviews[variation._id] ? (
                              <div style={styles.imagePreviewWrapper}>
                                <img
                                  src={imagePreviews[variation._id]}
                                  alt="Preview"
                                  style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                    border: uploadStatus[variation._id] === 'completed' ? '2px solid green' : '2px solid black',
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImagePreview(variation._id)}
                                  className="btnRed"
                                  style={styles.button}
                                >
                                  Remove
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleImageUpload(variation._id, variation.value)}
                                  style={{
                                    backgroundColor: uploadStatus[variation._id] === 'completed' ? 'green' : 'gray',
                                    color: 'white',
                                    ...styles.button,
                                  }}
                                >
                                  {uploadStatus[variation._id] === 'completed' ? 'Uppladdad' : 'Ladda upp bild'}
                                </button>
                              </div>
                            ) : (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, variation._id)}
                                style={styles.fileInput}
                              />
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowImageUploadInput((prev) => ({ ...prev, [variation._id]: true }))}
                            style={styles.button}
                          >
                            Lägg till bild
                          </button>
                        )
                      ) : (
                        <div style={styles.imageContainer}>
                          {/* <img
                            src={variation.img.url}
                            alt="Current Image"
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '8px',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                              border: '2px solid blue',
                            }}
                          />
                          <p>Bild redan uppladdad</p> */}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VariationsDropdown;
