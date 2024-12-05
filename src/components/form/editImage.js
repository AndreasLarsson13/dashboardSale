import React, { useState } from 'react';
import { storage } from './firebaseConfig'; // Your Firebase configuration
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FaTrash, FaCheckCircle, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const EditImages = ({ product, setProduct }) => {
  const [newSingleImage, setNewSingleImage] = useState(null); // For previewing new single images
  const [newGalleryImages, setNewGalleryImages] = useState([]); // For previewing new gallery images
  const [editIndex, setEditIndex] = useState(null); // To track which gallery image is being edited
  const [isSectionOpen, setIsSectionOpen] = useState(false); // State for dropdown toggle

  // Delete an existing single image
  const handleRemoveSingleImage = async () => {
    if (product.image.original) {
      try {
        await deleteImageFromFirebase(product.image.original);
        await deleteImageFromFirebase(product.image.thumbnail);
        setProduct(prevProduct => ({
          ...prevProduct,
          image: { thumbnail: '', original: '' }
        }));
      } catch (error) {
        console.error('Error deleting single image:', error);
      }
    }
  };

  // Delete a specific gallery image
  const handleRemoveGalleryImage = async (index) => {
    const imageToDelete = product.gallery[index];
    if (imageToDelete) {
      try {
        await deleteImageFromFirebase(imageToDelete.original);
        await deleteImageFromFirebase(imageToDelete.thumbnail);
        setProduct(prevProduct => ({
          ...prevProduct,
          gallery: prevProduct.gallery.filter((_, i) => i !== index)
        }));
      } catch (error) {
        console.error('Error deleting gallery image:', error);
      }
    }
  };

  const deleteImageFromFirebase = async (imageUrl) => {
    const imageRef = ref(storage, imageUrl);
    try {
      await deleteObject(imageRef);
      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Handle uploading a new single image with the same name
  const handleSingleImageUpload = async () => {
    if (!newSingleImage) return;

    try {
      const { file } = newSingleImage;
      const oldFilePath = product.image.original; // Keep the same path as the old image
      const storageRef = ref(storage, oldFilePath); // Use the same reference to overwrite the old image
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, resolve);
      });

      const originalURL = await getDownloadURL(storageRef);
      setProduct(prevProduct => ({
        ...prevProduct,
        image: { thumbnail: originalURL, original: originalURL }
      }));

      setNewSingleImage(null); // Clear uploaded image
    } catch (error) {
      console.error('Error uploading single image:', error);
    }
  };

  // Handle uploading a new gallery image (add a new image to the gallery)
  const handleAddNewGalleryImages = async () => {
    if (newGalleryImages.length === 0) return;

    try {
      const updatedGallery = [...product.gallery]; // Start with existing gallery

      for (let i = 0; i < newGalleryImages.length; i++) {
        const { file } = newGalleryImages[i];
        const storageRef = ref(storage, `images/${product.brand}/${product.name}/gallery/${updatedGallery.length + i}.webp`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', null, reject, resolve);
        });

        const imageUrl = await getDownloadURL(storageRef);

        // Add new image to gallery
        updatedGallery.push({ original: imageUrl, thumbnail: imageUrl });
      }

      // Update product with new gallery
      setProduct(prevProduct => ({
        ...prevProduct,
        gallery: updatedGallery
      }));

      setNewGalleryImages([]); // Clear uploaded images
    } catch (error) {
      console.error('Error uploading new gallery images:', error);
    }
  };

  // Handle editing an existing gallery image
  const handleEditGalleryImage = async (index) => {
    if (!newGalleryImages[0]) return;

    const file = newGalleryImages[0].file; // Use the first selected file
    const oldFilePath = product.gallery[index].original; // Keep the same path as the old gallery image

    try {
      const storageRef = ref(storage, oldFilePath); // Use the same reference to overwrite the old image
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, resolve);
      });

      const newImageUrl = await getDownloadURL(storageRef);
      const updatedGallery = [...product.gallery];

      // Update the specific image
      updatedGallery[index] = { original: newImageUrl, thumbnail: newImageUrl };

      setProduct(prevProduct => ({
        ...prevProduct,
        gallery: updatedGallery
      }));

      setEditIndex(null); // Finish editing
      setNewGalleryImages([]); // Clear uploaded image
    } catch (error) {
      console.error('Error uploading edited gallery image:', error);
    }
  };

  // Handle file selection and preview for single images
  const handleSingleFileSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewSingleImage({ file, url: previewUrl });
    }
  };

  // Handle file selection and preview for gallery images
  const handleGalleryFileSelection = (e) => {
    const files = Array.from(e.target.files); // Allow multiple files
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setNewGalleryImages(previews);
  };

  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      {/* Dropdown Section Header */}
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
        onClick={() => setIsSectionOpen(!isSectionOpen)}
      >
        <span style={{ marginRight: '10px' }}>
          {isSectionOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span style={{ margin: '0', flex: 1 }}>Bilder</span>
        <div style={{ marginRight: '10px' }}>
          {/* Add some indicator if needed */}
        </div>
      </div>

      {/* Collapsible Content */}
      {isSectionOpen && (
        <div style={{ padding: '10px' }}>
          {/* Single Image */}
          <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h4>Produktbild</h4>
            <input type="file" onChange={handleSingleFileSelection} />
            {newSingleImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <img
                  src={newSingleImage.url}
                  alt="Preview"
                  style={{ width: '100px', height: '100px', objectFit: 'cover', border: '2px solid green' }}
                />
                <button type="button" onClick={handleSingleImageUpload} className="btnGreen">
                  <FaCheckCircle /> Ladda upp ny bild
                </button>
              </div>
            )}
            {product.image.original && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <img
                  src={product.image.original}
                  alt="Current Product Image"
                  style={{ width: '100px', height: '100px', objectFit: 'cover', border: '2px solid black' }}
                />
                <button type="button" onClick={handleRemoveSingleImage} className="btnRed">
                  <FaTrash /> Ta bort bild
                </button>
              </div>
            )}
          </div>

          {/* Gallery Images */}
          <h4>Galleri</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {product.gallery.length > 0 ? (
              product.gallery.map((image, index) => (
                <div key={index} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={image.original}
                    alt={`Gallery Image ${index}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', border: '2px solid black' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                    <button type="button" onClick={() => handleRemoveGalleryImage(index)} className="btnRed">
                      <FaTrash /> Ta bort
                    </button>
                    <button type="button" onClick={() => setEditIndex(index)} className="btnEdit">
                      <FaEdit /> Ändra
                    </button>
                  </div>
                  {editIndex === index && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <input type="file" onChange={handleGalleryFileSelection} />
                      {newGalleryImages.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                          <img
                            src={newGalleryImages[0].url}
                            alt="Preview"
                            style={{ width: '100px', height: '100px', objectFit: 'cover', border: '2px solid green' }}
                          />
                          <button type="button" onClick={() => handleEditGalleryImage(index)} className="btnGreen">
                            <FaCheckCircle /> Uppdatera bild
                          </button>
                          <button type="button" onClick={() => setEditIndex(null)} className="btnGray">
                            Avbryt
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Inga galleribilder uppladdade</p>
            )}
          </div>

          {/* Add New Gallery Images */}
          <h4>Lägg till nya galleribilder</h4>
          <input type="file" multiple onChange={handleGalleryFileSelection} />
          {newGalleryImages.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
              {newGalleryImages.map((preview, index) => (
                <div key={index}>
                  <img
                    src={preview.url}
                    alt={`New Gallery Preview ${index}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', border: '2px solid green' }}
                  />
                  <button type="button" onClick={() => setNewGalleryImages([])} className="btnRed">
                    <FaTrash /> Ta bort
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddNewGalleryImages} className="btnGreen">
                <FaCheckCircle /> Ladda upp nya bilder
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditImages;
