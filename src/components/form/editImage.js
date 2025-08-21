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
    if (product.image && product.image.original) { // Added null check for product.image
      try {
        // 1. Delete from Firebase
        await deleteImageFromFirebase(product.image.original);
        // Assuming thumbnail is derived or same, delete it too if it's a separate file
        if (product.image.thumbnail && product.image.thumbnail !== product.image.original) {
          await deleteImageFromFirebase(product.image.thumbnail);
        }

        // 2. Update product state to reflect removal (MongoDB update will happen when product is saved)
        setProduct(prevProduct => ({
          ...prevProduct,
          image: { thumbnail: '', original: '' } // Sätt till tomma strängar
        }));
        console.log('Single image removed from state and Firebase.');
      } catch (error) {
        console.error('Error deleting single image:', error);
      }
    }
  };

  // Delete a specific gallery image
  const handleRemoveGalleryImage = async (index) => {
    const imageToDelete = product.gallery[index];
    if (imageToDelete && imageToDelete.original) { // Added null check for imageToDelete.original
      try {
        // 1. Delete from Firebase
        await deleteImageFromFirebase(imageToDelete.original);
        // Assuming thumbnail is derived or same, delete it too
        if (imageToDelete.thumbnail && imageToDelete.thumbnail !== imageToDelete.original) {
          await deleteImageFromFirebase(imageToDelete.thumbnail);
        }

        // 2. Update product state to reflect removal (MongoDB update will happen when product is saved)
        setProduct(prevProduct => ({
          ...prevProduct,
          gallery: prevProduct.gallery.filter((_, i) => i !== index) // Filtrera bort den borttagna bilden
        }));
        console.log(`Gallery image at index ${index} removed from state and Firebase.`);
      } catch (error) {
        console.error('Error deleting gallery image:', error);
      }
    }
  };

  const deleteImageFromFirebase = async (imageUrl) => {
    // Only attempt to delete if imageUrl is a valid string
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.warn('Skipping Firebase deletion: Invalid image URL provided:', imageUrl);
      return;
    }
    const imageRef = ref(storage, imageUrl);
    try {
      await deleteObject(imageRef);
      console.log('Image deleted successfully from Firebase.');
    } catch (error) {
      // Catch "does not exist" errors silently, log others
      if (error.code === 'storage/object-not-found') {
        console.warn('Image not found in Firebase Storage (might have been deleted already):', imageUrl);
      } else {
        console.error('Error deleting image from Firebase:', error);
      }
    }
  };

  // Handle uploading a new single image (overwriting existing path)
  const handleSingleImageUpload = async () => {
    if (!newSingleImage || !newSingleImage.file) return;

    // Ensure product.brand and product.name exist for path construction
    if (!product.brand || !product.name.se) {
      console.error('Error: Product brand or name is missing. Cannot upload image.');
      // Optionally, provide user feedback here
      return;
    }

    try {
      const { file } = newSingleImage;
      console.log(product.image)
      // Construct a new, unique path if no old path exists, or use the old one to overwrite
      let filePath = product.image?.original || `images/${product.brand}/${product.name.se}/main_imagez`; // Fallback path
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, resolve);
      });

      const originalURL = await getDownloadURL(storageRef);
    const newImageObject = { original: originalURL };

      // 2. Update product state with new URL (MongoDB update will happen when product is saved)
      setProduct(prevProduct => ({
        ...prevProduct,
        image: {  original: originalURL }, // Update with new URL
        gallery: [newImageObject, ...(prevProduct.gallery || [])] // Lägg till först i galleriet

      }));
      setNewSingleImage(null); // Clear preview state
      console.log('Single image uploaded to Firebase and updated in state.');
    } catch (error) {
      console.error('Error uploading single image:', error);
    }
  };

  // Handle uploading new gallery images (adding to gallery)
  const handleAddNewGalleryImages = async () => {
    if (newGalleryImages.length === 0) return;

    if (!product.brand || !product.name.se) {
      console.error('Error: Product brand or name is missing. Cannot upload gallery images.');
      return;
    }
console.log(product)
    try {
      const updatedGallery = [...product.gallery]; // Create a mutable copy of the current gallery

      for (let i = 0; i < newGalleryImages.length; i++) {
        const { file } = newGalleryImages[i];
        // Ensure a unique path for each new image
        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`; // Simple unique name
        const storageRef = ref(storage, `images/${product.brand}/${product.name.se}/gallery/${uniqueFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', null, reject, resolve);
        });

        const imageUrl = await getDownloadURL(storageRef);

        // Add new image URL to the gallery array
        updatedGallery.push({ original: imageUrl, thumbnail: imageUrl });
      }

      // 2. Update product state with the new gallery (MongoDB update will happen when product is saved)
      setProduct(prevProduct => ({
        ...prevProduct,
        gallery: updatedGallery
      }));
      setNewGalleryImages([]); // Clear preview state
      console.log('New gallery images uploaded to Firebase and updated in state.');
    } catch (error) {
      console.error('Error uploading new gallery images:', error);
    }
  };

  // Handle editing an existing gallery image (overwriting a specific gallery image)
  const handleEditGalleryImage = async (index) => {
    if (!newGalleryImages[0] || !newGalleryImages[0].file) return; // Expecting only one file for editing

    const file = newGalleryImages[0].file;
    const oldImageObject = product.gallery[index];

    // Ensure we have a valid old path to overwrite
    if (!oldImageObject || !oldImageObject.original) {
      console.error(`Error: Cannot find original URL for gallery image at index ${index}.`);
      return;
    }

    try {
      const storageRef = ref(storage, oldImageObject.original); // Use the same path to overwrite
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, resolve);
      });

      const newImageUrl = await getDownloadURL(storageRef);
      const updatedGallery = [...product.gallery]; // Create a mutable copy

      // Update the specific image object in the copy
      updatedGallery[index] = { original: newImageUrl };

      // 2. Update product state with the modified gallery (MongoDB update will happen when product is saved)
      setProduct(prevProduct => ({
        ...prevProduct,
        gallery: updatedGallery
      }));
      setEditIndex(null); // Clear editing state
      setNewGalleryImages([]); // Clear preview state
      console.log(`Gallery image at index ${index} updated in Firebase and state.`);
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
            {product.image && product.image.original && ( // Check if product.image and product.image.original exist before rendering
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
            {product.gallery && product.gallery.length > 0 ? ( // Check if product.gallery exists and has length
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
                  {/* Option to remove individual new images before upload, or just clear all */}
                  {/* <button type="button" onClick={() => { /* logic to remove specific preview */ /*}} className="btnRed">
                    <FaTrash /> Ta bort
                  </button> */}
                  <button type="button" onClick={() => setNewGalleryImages([])} className="btnRed"> {/* Clear all new images */}
                    <FaTrash /> Ta bort alla förhandsvisningar
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