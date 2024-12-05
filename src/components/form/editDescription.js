import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const languages = ['se', 'en', 'fi']; // Lägg till fler språk om det behövs

const languageLabels = {
  se: 'Svenska',
  en: 'Engelska',
  fi: 'Finska'
};

const Description = ({ product, setProduct }) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('se'); // Starta med svenska som aktivt språk

  const handleDescriptionChange = (lang, value) => {
    const newDescription = { ...product.description };
    newDescription[lang] = value;
    setProduct({ ...product, description: newDescription });
  };

  const isDescriptionCompleted = !!product.description[activeLanguage];

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
        <span>Produktbeskrivning</span>

        <span style={{ marginLeft: 'auto', color: isDescriptionCompleted ? 'green' : 'red' }}>
          {isDescriptionCompleted ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {isDescriptionOpen && (
        <div style={{ padding: '10px' }}>
          {/* Flikar för att växla mellan språk */}
          <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
            {languages.map((lang) => (
              <button
                key={lang}
                type="button" // Ensures the button does not act as a submit button
                onClick={() => setActiveLanguage(lang)}
                style={{
                  padding: '5px 10px',
                  cursor: 'pointer',
                  border: activeLanguage === lang ? '2px solid #007bff' : '1px solid #ccc',
                  background: activeLanguage === lang ? '#e6f0ff' : '#fff',
                  borderRadius: '5px'
                }}
              >
                {languageLabels[lang]}
              </button>
            ))}
          </div>

          {/* ReactQuill editor för det aktiva språket */}
          <div>
            <label>{languageLabels[activeLanguage]} beskrivning:</label>
            <ReactQuill
              value={product.description[activeLanguage] || ''}
              onChange={(value) => handleDescriptionChange(activeLanguage, value)}
              modules={Description.modules}
              formats={Description.formats}
            />
          </div>
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
    ['clean']
  ],
};

Description.formats = [
  'bold',
  'list',
  'align',
  'clean'
];

export default Description;
