import React, { useState } from 'react';

const EditWebsiteImageModal = ({ index, onClose }) => {
  const [images, setImages] = useState({ sv: null, en: null, fi: null });
  const [alt, setAlt] = useState({ sv: '', en: '', fi: '' });

  const handleFileChange = (lang, file) => {
    setImages((prev) => ({ ...prev, [lang]: file }));
  };

  const handleSave = () => {
    // Här laddar du upp bilder och sparar metadata till Firebase eller backend
    console.log('Sparar bild', { index, images, alt });
    onClose();
  };

  return (
    <div style={modalStyle}>
      <h3>Redigera Bild #{index + 1}</h3>

      {['sv', 'en', 'fi'].map((lang) => (
        <div key={lang} style={{ marginBottom: 20 }}>
          <label>
            {lang.toUpperCase()} alt-text:
            <input
              type="text"
              value={alt[lang]}
              onChange={(e) => setAlt({ ...alt, [lang]: e.target.value })}
              style={{ width: '100%' }}
            />
          </label>
          <br />
          <label>
            {lang.toUpperCase()} bild:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(lang, e.target.files[0])}
            />
          </label>
        </div>
      ))}

      <button onClick={handleSave}>Spara</button>
      <button onClick={onClose} style={{ marginLeft: 10 }}>Avbryt</button>
    </div>
  );
};

const modalStyle = {
  position: 'fixed',
  top: '10%',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  zIndex: 1000,
  width: '400px',
};

export default EditWebsiteImageModal;
