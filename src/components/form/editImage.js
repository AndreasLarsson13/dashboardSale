import React from 'react';
import { storage } from './firebaseConfig'; // Your Firebase configuration
import { ref, deleteObject } from 'firebase/storage';
import { FaTrash } from 'react-icons/fa';


const EditImages = ({ product, setProduct }) => {
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

  return (
    <div>
      <h3>Single Image</h3>
      {product.image.original && (
        <div>
          <img
            src={product.image.original}
            alt="Single Image"
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          />
          <button type="button" onClick={handleRemoveSingleImage}>
            Remove Single Image
          </button>
        </div>
      )}

      <h3>Gallery Images</h3>
      {product.gallery.length > 0 ? (
        product.gallery.map((image, index) => (
          <div key={index}>
            <img
              src={image.original}
              alt={`Gallery Image ${index}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <button type="button" onClick={() => handleRemoveGalleryImage(index)}>
              <FaTrash />
            </button>
          </div>
        ))
      ) : (
        <p>No gallery images available</p>
      )}
    </div>
  );
};

export default EditImages;
