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
  const [editingBrand, setEditingBrand] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', image: { thumbnail: '', original: '' } });
  const [uploadStatus, setUploadStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentComment, setCurrentComment] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setMessage('Användaren är inte inloggad.');
        setIsLoading(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin || false);

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/brands`, {
          params: { uid: user.uid, uidEmail: user.email },
        });

        setBrands(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Fel vid hämtning av varumärken:', error);
        setMessage('Ett fel uppstod vid hämtning av varumärken.');
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const resizeImage = (file, maxSize) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/webp', 0.8);
      };

      img.onerror = (err) => reject(err);
    });
  };

  const handleDeleteBrand = async (brandId) => {
    const confirmDelete = window.confirm('Är du säker på att du vill ta bort detta varumärke?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/deletebrand/${brandId}`, {
        method: 'delete',
      });

      if (response.ok) {
        setBrands(brands.filter((brand) => brand._id !== brandId));
        setMessage('Varumärket togs bort utan problem.');
      } else {
        setMessage('Problem med att ta bort varumärket.');
      }
    } catch (error) {
      console.error('Fel vid borttagning av varumärke:', error);
      setMessage('Fel vid borttagning av varumärke.');
    }
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand._id);
    setEditForm({
      name: brand.name,
      slug: brand.slug,
      image: brand.image,
      status: brand.status,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({
      ...prevForm,
      [name]: value,
      slug: name === 'name' ? generateSlug(value) : prevForm.slug,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('Laddar upp bild...');

    try {
      const resizedImage = await resizeImage(file, 198);
      const brandSlug = generateSlug(editForm.name);

      if (editForm.image.original) {
        const oldOriginalRef = ref(storage, `brands/${brandSlug}/${brandSlug}.webp`);
        const oldThumbnailRef = ref(storage, `brands/${brandSlug}/${brandSlug}_thumb.webp`);
        await deleteObject(oldOriginalRef).catch((error) => console.error('Fel vid borttagning av gammal bild:', error));
        await deleteObject(oldThumbnailRef).catch((error) => console.error('Fel vid borttagning av gammal thumbnail:', error));
      }

      const originalStorageRef = ref(storage, `brands/${brandSlug}/${brandSlug}.webp`);
      const thumbnailStorageRef = ref(storage, `brands/${brandSlug}/${brandSlug}_thumb.webp`);

      const [originalUploadTask, thumbnailUploadTask] = await Promise.all([
        uploadBytesResumable(originalStorageRef, resizedImage),
        uploadBytesResumable(thumbnailStorageRef, resizedImage),
      ]);

      const [originalURL, thumbnailURL] = await Promise.all([
        getDownloadURL(originalUploadTask.ref),
        getDownloadURL(thumbnailUploadTask.ref),
      ]);

      setEditForm((prevForm) => ({
        ...prevForm,
        image: {
          original: originalURL,
          thumbnail: thumbnailURL,
        },
      }));

      setUploadStatus('Uppladdning lyckades.');
    } catch (error) {
      console.error('Fel vid bilduppladdning:', error);
      setUploadStatus('Misslyckades att ladda upp bild.');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/updatebrand/${editingBrand}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setBrands(
brands.map((brand) =>
  brand._id === editingBrand ? { ...brand, ...editForm, status: 'pending' } : brand
)
        );
        setEditingBrand(null);
        setMessage('Varumärket uppdaterades framgångsrikt.');
      } else {
        setMessage('Misslyckades att uppdatera varumärket.');
      }
    } catch (error) {
      console.error('Fel vid uppdatering av varumärke:', error);
      setMessage('Fel vid uppdatering av varumärke.');
    }
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setEditForm({ name: '', slug: '', image: { thumbnail: '', original: '' } });
  };

  const getCardBackgroundColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#fff9c4'; // light yellow
      case 'rejected':
        return '#ffcdd2'; // light red
      default:
        return 'white'; // default background
    }
  };

  // Open modal and set comment text
  const openCommentModal = (comment) => {
    setCurrentComment(comment);
    setShowCommentModal(true);
  };

  // Close modal
  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentComment('');
  };

  return (
    <div>
      <h2>Varumärken</h2>
      {message && <p>{message}</p>}
      {isLoading ? (
        <p>Laddar varumärken...</p>
      ) : (
        <ul style={brands.length > 0 ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" } : { gridTemplateColumns: "1fr" }}>
          {brands.length > 0 ? (
            brands.map((brand) => (
              <li
                key={brand._id}
                style={{
                  ...styles.card,
                  backgroundColor: getCardBackgroundColor(brand.status),
                  position: 'relative',
                  paddingRight: '30px', // to make space for info icon
                }}
              >
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
                      {uploadStatus && <p>{uploadStatus}</p>}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" className='btnGreen'>Spara</button>
                      <button type="button" className='btnRed' onClick={handleCancelEdit}>Avbryt</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <h3 style={{ margin: 0 }}>
                        {brand.name} {brand.status === "pending" && "- Väntar på granskning"}
                      </h3>
                      {brand.reviewFailComment && (
                        <button
                          onClick={() => openCommentModal(brand.reviewFailComment)}
                          title="Det finns kommentarer om granskningen"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d32f2f',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            lineHeight: 1,
                            padding: 0,
                            marginLeft: '8px',
                          }}
                          aria-label="Visa granskningskommentarer"
                        >
                          &#9432; {/* info symbol */}
                        </button>
                      )}
                    </div>
                    <img
                      src={brand.image.thumbnail}
                      alt={brand.name}
                      style={{ width: '50px', height: '50px', marginRight: '10px', objectFit: 'contain' }}
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
            <div style={{ display: "flex", flexDirection: "column", textAlign: "center", justifyContent: "center" }}>
              <p>Inga tillgängliga varumärken.</p>
              <Link to="/add-brand" style={{ color: "black" }}>Klicka här för att lägga till</Link>
            </div>
          )}
        </ul>
      )}

      {/* Modal for review fail comment */}
      {showCommentModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={closeCommentModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Kommentar från granskning</h3>
            <p>{currentComment}</p>
            <button
              onClick={closeCommentModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                border: 'none',
                background: 'transparent',
                fontSize: '20px',
                cursor: 'pointer',
              }}
              aria-label="Stäng modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListBrandPage;
