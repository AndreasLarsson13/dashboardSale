import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { storage } from './firebaseConfig'; // Your Firebase configuration
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FaChevronDown, FaChevronUp, FaCheckCircle,FaTrash } from 'react-icons/fa';


const Images = ({ product, setProduct, onSingleImageUpload, onGalleryImageAdd }) => {
  const [singleImagePreview, setSingleImagePreview] = useState(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [warning, setWarning] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ single: false, gallery: [] });
  const [isSectionOpen, setIsSectionOpen] = useState(false);

  const resizeImage = (file, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const aspectRatio = img.width / img.height;

        // Calculate the new dimensions
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

  const handleSingleFileSelection = (e) => {
    if (!product.name || !product.brand) {
      setWarning('Please fill in the product name and brand before selecting images.');
      return;
    }

    setWarning('');

    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSingleImagePreview({ file, url: previewUrl });
      setUploadStatus((prev) => ({ ...prev, single: false }));
    }
  };

  const handleGalleryFileSelection = (e) => {
    if (!product.name || !product.brand) {
      setWarning('Please fill in the product name and brand before selecting images.');
      return;
    }

    setWarning('');

    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setGalleryImagePreviews((prev) => [...prev, ...newPreviews]);
    setUploadStatus((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ...new Array(files.length).fill(false)],
    }));
  };

  const handleRemoveGalleryPreview = (index) => {
    setGalleryImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadStatus((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveSinglePreview = () => {
    setSingleImagePreview(null);
    setUploadStatus((prev) => ({ ...prev, single: false }));
  };

  const handleSingleImageUpload = async (e) => {
    e.preventDefault();
    if (!singleImagePreview) {
      setWarning('Please select a single image before uploading.');
      return;
    }

    try {
      const { file } = singleImagePreview;
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

      // Resize both original and thumbnail to maintain aspect ratio
      const originalWebP = await resizeImage(compressedOriginal, 800);
      const thumbnailWebP = await resizeImage(compressedThumbnail, 120);

      const originalStorageRef = ref(
        storage,
        `images/${product.brand}/${product.name}/${file.name}.webp`
      );
      const thumbnailStorageRef = ref(
        storage,
        `images/${product.brand}/${product.name}/${file.name}_thumb.webp`
      );

      const originalUploadTask = uploadBytesResumable(originalStorageRef, originalWebP);
      const thumbnailUploadTask = uploadBytesResumable(thumbnailStorageRef, thumbnailWebP);

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

      onSingleImageUpload({
        thumbnail: thumbnailURL,
        original: originalURL,
      });

      setUploadStatus((prev) => ({ ...prev, single: true }));

      setProduct((prevProduct) => ({
        ...prevProduct,
        gallery: [{ thumbnail: thumbnailURL, original: originalURL }, ...prevProduct.gallery],
      }));
    } catch (error) {
      console.error('Error uploading single image:', error);
    }
  };

  const handleGalleryImageUpload = async (e) => {
    e.preventDefault();
    if (galleryImagePreviews.length === 0) {
      setWarning('Please select gallery images before uploading.');
      return;
    }

    try {
      for (let i = 0; i < galleryImagePreviews.length; i++) {
        const preview = galleryImagePreviews[i];
        const { file } = preview;

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

        // Resize both original and thumbnail to maintain aspect ratio
        const originalWebP = await resizeImage(compressedOriginal, 800);
        const thumbnailWebP = await resizeImage(compressedThumbnail, 120);

        const originalStorageRef = ref(
          storage,
          `images/${product.brand}/${product.name}/gallery/${i}.webp`
        );
        const thumbnailStorageRef = ref(
          storage,
          `images/${product.brand}/${product.name}/gallery/${i}_thumb.webp`
        );

        const originalUploadTask = uploadBytesResumable(originalStorageRef, originalWebP);
        const thumbnailUploadTask = uploadBytesResumable(thumbnailStorageRef, thumbnailWebP);

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

        onGalleryImageAdd({
          thumbnail: thumbnailURL,
          original: originalURL,
        });

        setUploadStatus((prev) => ({
          ...prev,
          gallery: prev.gallery.map((_, idx) => (idx === i ? true : _)),
        }));
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
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
          onClick={() => setIsSectionOpen((prev) => !prev)}
        >
          <span style={{ marginRight: '10px' }}>
            {isSectionOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
          <span style={{ margin: '0', flex: 1 }}>Bilder</span>
          <div style={{ marginRight: '10px' }}>
            {uploadStatus.single ? (
              <FaCheckCircle style={{ color: 'green' }} />
            ) : (
              <FaCheckCircle style={{ color: 'gray' }} />
            )}
          </div>
        </div>

        {isSectionOpen && (
          <div style={{ padding: '10px' }}>
            {warning && <p style={{ color: 'red' }}>{warning}</p>}
            <div>
              <h4>Ladda upp produktbild:</h4>
              <input
                type="file"
                accept="image/*"
                onChange={handleSingleFileSelection}
                disabled={!product.name || !product.brand}
                style={{marginBottom: '10px'}}
              />
              {singleImagePreview && (
                <div style={{ display: 'flex', gap: '10px'}}>
                  <img
                    src={singleImagePreview.url}
                    alt="Single Preview"
                    style={{
                      width: '100px',
                      height: '100px',
                      border: uploadStatus.single ? '2px solid green' : '2px solid black',
                      
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', justifyContent: 'flex-end'}}>
                  <button onClick={handleRemoveSinglePreview} className='btnRed'>Ta bort</button>
                  <button
                    onClick={handleSingleImageUpload}
                    style={{ backgroundColor: uploadStatus.single ? 'green' : 'gray', color: 'white' }}
                  >
                    {uploadStatus.single ? 'Uppladdad' : 'Ladda upp'}
                  </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4>Ladda upp galleri bilder:</h4>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFileSelection}
                disabled={!product.name || !product.brand}
              />
              {galleryImagePreviews.length > 0 && (
                <div>
                  <h5>Förhandsgranska galleribilder:</h5>
                  <div style={{ display: 'flex', gap: '30px' }}>
                    {galleryImagePreviews.map((preview, index) => (
                      <div key={index} style={{display: 'flex', gap: '5px', alignItems: "flex-end"}}>
                        <img
                          src={preview.url}
                          alt={`Preview ${index}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            border: uploadStatus.gallery[index] ? '2px solid green' : '2px solid black',
                          }}
                        />
                        <button type="button" onClick={() => handleRemoveGalleryPreview(index)} className='btnRed'>
                        <FaTrash /> Ta bort
                      </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleGalleryImageUpload}
                    style={{ backgroundColor: uploadStatus.gallery.every(status => status) ? 'green' : 'gray', color: 'white', marginTop: '10px' }}
                  >
                    {uploadStatus.gallery.every(status => status) ? 'Uppladdade' : 'Ladda upp alla bilder'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Images;
