import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { storage } from '../components/form/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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

const ListAccessoriesPage = () => {
  const [accessories, setAccessories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingAccessory, setEditingAccessory] = useState(null);
  const [editForm, setEditForm] = useState({
    namn: '',
    price: 0,
    color: '',
    meta: '',
    img: { url: '' },
  });
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const response = await axios.get('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/options');
        setAccessories(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching accessories:', error);
        setMessage('Error fetching accessories.');
        setIsLoading(false);
      }
    };
    fetchAccessories();
  }, []);

  const handleDeleteAccessory = async (accessoryId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this accessory?');
    if (!confirmDelete) return;
    try {
      const response = await axios.delete(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/deleteAccessory/${accessoryId}`);
      if (response.status === 200) {
        setAccessories(accessories.filter((accessory) => accessory._id !== accessoryId));
        setMessage('Accessory deleted successfully.');
      } else {
        setMessage('Failed to delete accessory.');
      }
    } catch (error) {
      console.error('Error deleting accessory:', error);
      setMessage('Error deleting accessory.');
    }
  };

  const handleEditAccessory = (accessory) => {
    setEditingAccessory(accessory._id);
    setEditForm({
      namn: accessory.namn,
      price: accessory.price,
      color: accessory.color || '',
      meta: accessory.meta || '',
      img: accessory.img || { url: '' },
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editForm.namn) return;
    setUploadStatus('Uploading image...');
    try {
      const normalizedNamn = editForm.namn.toLowerCase().replace(/\s+/g, '-');
      const storageRef = ref(storage, `tillbehor/${normalizedNamn}/${normalizedNamn}.webp`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, resolve);
      });
      const imageUrl = await getDownloadURL(storageRef);
      setEditForm((prevForm) => ({
        ...prevForm,
        img: { url: imageUrl },
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
      const response = await axios.put(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/updateAccessory/${editingAccessory}`, {
        namn: editForm.namn,
        price: editForm.price,
        color: editForm.color,
        meta: editForm.meta,
        img: editForm.img,
      });
      if (response.status === 200) {
        setAccessories(
          accessories.map((accessory) =>
            accessory._id === editingAccessory ? { ...accessory, ...editForm } : accessory
          )
        );
        setEditingAccessory(null);
        setMessage('Accessory updated successfully.');
      } else {
        setMessage('Failed to update accessory.');
      }
    } catch (error) {
      console.error('Error updating accessory:', error);
      setMessage('Error updating accessory.');
    }
  };

  const handleCancelEdit = () => {
    setEditingAccessory(null);
    setEditForm({ namn: '', price: 0, color: '', meta: '', img: { url: '' } });
  };

  return (
    <div>
      <h2>Lista på tillbehör</h2>
      {message && <p>{message}</p>}
      {isLoading ? (
        <p>Laddar tillbehör...</p>
      ) : (
        <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {accessories.length > 0 ? (
            accessories.map((accessory) => (
              <li key={accessory._id} style={{ ...styles.card, marginBottom: '0' }}>
                {editingAccessory === accessory._id ? (
                  <form
                    onSubmit={handleSubmitEdit}
                    style={{ alignItems: 'start', display: 'flex', flexDirection: 'column', gap: '20px' }}
                  >
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label>Namn:</label>
                        <input
                          type="text"
                          name="namn"
                          value={editForm.namn}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div style={{ width: '30%' }}>
                        <label>Pris:</label>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleInputChange}
                          required
                          style={{ maxWidth: '90%' }}
                        />
                      </div>
                    </div>
                    {accessory.meta && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <label>Färg:</label>
                        <select name="color" value={editForm.color} onChange={handleInputChange} required>
                          <option value="">Välj färg</option>
                          {colorOptions.map((color) => (
                            <option key={color.en} value={color.en}>
                              {color.sv}
                            </option>
                          ))}
                        </select>
                        <label>Meta Färg:</label>
                        <input
                          type="color"
                          name="meta"
                          value={editForm.meta}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
                    {accessory.img && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <label>Bild:</label>
                        <input type="file" onChange={handleImageUpload} />
                        {editForm.img.url && (
                          <img
                            src={editForm.img.url}
                            alt="Accessory Thumbnail"
                            style={{ width: '50px', height: '50px' }}
                          />
                        )}
                      </div>
                    )}
                    {uploadStatus && <p>{uploadStatus}</p>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btnGreen">
                        Spara
                      </button>
                      <button type="button" onClick={handleCancelEdit} className="btnRed">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ flexGrow: 1 }}>{accessory.namn}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ marginRight: '20px' }}>Pris: {accessory.price} SEK</span>
                      {accessory.attribute?.slug === 'color' && accessory.meta && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <p style={{ marginTop: 0 }}>Färg:</p>
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: accessory.meta,
                              marginRight: '10px',
                            }}
                          />
                        </div>
                      )}
                      {accessory.img && accessory.img.url && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <p style={{ marginTop: 0 }}>Vald bild:</p>
                          <img
                            src={accessory.img.url}
                            alt={accessory.namn}
                            style={{ width: '50px', height: '50px', marginRight: '10px' }}
                          />
                        </div>
                      )}
                      <div style={{ gap: '10px', display: 'flex' }}>
                        <button onClick={() => handleEditAccessory(accessory)} className="btnYellow">
                          Ändra
                        </button>
                        <button onClick={() => handleDeleteAccessory(accessory._id)} className="btnRed">
                          Ta bort
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p>No accessories available.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default ListAccessoriesPage;
