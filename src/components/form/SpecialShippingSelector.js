import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const SpecialShippingSelector = ({ value = [], onChange }) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('User not logged in');
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await axios.get(
          'https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { uid: user.uid, uidEmail: user.email },
          }
        );

        setOptions(response.data || []);
        const preselected = response.data.filter((p) => value.includes(p._id));
        setSelected(preselected);
      } catch (err) {
        setError('Kunde inte hämta produkter');
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  const handleSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const found = options.find((opt) => opt._id === selectedId);
    if (!found || selected.some((s) => s._id === found._id)) return;

    const updated = [...selected, found];
    setSelected(updated);
    onChange(updated.map((item) => item._id));
  };

  const handleRemove = (idToRemove) => {
    const updated = selected.filter((item) => item._id !== idToRemove);
    setSelected(updated);
    onChange(updated.map((item) => item._id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label>Välj produkter för att kombinera frakt:</label>

      <select onChange={handleSelect} value="">
        <option value="">-- Välj produkt --</option>
        {options.map((opt) => (
          <option key={opt._id} value={opt._id}>
            {opt.name}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {selected.map((item) => (
          <div
            key={item._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#e0f0e0',
              borderRadius: '4px',
              padding: '4px 8px',
            }}
          >
            {item.name}
            <button
              type="button"
              onClick={() => handleRemove(item._id)}
              style={{
                marginLeft: '6px',
                background: 'none',
                border: 'none',
                color: '#c00',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default SpecialShippingSelector;
