import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../components/form/firebaseConfig';
import { styles } from '../components/form/styleCart';
import { Link } from 'react-router-dom';

const ListBrandPage = () => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingBrand, setEditingBrand] = useState(null); // State to manage the brand being edited
  const [editForm, setEditForm] = useState({ name: '', slug: '', image: { thumbnail: '', original: '' } });
  const [uploadStatus, setUploadStatus] = useState(''); // State to track upload status

  useEffect(() => {
    const fetchBrands = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setMessage('User is not authenticated.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:4011/brands', {
          params: { uid: user.uid, uidEmail: user.email },
        });

        setBrands(response.data); // Ensure you access data property of the response
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setMessage('Error fetching brands.');
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Helper function to resize image to 198x198 pixels
  const resizeImage = (file, maxSize) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = maxSize;
        canvas.height = maxSize;

        ctx.drawImage(img, 0, 0, maxSize, maxSize);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/webp', 0.8); // Compress to WebP format
      };

      img.onerror = (err) => reject(err);
    });
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleDeleteBrand = async (brandId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this brand?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:4011/deletebrand/${brandId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBrands(brands.filter((brand) => brand._id !== brandId));
        setMessage('Varumärket togs bort utan problem.');
      } else {
        setMessage('Problem med att ta bort varumärket');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      setMessage('Error bortganing av varumärke.');
    }
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand._id);
    setEditForm({
      name: brand.name,
      slug: brand.slug, // Include slug in edit form
      image: brand.image,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({
      ...prevForm,
      [name]: value,
      slug: generateSlug(value), // Automatically update slug based on name input
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('Uploading...');

    try {
      const resizedImage = await resizeImage(file, 198); // Resize the image to 198x198 pixels
      const brandSlug = generateSlug(editForm.name);

      // If there's already an image, delete the old one
      if (editForm.image.original) {
        const oldOriginalRef = ref(storage, `brands/${brandSlug}/${brandSlug}.webp`);
        const oldThumbnailRef = ref(storage, `brands/${brandSlug}/${brandSlug}_thumb.webp`);

        await deleteObject(oldOriginalRef).catch((error) => console.error('Error deleting old image:', error));
        await deleteObject(oldThumbnailRef).catch((error) => console.error('Error deleting old thumbnail:', error));
      }

      // Upload new resized image
      const originalStorageRef = ref(storage, `brands/${brandSlug}/${brandSlug}.webp`);
      const thumbnailStorageRef = ref(storage, `brands/${brandSlug}/${brandSlug}_thumb.webp`);

      const originalUploadTask = uploadBytesResumable(originalStorageRef, resizedImage);
      const thumbnailUploadTask = uploadBytesResumable(thumbnailStorageRef, resizedImage);

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

      // Update the form state with the new image URLs
      setEditForm((prevForm) => ({
        ...prevForm,
        image: {
          original: originalURL,
          thumbnail: thumbnailURL,
        },
      }));

      setUploadStatus('Upload successful.');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus('Failed to upload image.');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:4011/updatebrand/${editingBrand}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setBrands(
          brands.map((brand) => (brand._id === editingBrand ? { ...brand, ...editForm } : brand))
        );
        setEditingBrand(null);
        setMessage('Brand updated successfully.');
      } else {
        setMessage('Failed to update brand.');
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      setMessage('Error updating brand.');
    }
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setEditForm({ name: '', slug: '', image: { thumbnail: '', original: '' } });
  };

  return (
    <div>
      <h2>Varumärken</h2>
      {message && <p>{message}</p>}
      {isLoading ? (
        <p>Laddar varumärken...</p>
      ) : (
        <ul style={ brands.length > 0 ? {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" } : {gridTemplateColumns: "1fr"}}>
          {brands.length > 0 ? (
            brands.map((brand) => (
              <li key={brand._id} style={styles.card}>
                {editingBrand === brand._id ? (
                  <form onSubmit={handleSubmitEdit} style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                    <div>
                      <label>Varumärkets namn:</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label>Varumärkets logga:</label>
                      <div style={{ display: "flex" }}>
                        <input type="file" onChange={handleImageUpload} />
                        {editForm.image.thumbnail && (
                          <img
                            src={editForm.image.thumbnail}
                            alt="Brand Thumbnail"
                            style={{ width: '100px', marginTop: '10px' }}
                          />
                        )}
                      </div>
                      {uploadStatus && <p>{uploadStatus}</p>} {/* Upload status */}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" className='btnGreen'>Spara</button>
                      <button type="button" className='btnRed' onClick={handleCancelEdit}>Avbryt</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
                    <h3>{brand.name}</h3>
                    <img
                      src={brand.image.thumbnail}
                      alt={brand.name}
                      style={{ width: '50px', height: '50px', marginRight: '10px' }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => handleEditBrand(brand)}>Ändra</button>
                      <button onClick={() => handleDeleteBrand(brand._id)} className='btnRed'>Ta bort</button>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <div style={{display: "flex", flexDirection: "column", textAlign: "center", justifyContent: "center"}}>
            <p>Inga tillgängliga varumärken.</p>
            <Link to="/add-brand" style={{ color: "black"}}>Klicka här för att lägga till</Link>
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export default ListBrandPage;
