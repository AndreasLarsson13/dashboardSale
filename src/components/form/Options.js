import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const VariationsDropdown = ({
  onVariationsUpdate,
  onVariationRemove = () => {},
}) => {
  const [selectedVariations, setSelectedVariations] = useState([]);
  const [variationOptions, setVariationOptions] = useState([]);
  const [productVariations, setProductVariations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch protected product variations with auth token
  useEffect(() => {
    const fetchProductVariations = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('User not logged in');
        setLoading(false);
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
        setProductVariations(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch product variations');
      } finally {
        setLoading(false);
      }
    };

    fetchProductVariations();
  }, []);

  // Fetch public variation options
  useEffect(() => {
    const fetchVariationOptions = async () => {
      try {
        const response = await fetch(
          'https://serverkundportal-dot-natbutiken.lm.r.appspot.com/productsoptions'
        );
        if (!response.ok) throw new Error('Failed to fetch variation options');
        const data = await response.json();
        setVariationOptions(data);
      } catch (err) {
        console.error('Error fetching variation options:', err);
      }
    };

    fetchVariationOptions();
  }, []);

  // Add a variation or product when selected, avoid duplicates
  const handleVariationSelect = (event) => {
    const selectedId = event.target.value;
    if (!selectedId) return;

    const foundOption =
      variationOptions.find((opt) => opt._id === selectedId) ||
      productVariations.find((opt) => opt._id === selectedId);

    if (!foundOption) {
      console.warn(`Selected option with id ${selectedId} not found`);
      return;
    }

    setSelectedVariations((prev) => {
      if (prev.some((v) => v._id === foundOption._id)) return prev;

      const updated = [...prev, foundOption];

      // Transform selected variations for parent callback
      const transformed = updated.map((item) => {
        const isProduct = productVariations.some((p) => p._id === item._id);
        return {
          id: item._id,
          ...(item.price !== undefined ? { price: item.price } : {}),
          ...(isProduct ? { product: true } : {}),
        };
      });

      onVariationsUpdate(transformed);
      return updated;
    });
  };

  // Validate if variations selected
  const areVariationsValid = selectedVariations.length > 0;

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 10,
          cursor: 'pointer',
          background: '#f1f1f1',
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold',
        }}
        onClick={() => setIsDropdownOpen((open) => !open)}
      >
        <span style={{ marginRight: 10 }}>
          {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span>Tillbehör</span>
        <span style={{ marginLeft: 'auto', color: areVariationsValid ? 'green' : 'red' }}>
          {areVariationsValid ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {isDropdownOpen && (
        <div style={{ padding: 10 }}>
          <label>
            Välj tillbehör (inget krav):
            <select onChange={handleVariationSelect} defaultValue="">
              <option value="" disabled>
                -- Välj ett/flera --
              </option>
              
            
                {productVariations.map((prod) => (
                  <option key={prod._id} value={prod._id}>
                    {prod.name || prod.title || 'Unnamed Product'}
                  </option>
                ))}
            
            </select>
          </label>

          <ul>
            {selectedVariations.map((v) => (
              <li key={v._id}>
                {v.name || v.title || 'Unnamed Variation'}{' '}
                <button
                  onClick={() => {
                    setSelectedVariations((prev) => {
                      const filtered = prev.filter((item) => item._id !== v._id);
                      onVariationsUpdate(
                        filtered.map((item) => ({
                          id: item._id,
                          price: item.price,
                          product: productVariations.some((p) => p._id === item._id),
                        }))
                      );
                      return filtered;
                    });
                    onVariationRemove(v._id);
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && <p>Loading variations...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};

export default VariationsDropdown;
