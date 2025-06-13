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
  const [selectedVariations, setSelectedVariations] = useState(initialSelectedVariations);
  const [productVariations, setProductVariations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log(selectedVariations)
  // Hämta variationer en gång vid mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProductVariations = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        if (isMounted) {
          setError('User not logged in');
          setLoading(false);
        }
        return;
      }

      try {
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
          if (axios.isCancel(err)) {
            console.log('Fetch avbröts');
          } else {
            setError(err.message || 'Failed to fetch product variations');
          }
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

  // Synca selectedVariations när productVariations, initialVariations eller product ändras
 
/*  useEffect(() => {
  if (!productVariations.length) return;

  const variationsToUse = initialSelectedVariations.length > 0
    ? initialSelectedVariations
    : (initialSelectedVariations?.options || []);

  const resolved = variationsToUse.map((item) => {
    const match = productVariations.find((p) => p._id === item.id);
    if (!match) return null;

    return {
      ...match,
      price: typeof item.price === 'object' ? item.price.value : item.price,
    };
  }).filter(Boolean);

  setSelectedVariations(resolved);

  onVariationsUpdate(resolved.map((v) => ({
    id: v._id,
    price: { value: v.price, currency: 'SEK' },
    product: true,
  })));
}, []); */
 
  // Hantera val i dropdown
  const handleVariationSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    if (selectedVariations.some((v) => v._id === selectedId)) return;

    const variation = productVariations.find((v) => v._id === selectedId);
    if (!variation) return;

    const updated = [...selectedVariations, variation];
    setSelectedVariations(updated);

    if (typeof onVariationsUpdate === 'function') {
      onVariationsUpdate(updated.map((v) => ({
        id: v._id,
        price: { value: v.price, currency: 'SEK' },
        product: true,
      })));
    }
  };

  // Ta bort variation
 const handleRemove = (e,rawId) => {
  e.preventDefault()
  // Rensa bort eventuellt e.preventDefault – du vill inte ha event här
  // Identifiera id-strängen, oavsett om rawId är ett objekt eller en sträng
  const idToRemove = rawId && typeof rawId === 'object' && rawId._id
    ? rawId._id
    : rawId;

  // Filtrera bort alla variationer vars _id eller id matchar
  const filtered = selectedVariations.filter(v => {
    // v._id är din primära nyckel, men om du har v.id i vissa fall, kolla det också
    return v._id !== idToRemove && v.id !== idToRemove;
  });

  // Logga före/efter om du vill debugga
  console.log('Före:', selectedVariations.map(v => v._id));
  console.log('Efter:', filtered.map(v => v._id));

  // Uppdatera local state
  setSelectedVariations(filtered);

  // Bubblar upp via onVariationsUpdate, om funktionen finns
  if (typeof onVariationsUpdate === 'function') {
    onVariationsUpdate(
      filtered.map(v => ({
        id: v._id,
        price: { value: v.price, currency: 'SEK' },
        product: true,
      }))
    );
  }

  // Bubblar upp remove-kallbacken
  if (typeof onVariationRemove === 'function') {
    onVariationRemove(idToRemove);
  }
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
                {v.name || v.title || 'Namnlös'} ({JSON.stringify(v.price.value)} SEK){' '}
                <button onClick={(e) => handleRemove(v)}>Ta bort</button>
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
