import React, { useState } from 'react';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth to get the current user
import imageCompression from 'browser-image-compression';
import { storage } from '../components/form/firebaseConfig'; // Your Firebase configuration
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { styles } from '../components/form/styleCart';

const AddBrandPage = () => {
  const [brand, setBrand] = useState({
    name: '',
    slug: '', // New field for slug
    image: { thumbnail: '', original: '' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState(false); // To track upload status

  // Function to generate slug from brand name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove any special characters except hyphens and numbers
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      const slug = generateSlug(value); // Generate the slug whenever the name changes
      setBrand((prevBrand) => ({
        ...prevBrand,
        name: value,
        slug, // Update slug in brand state
      }));
    } else {
      setBrand((prevBrand) => ({
        ...prevBrand,
        [name]: value,
      }));
    }
  };

  // Resize image to 198x198 pixels
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 198;
        canvas.height = 198;

        // Draw the image with the new dimensions
        ctx.drawImage(img, 0, 0, 198, 198);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/webp', 0.8); // Compress to WebP format
      };

      img.onerror = () => reject(new Error('Failed to load the image'));

      img.src = URL.createObjectURL(file); // Load the image from the file input
    });
  };

  // Handle image upload or update
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!brand.slug) {
      setMessage('Please provide a brand name to generate a slug.');
      return;
    }

    setUploadStatus(false);

    try {
      // Check if an image already exists and delete the old one
      if (brand.image.original) {
        const oldOriginalRef = ref(storage, `brands/${brand.slug}/${brand.slug}.webp`);
        const oldThumbnailRef = ref(storage, `brands/${brand.slug}/${brand.slug}_thumb.webp`);

        // Delete the old images
        await deleteObject(oldOriginalRef);
        await deleteObject(oldThumbnailRef);
      }

      const resizedImage = await resizeImage(file); // Resize image to 198x198

      // Use brand.slug for file naming instead of file.name
      const originalStorageRef = ref(storage, `brands/${brand.slug}/${brand.slug}.webp`);
      const thumbnailStorageRef = ref(storage, `brands/${brand.slug}/${brand.slug}_thumb.webp`);

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

      setBrand((prevBrand) => ({
        ...prevBrand,
        image: {
          thumbnail: thumbnailURL,
          original: originalURL,
        },
      }));

      setUploadStatus(true); // Image upload successful
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Error updating the image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!brand.name) {
      setMessage('Please fill in the required fields.');
      return;
    }

    if (!uploadStatus) {
      setMessage('Please upload the brand image.');
      return;
    }

    brand.uid = user.uid;
    brand.email = user.email;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:4011/addBrand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brand), // Now includes slug and updated image
      });

      if (response.ok) {
        setMessage('Brand added successfully!');
        setBrand({ name: '', slug: '', image: { thumbnail: '', original: '' } }); // Reset the form
      } else {
        setMessage('Failed to add brand.');
      }
    } catch (error) {
      console.error('Error adding brand:', error);
      setMessage('Error adding brand.');
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      <h2>Lägg till varumärke</h2>
      {message && <p>{message}</p>}
      <form
        onSubmit={handleSubmit}
        style={{
          ...styles.card,
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <label htmlFor="name">Varumärkets namn:</label>
          <input
            type="text"
            name="name"
            id="name"
            value={brand.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="image">Ladda upp eller uppdatera bild:</label>
          <input type="file" id="image" onChange={handleImageUpload} />
          {brand.image.thumbnail && (
            <img
              src={brand.image.thumbnail}
              alt="Brand Thumbnail"
              style={{ width: '100px', marginTop: '10px' }}
            />
          )}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ justifyContent: 'flex-start' }}>
          {isSubmitting ? 'Submitting...' : 'Lägg till varumärke'}
        </button>
      </form>
    </div>
  );
};

export default AddBrandPage;
