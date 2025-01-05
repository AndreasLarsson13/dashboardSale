import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import categoriesData from '../../data/categoriesData'; // Adjust path as needed
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const currencyOptions = ['EUR', 'SEK']; // Currency options

const GeneralInfo = ({ setProduct }) => {
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subSubCategory, setSubSubCategory] = useState('');
  const [subSubSubCategory, setSubSubSubCategory] = useState(''); // New additional level
  const [brands, setBrands] = useState([]);
  const [currency, setCurrency] = useState('EUR'); // Default currency
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(''); // Delivery time in days

  // Fetch brands when component mounts
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
        const response = await axios.get('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/brands', {
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

  // Build category structure based on selected categories
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
                    ...(subSubSubCategory && {
                      child: [
                        {
                          name: subSubSubCategory,
                          slug: subSubSubCategory.toLowerCase(),
                        },
                      ],
                    }),
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

  // Update the product data based on user input
  useEffect(() => {
    setProduct((prev) => ({
      ...prev,
      countries: selectedCountries,
      category: buildCategoryStructure(),
      currency,
      deliveryTime, // Add delivery time to product data
    }));
  }, [selectedCountries, mainCategory, subCategory, subSubCategory, subSubSubCategory, currency, deliveryTime, setProduct]);
  

  const countryOptions = ['Alla', 'Sverige', 'Finland', 'Åland'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValue =
      ['price', 'sale_price', 'quantity', 'weightPack', 'widthPack', 'heightPack', 'lengthPack'].includes(name)
        ? Math.max(0, Number(value))
        : value;
    setProduct((prev) => ({ ...prev, [name]: updatedValue }));
  };

  // Handle checkbox changes for countries
  const handleCountryCheckboxChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      if (value === 'Alla') {
        setSelectedCountries(['Alla']);
      } else {
        setSelectedCountries((prev) => (prev.includes('Alla') ? [value] : [...prev, value]));
      }
    } else {
      if (value === 'Alla') {
        setSelectedCountries([]);
      } else {
        setSelectedCountries((prev) => prev.filter((country) => country !== value));
      }
    }
  };

  const handleMainCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory('');
    setSubSubCategory('');
  };

  const handleSubCategoryChange = (e) => {
    setSubCategory(e.target.value);
    setSubSubCategory('');
  };

  const handleSubSubCategoryChange = (e) => {
    setSubSubCategory(e.target.value);
  };

  const handleSubSubSubCategoryChange = (e) => {
    setSubSubSubCategory(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleDeliveryTimeChange = (e) => {
    const value = Math.max(0, Number(e.target.value)); // Ensure it's a non-negative number
    setDeliveryTime(value);
  };
  

  // Extract subcategories and sub-subcategories based on selected categories
  const selectedMainCategory = categoriesData[Object.keys(categoriesData).find(category => categoriesData[category].value === mainCategory)];
  const subcategories = selectedMainCategory ? selectedMainCategory.child : [];
  
  const selectedSubCategory = subcategories.find(sub => sub.value === subCategory);
  const subSubcategories = selectedSubCategory ? selectedSubCategory.child : [];

  const selectedSubSubCategory = subSubcategories.find((subSub) => subSub.value === subSubCategory);
  const subSubSubcategories = selectedSubSubCategory ? selectedSubSubCategory.child : [];
  

  const isFormCompleted =
    mainCategory &&
    currency &&
    ['price', 'sale_price', 'quantity', 'weightPack', 'widthPack', 'heightPack', 'lengthPack'].every(
      (key) => Number.isFinite(setProduct[key])
    );

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
          fontWeight: 'bold',
        }}
        onClick={() => setIsGeneralInfoOpen(!isGeneralInfoOpen)}
      >
        <span style={{ marginRight: '10px' }}>{isGeneralInfoOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
        <span>Produktinformation</span>
        <span style={{ marginLeft: 'auto', color: isFormCompleted ? 'green' : 'red' }}>
          {isFormCompleted ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {isGeneralInfoOpen && (
        <div>
          <div
            style={{
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px 20px',
              backgroundColor: '#eaeaea',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Namn:</label>
              <input
                type="text"
                name="name"
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
                onChange={handleInputChange}
                required
                style={{ width: '226px' }}
              />
            </div>

            {/* Brand Dropdown */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Varumärke:</label>
              <select name="brand" onChange={handleInputChange} required style={{ width: '226px' }}>
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
              <select name="currency" value={currency} onChange={handleCurrencyChange} required style={{ width: '226px' }}>
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
                onChange={handleInputChange}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
  <label>Är det en produktvariation?:</label>
  <input
    type="checkbox"
    name="produktvariation"
    onChange={(e) =>
      setProduct((prev) => ({ ...prev, produktvariation: e.target.checked }))
    }
    style={{ width: '20px', height: '20px' }}
  />
</div>


<div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
  <label>Vill du dölja produkten?:</label>
  <input
    type="checkbox"
    name="visaIgalleri"
    onChange={(e) =>
      setProduct((prev) => ({ ...prev, showingallery: e.target.checked }))
    }
    style={{ width: '20px', height: '20px' }}
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

            


{subSubSubcategories && subSubSubcategories.length > 0 && (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label>Underkategori 3:</label>
    <select value={subSubSubCategory} onChange={handleSubSubSubCategoryChange} style={{ marginBottom: '10px' }}>
      <option value="">Välj underkategori</option>
      {subSubSubcategories.map((subSubSub) => (
        <option key={subSubSub.value} value={subSubSub.value}>
          {subSubSub.label}
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
