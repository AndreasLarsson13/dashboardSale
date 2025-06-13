import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './keywordInput.css'; // Om du använder extern CSS

const KeywordInput = ({ compadibleWith, setcompadibleWith }) => {
  const [input, setInput] = useState('');

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = input.trim();
    if (trimmed && !compadibleWith.includes(trimmed)) {
      setcompadibleWith([...compadibleWith, trimmed]);
    }
    setInput('');
  };

  const handleRemove = (keywordToRemove) => {
    setcompadibleWith(compadibleWith.filter(k => k !== keywordToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };
  console.log(compadibleWith)

  return (
    <div className="keyword-wrapper">
      <label className="keyword-label">Produkter den passar med (Skriv med små bokstäver):</label>
      <div className="keyword-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Lägg till sökord"
          className="keyword-input"
        />
        <button onClick={handleAdd} className="keyword-button">Lägg till</button>
      </div>
      <div className="keyword-list">
        {compadibleWith.map((keyword) => (
          <span key={keyword} className="keyword-item">
            {keyword}
            <FaTimes
              className="keyword-remove-icon"
              onClick={() => handleRemove(keyword)}
            />
          </span>
        ))}
      </div>
    </div>
  );
};

export default KeywordInput;
