import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import categoriesData from '../../data/categoriesData'; // Justera sökvägen efter behov
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const currencyOptions = ['EUR', 'USD', 'SEK', 'NOK', 'GBP']; // Valutaval

const GeneralInfo = ({ product, setProduct }) => {
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState(product?.countries || []);
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subSubCategory, setSubSubCategory] = useState('');
  const [brands, setBrands] = useState([]);
  const [currency, setCurrency] = useState(product?.currency || 'EUR');
  const [deliveryTime, setDeliveryTime] = useState(product?.deliveryTime || 0); // Nytt state för leveranstid
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Hämta varumärken när komponenten mountas
  useEffect(() => {
    const fetchBrands = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setMessage('User is not authenticated.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/brands', {
          params: { uid: user.uid, uidEmail: user.email },
        });

        setBrands(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setMessage('Error fetching brands.');
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Förinställning av kategorier från produkten när komponenten mountas
  useEffect(() => {
    if (product?.category && product.category.length > 0) {
      setMainCategory(product.category[0]?.name || '');
      if (product.category[0]?.child?.length > 0) {
        setSubCategory(product.category[0].child[0]?.name || '');
        if (product.category[0].child[0]?.child?.length > 0) {
          setSubSubCategory(product.category[0].child[0].child[0]?.name || '');
        }
      }
    }

    if (product?.countries) {
      setSelectedCountries(product.countries);
    }

    if (product?.deliveryTime) {
      setDeliveryTime(product.deliveryTime);
    }
  }, [product]);

  // Skapa kategoristruktur
  const buildCategoryStructure = () => {
    const structure = [
      {
        name: mainCategory,
        slug: mainCategory.toLowerCase(),
        ...(subCategory && {
          child: [
            {
              name: subCategory,
              slug: subCategory.toLowerCase(),
              ...(subSubCategory && {
                child: [
                  {
                    name: subSubCategory,
                    slug: subSubCategory.toLowerCase(),
                  },
                ],
              }),
            },
          ],
        }),
      },
    ];
    return structure;
  };

  useEffect(() => {
    setProduct((prev) => ({
      ...prev,
      countries: selectedCountries,
      category: buildCategoryStructure(),
      currency,
      deliveryTime, // Lägg till leveranstid i produkten
    }));
  }, [selectedCountries, mainCategory, subCategory, subSubCategory, currency, deliveryTime, setProduct]);

  const countryOptions = ['Alla', 'Sverige', 'Finland', 'Åland'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue =
      ['price', 'sale_price', 'quantity', 'weightPack', 'widthPack', 'heightPack', 'lengthPack'].includes(name)
        ? Math.max(0, Number(value))
        : value;
    setProduct({ ...product, [name]: updatedValue });
  };

  // Hantera checkbox-ändringar för länder
  const handleCountryCheckboxChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      if (value === 'Alla') {
        setSelectedCountries(['Alla']);
      } else {
        setSelectedCountries((prev) =>
          prev.includes('Alla') ? [value] : [...prev, value]
        );
      }
    } else {
      if (value === 'Alla') {
        setSelectedCountries([]);
      } else {
        setSelectedCountries((prev) =>
          prev.filter((country) => country !== value)
        );
      }
    }
  };

  const handleMainCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setMainCategory(selectedCategory);
    setSubCategory('');
    setSubSubCategory('');
  };

  const handleSubCategoryChange = (e) => {
    const selectedSubCategory = e.target.value;
    setSubCategory(selectedSubCategory);
    setSubSubCategory('');
  };

  const handleSubSubCategoryChange = (e) => {
    const selectedSubSubCategory = e.target.value;
    setSubSubCategory(selectedSubSubCategory);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleDeliveryTimeChange = (e) => {
    const value = Math.max(0, Number(e.target.value));
    setDeliveryTime(value);
  };
  const selectedMainCategory = categoriesData[Object.keys(categoriesData).find(category => categoriesData[category].value === mainCategory)];
  const subcategories = selectedMainCategory ? selectedMainCategory.child : [];
  
  const selectedSubCategory = subcategories.find(sub => sub.value === subCategory);
  const subSubcategories = selectedSubCategory ? selectedSubCategory.child : [];

  const isFormCompleted =
    product?.name &&
    product?.sku &&
    product?.price >= 0 &&
    product?.quantity >= 0 &&
    product?.brand &&
    product?.weightPack >= 0 &&
    product?.widthPack >= 0 &&
    product?.heightPack >= 0 &&
    product?.lengthPack >= 0 &&
    deliveryTime >= 0;

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
        onClick={() => setIsGeneralInfoOpen(!isGeneralInfoOpen)}
      >
        <span style={{ marginRight: '10px' }}>
          {isGeneralInfoOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span>Produktinformation</span>

        <span style={{ marginLeft: 'auto', color: isFormCompleted ? 'green' : 'red' }}>
          {isFormCompleted ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {isGeneralInfoOpen && (
        <div>
          <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 20px', backgroundColor: '#eaeaea' }}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Namn:</label>
              <input
                type="text"
                name="name"
                value={product?.name || ''}
                onChange={handleInputChange}
                required
                style={{ width: '226px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>SKU:</label>
              <input
                type="text"
                name="sku"
                value={product?.sku || ''}
                onChange={handleInputChange}
                required
                style={{ width: '226px' }}
              />
            </div>

            {/* Brand Dropdown */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Varumärke:</label>
              <select
                name="brand"
                value={product?.brand || ''}
                onChange={handleInputChange}
                required
                style={{ width: '226px' }}
              >
                <option value="">Välj ett varumärke</option>
                {brands.map((brand) => (
                  <option key={brand.slug} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Dropdown */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Valuta:</label>
              <select
                name="currency"
                value={currency}
                onChange={handleCurrencyChange}
                required
                style={{ width: '226px' }}
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Pris:</label>
              <input
                type="number"
                name="price"
                value={product?.price || 0}
                onChange={handleInputChange}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Försäljningspris:</label>
              <input
                type="number"
                name="sale_price"
                value={product?.sale_price || 0}
                onChange={handleInputChange}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Antal:</label>
              <input
                type="number"
                name="quantity"
                value={product?.quantity || 0}
                onChange={handleInputChange}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Ungefärlig leveranstid (dagar):</label>
              <input
                type="number"
                name="deliveryTime"
                value={deliveryTime}
                onChange={handleDeliveryTimeChange}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
                required
              />
            </div>
          </div>

          <div style={{ padding: '10px' }}>
            <label>Packningsinformation:</label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <label>Vikt (g):</label>
                <input
                  type="number"
                  name="weightPack"
                  value={product?.weightPack || 0}
                  onChange={handleInputChange}
                  required
                  style={{ width: '120px', fontSize: '19px', textAlign: 'right' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <label>Längd (mm):</label>
                <input
                  type="number"
                  name="lengthPack"
                  value={product?.lengthPack || 0}
                  onChange={handleInputChange}
                  required
                  style={{ width: '120px', fontSize: '19px', textAlign: 'right' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <label>Bredd (mm):</label>
                <input
                  type="number"
                  name="widthPack"
                  value={product?.widthPack || 0}
                  onChange={handleInputChange}
                  required
                  style={{ width: '120px', fontSize: '19px', textAlign: 'right' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <label>Höjd (mm):</label>
                <input
                  type="number"
                  name="heightPack"
                  value={product?.heightPack || 0}
                  onChange={handleInputChange}
                  required
                  style={{ width: '120px', fontSize: '19px', textAlign: 'right' }}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '10px', backgroundColor: '#eaeaea' }}>
            <label>Vilka länder får den säljas?</label>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {countryOptions.map((option) => (
                <div key={option} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedCountries.includes(option)}
                    onChange={handleCountryCheckboxChange}
                  />
                  <label style={{ marginLeft: '8px' }}>{option}</label>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '10px', display: 'flex', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label>Huvudkategori:</label>
              <select value={mainCategory} onChange={handleMainCategoryChange} style={{ marginBottom: '10px' }}>
                <option value="">Välj huvudkategori</option>
                {Object.keys(categoriesData).map((category) => (
                  <option key={category} value={categoriesData[category].value}>
                    {categoriesData[category].label}
                  </option>
                ))}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Underkategori 1:</label>
                <select value={subCategory} onChange={handleSubCategoryChange} style={{ marginBottom: '10px' }}>
                  <option value="">Välj underkategori</option>
                  {subcategories.map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {subSubcategories.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Underkategori 2:</label>
                <select value={subSubCategory} onChange={handleSubSubCategoryChange} style={{ marginBottom: '10px' }}>
                  <option value="">Välj underkategori</option>
                  {subSubcategories.map((subSub) => (
                    <option key={subSub.value} value={subSub.value}>
                      {subSub.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralInfo;
