import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const VariationsDropdown = ({
  product,
  initialSelectedVariations,
  onVariationsUpdate,
  onVariationRemove = () => {},
}) => {
  const [selectedVariations, setSelectedVariations] = useState([]);
  const [productVariations, setProductVariations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hämta alla variationer vid mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProductVariations = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) throw new Error('User not logged in');

        const token = await user.getIdToken();
        const response = await axios.get(
          'https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { uid: user.uid, uidEmail: user.email },
            signal: controller.signal,
          }
        );

        if (isMounted) {
          setProductVariations(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(axios.isCancel(err) ? 'Avbröts' : err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductVariations();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Synka initialSelectedVariations → selectedVariations när datan finns
  useEffect(() => {
    if (!productVariations.length) return;

    const variationsToUse = initialSelectedVariations?.length
      ? initialSelectedVariations
      : initialSelectedVariations?.options || [];

    const resolved = variationsToUse.map((item) => {
      const match = productVariations.find((p) => p._id === item._id || p._id === item.id);
      if (!match) return null;

      return {
        ...match,
        price: typeof item.price === 'object' ? item.price.value ?? item.price : item.price,
      };
    }).filter(Boolean);

    setSelectedVariations(resolved);

    if (typeof onVariationsUpdate === 'function') {
      onVariationsUpdate(resolved.map((v) => ({
        name: v.name,
        sku: v.sku,
        _id: v._id,
        price: { value: v.price, currency: 'SEK' },
        product: true,
      })));
    }
  }, [initialSelectedVariations, productVariations]);

  // Hantera val i dropdown
  const handleVariationSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    if (selectedVariations.some((v) => v._id === selectedId)) return;

    const variation = productVariations.find((v) => v._id === selectedId);
    if (!variation) return;

    const updated = [...selectedVariations, variation];
    setSelectedVariations(updated);

    onVariationsUpdate?.(updated.map((v) => ({
      name: v.name,
      sku: v.sku,
      _id: v._id,
      price: { value: v.price, currency: 'SEK' },
      product: true,
    })));
  };

  // Ta bort variation
 const handleRemove = (e, rawId) => {
  e.preventDefault();

  // Hämta ID att ta bort
  const idToRemove = typeof rawId === 'object' ? rawId._id ?? rawId.id : rawId;

  // Filtrera bort varianten som ska tas bort
  const filtered = selectedVariations.filter(
    (v) => v._id !== idToRemove && v.id !== idToRemove
  );

  // Uppdatera state
  setSelectedVariations(filtered);

  // Mappa till korrekt format direkt från det nya värdet
  const mapped = filtered.map((v) => {
    const value = v.price?.value?.value ?? v.price?.value ?? v.price;
    const currency = v.price?.currency ?? 'SEK';
    const dateChanged = v.price?.dateChanged ?? '';

    return {
      name: v.name,
      sku: v.sku,
      _id: v._id,
      price: {
        value: { value, currency, dateChanged },
        currency,
      },
      product: true,
    };
  });

  // Skicka uppdaterade variationer till parent
  onVariationsUpdate?.(mapped);
  onVariationRemove?.(idToRemove);
};


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
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        <span style={{ marginRight: 10 }}>
          {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span>Tillbehör</span>
        <span style={{ marginLeft: 'auto', color: selectedVariations.length ? 'green' : 'red' }}>
          {selectedVariations.length ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {isDropdownOpen && (
        <div style={{ padding: 10 }}>
          <label>
            Välj tillbehör:
            <select onChange={handleVariationSelect} defaultValue="">
              <option value="" disabled>-- Välj ett tillbehör --</option>
              {productVariations.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name || v.title || 'Namnlös'}
                </option>
              ))}
            </select>
          </label>

          <ul style={{ marginTop: 10 }}>
            {selectedVariations.map((v) => (
              <li key={v._id}>
                {v.name || v.title || 'Namnlös'} ({/* {v.price?.value?.value ?? v.price} */} SEK){' '}
                <button onClick={(e) => handleRemove(e, v)}>Ta bort</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && <p>Hämtar tillbehör...</p>}
      {error && <p style={{ color: 'red' }}>Fel: {error}</p>}
    </div>
  );
};

export default VariationsDropdown;
