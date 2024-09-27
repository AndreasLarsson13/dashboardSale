import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { storage } from '../components/form/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { styles } from '../components/form/styleCart';

const colorOptions = [
  { sv: 'Röd', en: 'red' },
  { sv: 'Blå', en: 'blue' },
  { sv: 'Grön', en: 'green' },
  { sv: 'Gul', en: 'yellow' },
  { sv: 'Svart', en: 'black' },
  { sv: 'Vit', en: 'white' },
  { sv: 'Orange', en: 'orange' },
  { sv: 'Lila', en: 'purple' },
  { sv: 'Brun', en: 'brown' },
  { sv: 'Grå', en: 'gray' },
];

const AddAccessoryPage = () => {
  const [accessory, setAccessory] = useState({
    value: '',
    img: { url: '' },
    attribute: { name: '', slug: '' },
    price: 0,
    color: '',
    meta: '',
    type: '',
    namn: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'attributeName') {
      const slug = value.toLowerCase().replace(/\s+/g, '-');
      setAccessory((prevAccessory) => ({
        ...prevAccessory,
        attribute: {
          ...prevAccessory.attribute,
          name: value,
          slug,
        },
      }));
    } else if (name === 'price') {
      setAccessory((prevAccessory) => ({
        ...prevAccessory,
        price: parseFloat(value),
      }));
    } else if (name === 'type') {
      setAccessory((prevAccessory) => ({
        ...prevAccessory,
        type: value,
        img: { url: '' },
        meta: '',
        value: '',
      }));
      if (value === 'color') {
        setAccessory((prevAccessory) => ({
          ...prevAccessory,
          attribute: { name: 'color', slug: 'color' },
        }));
      }
    } else if (name === 'color') {
      setAccessory((prevAccessory) => ({
        ...prevAccessory,
        color: value,
        value: value,
      }));
    } else if (name === 'meta') {
      setAccessory((prevAccessory) => ({
        ...prevAccessory,
        meta: value,
      }));
    } else {
      setAccessory((prevAccessory) => ({
        ...prevAccessory,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    try {
      const accessorySlug = accessory.namn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const storageRef = ref(storage, `tillbehor/${accessorySlug}/${accessorySlug}.webp`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, resolve);
      });
      const imageUrl = await getDownloadURL(storageRef);
      setAccessory((prevAccessory) => ({
        ...prevAccessory,
        img: { url: imageUrl },
        value: true,
      }));
      setUploadStatus('Upload successful.');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus('Failed to upload image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    const accessoryToSubmit = { ...accessory };
    delete accessoryToSubmit.type;
    if (accessory.type !== 'image') {
      delete accessoryToSubmit.img;
    }
    if (accessory.type !== 'color') {
      delete accessoryToSubmit.meta;
    }
    delete accessoryToSubmit.color;

    accessoryToSubmit.uid = user.uid;
    accessoryToSubmit.email = user.email;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:4011/addOptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessoryToSubmit),
      });
      if (response.ok) {
        setMessage('Accessory added successfully!');
        setAccessory({
          value: '',
          img: { url: '' },
          attribute: { name: '', slug: '' },
          price: 0,
          color: '',
          meta: '',
          type: '',
          namn: ''
        });
      } else {
        setMessage('Failed to add accessory.');
      }
    } catch (error) {
      console.error('Error adding accessory:', error);
      setMessage('Error adding accessory.');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <h2>Lägg till tillbehör</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={{ ...styles.card, width: '100%' }}>
        <div style={{ display: 'flex', gap: '80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
              <label htmlFor="namn">Namn:</label>
              <input
                type="text"
                name="namn"
                id="namn"
                value={accessory.namn}
                onChange={handleInputChange}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
              <label htmlFor="type">Välj tillbehör:</label>
              <select
                name="type"
                id="type"
                value={accessory.type}
                onChange={handleInputChange}
                required
                style={{ flexGrow: 1 }}
              >
                <option value="">Select Type</option>
                <option value="color">Färg</option>
                <option value="image">Bild</option>
                <option value="other">Andra</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
              <label htmlFor="price">Pris:</label>
              <input
                type="number"
                name="price"
                id="price"
                value={accessory.price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          {accessory.type === 'color' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
                <label htmlFor="color">Färgval:</label>
                <select
                  name="color"
                  id="color"
                  value={accessory.color}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Välj färg</option>
                  {colorOptions.map((color) => (
                    <option key={color.en} value={color.en}>
                      {color.sv}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
                <label htmlFor="meta">Meta (som synd för kund):</label>
                <input
                  type="color"
                  name="meta"
                  id="meta"
                  value={accessory.meta}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}
          {accessory.type === 'image' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
                <label htmlFor="attributeName">Namn som kund ser:</label>
                <input
                  type="text"
                  name="attributeName"
                  id="attributeName"
                  value={accessory.attribute.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div style={{ height: '80px', display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
                <label htmlFor="img">Ladda upp bild: </label>
                <input
                  type="file"
                  id="img"
                  onChange={handleImageUpload}
                  required
                  style={{ width: '220px' }}
                />
                {accessory.img.url && (
                  <img src={accessory.img.url} alt="Accessory Thumbnail" style={{ width: '80px', height: '80px' }} />
                )}
              </div>
              {uploadStatus && <p>{uploadStatus}</p>}
            </div>
          )}
          {accessory.type === 'other' && (
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label htmlFor="value">Enhet/värde:</label>
                <input
                  type="text"
                  name="value"
                  id="value"
                  value={accessory.value}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label htmlFor="attributeName">Gruppnamn:</label>
                <input
                  type="text"
                  name="attributeName"
                  id="attributeName"
                  value={accessory.attribute.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ marginTop: '20px' }}>
          {isSubmitting ? 'Läggs till...' : 'Lägg till variation'}
        </button>
      </form>
    </div>
  );
};

export default AddAccessoryPage;
