import React, { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the Quill styles
import 'react-quill/dist/quill.bubble.css'; // Import bubble theme if you use it for readOnly
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // Ikoner för FAQ och status

// Define ALL supported languages and their labels.
// These should be comprehensive as they define the *potential* languages.
const allSupportedLanguages = ['se', 'en', 'fi']; 
const defaultLanguageLabels = {
  se: 'Svenska',
  en: 'Engelska',
  fi: 'Finska'
};

const Description = ({ 
    product, 
    setProduct, 
    // Denna prop definierar ALLA möjliga språk produkten KAN ha.
    languages = allSupportedLanguages, 
    languageLabels = defaultLanguageLabels, 
    // isEditable avgör om EDITORN är redigerbar. Nu är den ALLTID true.
    // Men propens namn är kvar för tydlighet om du skulle vilja ändra beteende sen.
    isEditable = true // Vi sätter den till true som default, så editorn är alltid redigerbar.
}) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  
  // Bestäm vilka språkflikar som ska visas.
  // Flikarna visas endast om det är "redigeringsläge" (dvs. isEditable är true) OCH det finns fler än ett språk.
  const displayLanguages = useMemo(() => isEditable ? languages : ['se'], [isEditable, languages]);

  // Den aktiva språkfliken måste vara ett av de synliga språken.
  const [activeLanguage, setActiveLanguage] = useState(displayLanguages[0] || 'se');


  // Säkerställ att activeLanguage är ett giltigt språk om displayLanguages ändras
  useEffect(() => {
    if (!displayLanguages.includes(activeLanguage)) {
      setActiveLanguage(displayLanguages[0] || 'se');
    }
  }, [displayLanguages, activeLanguage]);


  const handleDescriptionChange = (lang, value) => {
    // Vi behöver inte längre 'if (!isEditable)' här eftersom editorn ALLTID ska vara redigerbar.
    const newDescription = { ...product.description };
    newDescription[lang] = value;
    setProduct({ ...product, description: newDescription });
  };

  // Kolla om beskrivningen är ifylld för det aktiva språket
  const isDescriptionCompleted = !!product.description?.[activeLanguage];

  // Bestäm om det finns flera språkflikar att visa
  const hasMultipleDisplayLanguages = displayLanguages.length > 1;

  // Quill modules configuration (toolbar)
  // Verktygsfältet ska alltid visas eftersom editorn alltid är redigerbar
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'bold': true }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  }), []); // Inga beroenden, skapas bara en gång

  // Quill formats configuration
  const quillFormats = useMemo(() => [
    'bold',
    'list',
    'align',
    'clean'
  ], []);


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
          {/* Flikar för att växla mellan språk - visas bara om det är redigeringsläge OCH fler än ett språk */}
          {hasMultipleDisplayLanguages && ( 
            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
              {displayLanguages.map((lang) => ( // Iterera över displayLanguages
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveLanguage(lang)}
                  style={{
                    padding: '5px 10px',
                    cursor: 'pointer', // Flikar är alltid klickbara om de visas
                    border: activeLanguage === lang ? '2px solid #007bff' : '1px solid #ccc',
                    background: activeLanguage === lang ? '#e6f0ff' : '#fff',
                    borderRadius: '5px',
                  }}
                  // "disabled" attributet tas bort från knapparna, eftersom de alltid är klickbara om de visas
                >
                  {languageLabels[lang]}
                </button>
              ))}
            </div>
          )}

          {/* ReactQuill editor för det aktiva språket */}
          <div>
            <label>{languageLabels[activeLanguage] || 'Okänd'} beskrivning:</label>
            <ReactQuill
              value={product.description?.[activeLanguage] || ''}
              onChange={(value) => handleDescriptionChange(activeLanguage, value)}
              readOnly={false} // Editorn är ALLTID redigerbar
              modules={quillModules} // Använd memoized modules
              formats={quillFormats} // Använd memoized formats
              theme="snow" // Använd alltid "snow" tema (standard med toolbar)
              style={{}} // Ingen specifik stil för readOnly längre
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Description;