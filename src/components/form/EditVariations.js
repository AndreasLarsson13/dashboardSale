import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa';
import { storage } from './firebaseConfig'; // Adjust the path to your Firebase config
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';


const EditVariations = ({ onVariationsUpdate, onImageLinkAdd, onVariationRemove, product }) => {
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
        const response = await fetch('http://localhost:4011/productsoptions');
        const data = await response.json();
        setVariationOptions(data);
      } catch (error) {
        console.error('Error fetching variations:', error);
      }
    };

    fetchVariations();
  }, []);

  useEffect(() => {
    if (product.variations) {
      setSelectedVariations(product.variations.map(v => ({
        ...v,
        gallery: v.gallery || []
      })));
    }
  }, [product.variations]);

  const handleVariationSelect = (event) => {
    const selectedId = parseInt(event.target.value, 10);
    if (selectedId) {
      const selectedOptionData = variationOptions.find(option => option.id === selectedId);
      if (selectedOptionData) {
        setSelectedVariations(prev => {
          const exists = prev.find(v => v.id === selectedOptionData.id);
          if (!exists) {
            const updatedVariations = [...prev, selectedOptionData];
            const transformedVariations = updatedVariations.map(selected => {
              const option = variationOptions.find(v => v.id === selected.id);
              if (option && option.price === selected.price) {
                return { id: option.id };
              }
              return { id: option.id, price: selected.price };
            });
            onVariationsUpdate(transformedVariations);
            return updatedVariations;
          }
          return prev;
        });
      }
    }
  };

  const handleVariationRemove = (id) => {
    const filteredVariations = selectedVariations.filter(v => v.id !== id);
    setSelectedVariations(filteredVariations);
    onVariationRemove(id);
  };

  const resizeAndCropImage = (file, width, height) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;

        const scale = Math.max(width / img.width, height / img.height);
        const x = (width / 2) - (scale * img.width) / 2;
        const y = (height / 2) - (scale * img.height) / 2;

        ctx.drawImage(img, x, y, scale * img.width, scale * img.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/webp', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUploadChange = (e, variationId) => {
    const file = e.target.files[0];
    if (file) {
      setImageFiles(prev => ({ ...prev, [variationId]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [variationId]: reader.result }));
      };
      reader.readAsDataURL(file);
      setShowImageUploadInput(prev => ({ ...prev, [variationId]: false }));
    }
  };

  const handleImageUpload = async (variationId) => {
    const file = imageFiles[variationId];
    if (file) {
      try {
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

        const originalWebP = await resizeAndCropImage(compressedOriginal, 800, 800);
        const thumbnailWebP = await resizeAndCropImage(compressedThumbnail, 120, 120);

        const fileName = `${variationId}_${file.name}`;
        const originalStorageRef = ref(storage, `images/${fileName}`);
        const thumbnailStorageRef = ref(storage, `images/${fileName}_thumb.webp`);

        const originalUploadTask = uploadBytesResumable(originalStorageRef, originalWebP);
        const thumbnailUploadTask = uploadBytesResumable(thumbnailStorageRef, thumbnailWebP);

        await Promise.all([
          new Promise((resolve, reject) => {
            originalUploadTask.on('state_changed', (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadStatus(prev => ({ ...prev, [variationId]: progress }));
            }, reject, resolve);
          }),
          new Promise((resolve, reject) => {
            thumbnailUploadTask.on('state_changed', (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadStatus(prev => ({ ...prev, [variationId]: progress }));
            }, reject, resolve);
          }),
        ]);

        const originalURL = await getDownloadURL(originalStorageRef);
        const thumbnailURL = await getDownloadURL(thumbnailStorageRef);

        onImageLinkAdd(variationId, { thumbnail: thumbnailURL, original: originalURL });
        setImageFiles(prev => ({ ...prev, [variationId]: null }));
        setImagePreviews(prev => ({ ...prev, [variationId]: '' }));
        setUploadStatus(prev => ({ ...prev, [variationId]: null }));
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const deleteImageFromFirebase = async (filePath) => {
    const imageRef = ref(storage, `${filePath}`);
    try {
      await deleteObject(imageRef);
      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleExtraColorRemove = async (variationId, color) => {
    const galleryItem = product.gallery.find(g => g.extraColor && g.extraColor[color]);
    if (galleryItem && galleryItem.extraColor[color]) {
      try {
        const url = galleryItem.extraColor[color];
        const filePath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
        await deleteImageFromFirebase(filePath);

        const updatedGallery = product.gallery.map(g => {
          if (g === galleryItem) {
            const updatedExtraColor = { ...g.extraColor };
            delete updatedExtraColor[color];
            return { ...g, extraColor: updatedExtraColor };
          }
          return g;
        });

        onImageLinkAdd(variationId, updatedGallery);
      } catch (error) {
        console.error('Error removing extra color image:', error);
      }
    } else {
      console.log('No extra color image found for this variation.');
    }
  };

  return (
    <div className="variations-container">
      <select onChange={handleVariationSelect} defaultValue="">
        <option value="">Select Variation</option>
        {variationOptions.map((option) => (
          <option key={option.id} value={option.id} style={{backgroundColor: option.meta}}>
            {option.value}
          </option>
        ))}
      </select>

      <div className="variations-list">
        {selectedVariations && selectedVariations.map(variation => (
          <div key={variation.id} className="variation-item">
            {variationOptions.map((option) => (
              option.id === variation.id ? (
                <div key={option.id}>
                  <h4>{option.value}</h4>
                  {product.gallery && product.gallery.length > 0 && product.gallery.map((galleryItem, index) => (
                    galleryItem.extraColor && galleryItem.extraColor[option.value] ? (
                      <div key={index} className="extra-color-item">
                        <img
                          src={galleryItem.extraColor[option.value]}
                          alt={`Extra color ${option.value}`}
                          width="100"
                        />
                        <button
                          onClick={() => handleExtraColorRemove(variation.id, option.value)}
                        >
                          <FaTrash /> Remove Extra Color Image
                        </button>
                      </div>
                    ) : null
                  ))}
                </div>
              ) : null
            ))}

            <button onClick={() => handleVariationRemove(variation.id)}>
              Remove Variation
            </button>

            <div className="image-upload-container">
              <button
                onClick={() => setShowImageUploadInput(prev => ({ ...prev, [variation.id]: !prev[variation.id] }))}
              >
                {showImageUploadInput[variation.id] ? <FaChevronUp /> : <FaChevronDown />} Upload Image
              </button>

              {showImageUploadInput[variation.id] && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUploadChange(e, variation.id)}
                />
              )}

              {imageFiles[variation.id] && (
                <div className="image-preview">
                  <img src={imagePreviews[variation.id]} alt="Image preview" width="100" />
                  <button
                    onClick={() => handleImageUpload(variation.id)}
                    disabled={uploadStatus[variation.id] !== null && uploadStatus[variation.id] < 100}
                  >
                    {uploadStatus[variation.id] === null ? 'Upload' : `Uploading ${uploadStatus[variation.id]}%`}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditVariations;
