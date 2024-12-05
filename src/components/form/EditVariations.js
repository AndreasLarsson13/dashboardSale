import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { storage } from './firebaseConfig'; // Adjust the path to your Firebase config
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const EditVariations = ({ onVariationsUpdate, onImageLinkAdd, onVariationRemove, product }) => {
  const [selectedVariations, setSelectedVariations] = useState([]);
  const [variationOptions, setVariationOptions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [imageFiles, setImageFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [showImageUploadInput, setShowImageUploadInput] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        const response = await fetch('http://localhost:8080/productsoptions');
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
      setSelectedVariations(
        product.variations.map((v) => ({
          ...v,
          gallery: v.gallery || [],
          price: v.price || 0, // Ensure price exists
        }))
      );
    }
  }, [product.variations]);

  const handleVariationSelect = (event) => {
    const selectedId = event.target.value;
    const selectedOption = variationOptions.find((option) => option._id === selectedId);

    if (selectedOption && !selectedVariations.some((v) => v.id === selectedOption._id)) {
      const newVariation = { id: selectedOption._id, name: selectedOption.namn, price: 0 };
      setSelectedVariations((prev) => [...prev, newVariation]);
      onVariationsUpdate([...selectedVariations, newVariation]);
    }
  };

  const handlePriceChange = (index, price) => {
    setSelectedVariations((prev) => {
      const updatedVariations = [...prev];
      updatedVariations[index].price = parseFloat(price) || 0;
      return updatedVariations;
    });
  };

  const savePriceChange = () => {
    onVariationsUpdate(selectedVariations);
    setEditingIndex(null);
    setNewPrice('');
  };

  const handleVariationRemove = (id) => {
    const updatedVariations = selectedVariations.filter((v) => v.id !== id);
    setSelectedVariations(updatedVariations);
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
      setImageFiles((prev) => ({ ...prev, [variationId]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => ({ ...prev, [variationId]: reader.result }));
      };
      reader.readAsDataURL(file);
      setShowImageUploadInput((prev) => ({ ...prev, [variationId]: false }));
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
            originalUploadTask.on(
              'state_changed',
              null,
              reject,
              resolve
            );
          }),
          new Promise((resolve, reject) => {
            thumbnailUploadTask.on(
              'state_changed',
              null,
              reject,
              resolve
            );
          }),
        ]);

        const originalURL = await getDownloadURL(originalStorageRef);
        const thumbnailURL = await getDownloadURL(thumbnailStorageRef);

        onImageLinkAdd(variationId, { thumbnail: thumbnailURL, original: originalURL });
        setImageFiles((prev) => ({ ...prev, [variationId]: null }));
        setImagePreviews((prev) => ({ ...prev, [variationId]: '' }));
        setUploadStatus((prev) => ({ ...prev, [variationId]: null }));
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <div className="variations-container">
      <select onChange={handleVariationSelect} defaultValue="">
        <option value="">Select Variation</option>
        {variationOptions.map((option) => (
          <option key={option._id} value={option._id} style={{ backgroundColor: option.meta }}>
            {option.namn}
          </option>
        ))}
      </select>

      <div className="variations-list">
        {selectedVariations.map((variation, index) => (
          <div key={variation.id} className="variation-item">
            <h4>{variation.name}</h4>
            {editingIndex === index ? (
              <div>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Set price"
                />
                <button onClick={savePriceChange}>Save</button>
                <button onClick={() => setEditingIndex(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <p>Price: {variation.price} kr</p>
                <button
                  onClick={() => {
                    setEditingIndex(index);
                    setNewPrice(variation.price);
                  }}
                >
                  Edit Price
                </button>
              </div>
            )}
            <button onClick={() => handleVariationRemove(variation.id)}>
              <FaTrash /> Remove
            </button>

            <div className="image-upload-container">
              <button
                onClick={() => setShowImageUploadInput((prev) => ({ ...prev, [variation.id]: !prev[variation.id] }))}
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
