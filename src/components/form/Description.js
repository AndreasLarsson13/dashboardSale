import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the Quill styles
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // Ikoner för FAQ och status

const Description = ({ product, setProduct }) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const handleDescriptionChange = (lang, value) => {
    const newDescription = { ...product.description };
    newDescription[lang] = value;
    setProduct({ ...product, description: newDescription });
  };

  // Kolla om beskrivningen är ifylld för SE
  const isDescriptionCompleted = !!product.description.se;

  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
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
        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
      >
        <span style={{ marginRight: '10px' }}>
          {isDescriptionOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span>Produkt beskrivning</span>

        {/* Statusikonen ändras beroende på om SE-beskrivningen är ifylld */}
        <span style={{ marginLeft: 'auto', color: isDescriptionCompleted ? 'green' : 'red' }}>
          {isDescriptionCompleted ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {isDescriptionOpen && (
        <div style={{ padding: '10px' }}>
          <label>Svensk beskrivning:</label>
          <ReactQuill
            value={product.description.se}
            onChange={(value) => handleDescriptionChange('se', value)}
            modules={Description.modules}
            formats={Description.formats}
          />
        </div>
      )}
    </div>
  );
};

// Quill modules and formats configuration
Description.modules = {
  toolbar: [
    [{ 'bold': true }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['clean'] // 'clean' button to clear formatting
  ],
};

Description.formats = [
  'bold',
  'list',
  'align',
  'clean' // 'clean' button to clear formatting
];

export default Description;
