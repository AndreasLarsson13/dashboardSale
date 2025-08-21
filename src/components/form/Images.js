import React, { useState } from 'react';
import { storage } from './firebaseConfig'; // Din Firebase-konfiguration
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaTrash } from 'react-icons/fa';

const Images = ({ product, setProduct, onSingleImageUpload, onGalleryImageAdd }) => {
  const [singleImagePreview, setSingleImagePreview] = useState(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [warning, setWarning] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ single: false, gallery: [] });
  const [isSectionOpen, setIsSectionOpen] = useState(false);

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

      const storageRef = ref(
        storage,
        `images/${product.brand}/${product.name.se}/${file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, resolve);
      });

      const imageUrl = await getDownloadURL(storageRef);

      onSingleImageUpload({
        original: imageUrl,
      });

      setUploadStatus((prev) => ({ ...prev, single: true }));

      setProduct((prevProduct) => ({
        ...prevProduct,
        gallery: [{ original: imageUrl }, ...prevProduct.gallery],
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

        const storageRef = ref(
          storage,
          `images/${product.brand}/${product.name.se}/gallery/${file.name}`
        );

        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', null, reject, resolve);
        });

        const imageUrl = await getDownloadURL(storageRef);

        onGalleryImageAdd({
          original: imageUrl,
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
            fontWeight: 'bold',
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
                style={{ marginBottom: '10px' }}
              />
              {singleImagePreview && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <img
                    src={singleImagePreview.url}
                    alt="Single Preview"
                    style={{
                      width: '100px',
                      height: '100px',
                      border: uploadStatus.single ? '2px solid green' : '2px solid black',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button onClick={handleRemoveSinglePreview} className="btnRed">
                      Ta bort
                    </button>
                    <button
                      onClick={handleSingleImageUpload}
                      style={{
                        backgroundColor: uploadStatus.single ? 'green' : 'gray',
                        color: 'white',
                      }}
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
                      <div key={index} style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                        <img
                          src={preview.url}
                          alt={`Preview ${index}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            border: uploadStatus.gallery[index]
                              ? '2px solid green'
                              : '2px solid black',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPreview(index)}
                          className="btnRed"
                        >
                          <FaTrash /> Ta bort
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGalleryImageUpload}
                    style={{
                      backgroundColor: uploadStatus.gallery.every((status) => status)
                        ? 'green'
                        : 'gray',
                      color: 'white',
                      marginTop: '10px',
                    }}
                  >
                    {uploadStatus.gallery.every((status) => status)
                      ? 'Uppladdade'
                      : 'Ladda upp alla bilder'}
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
