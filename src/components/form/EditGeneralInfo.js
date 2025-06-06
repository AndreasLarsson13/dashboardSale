import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import categoriesData from '../../data/categoriesData'; // Adjust path as needed
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import SpecialShippingSelector from '../form/SpecialShippingSelector'

const currencyOptions = ['EUR', 'SEK']; // Currency options
const productOriginOptions = ['SV', 'AX', 'FI']; // Currency options

const countryLabels = {
  SV: 'Sverige',
  FI: 'Finland',
  AX: 'Åland',
};


const GeneralInfo = ({product, setProduct }) => {
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);

  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subSubCategory, setSubSubCategory] = useState('');
  const [subSubSubCategory, setSubSubSubCategory] = useState(''); // New additional level
  const [brands, setBrands] = useState([]);
  const [currency, setCurrency] = useState('SEK'); // Default currency
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
const [deliveryTime, setDeliveryTime] = useState({});
  const [searchKeywords, setsearchKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
const [shippingCosts, setShippingCosts] = React.useState(product.shippingCosts || {});
const [shippingCurrency, setShippingCurrency] = React.useState(product.shippingCurrency || 'SEK');
  const [price, setPrice] = useState(product.price.value); // Pris state
const [specialShippingEnabled, setSpecialShippingEnabled] = useState(false);



const [selectedCountries, setSelectedCountries] = React.useState(product.sellInCountries || []);

const [productCountryOfOrigin, setProductCountryOfOrgin] = React.useState(product.productCountryOfOrigin || '');

const [shippingSpecial, setShippingSpecial] = useState({
  combinedWith: [],
  units: 1,
});





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


  
//Sökord
const handleAddKeyword = (e) => {
  e.preventDefault(); //

  if (keywordInput.trim() && !searchKeywords.includes(keywordInput.trim())) {
    setsearchKeywords([...searchKeywords, keywordInput.trim()]);
    setKeywordInput('');
  }
};

const handleRemoveKeyword = (keyword) => {
  setsearchKeywords(searchKeywords.filter((k) => k !== keyword));
};

  
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

  /* useEffect(() => {
  if (product) {
    setSelectedCountries(product.sellInCountries || []);
    setShippingCosts(product.shippingCosts || {});
    setDeliveryTime(product.deliveryTime || []);

    const first = Object.keys(product.shippingCosts || {})[0];
    if (first) {
      setShippingCurrency(product.shippingCosts[first]?.currency || "SEK");
    }
  }
}, []); */

  // Update the product data based on user input
  useEffect(() => {
    setProduct((prev) => ({
      ...prev,
      sellInCountries : selectedCountries,
      category: buildCategoryStructure(),
      currency,
      deliveryTime, // Add delivery time to product data
      searchKeywords,
      shippingCosts,
      shippingCurrency,
      productCountryOfOrigin,
      shippingSpecial,
      categoryPath : [mainCategory, subCategory, subSubCategory].filter(Boolean)
    }));
  }, [selectedCountries, shippingSpecial, mainCategory, subCategory, subSubCategory,productCountryOfOrigin,  subSubSubCategory, currency, deliveryTime,searchKeywords, setProduct, shippingCosts, shippingCurrency]);
  

  const countryOptions = ['SV', 'FI', 'AX'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const updatedValue =
      ['quantity', 'weightPack', 'widthPack', 'heightPack', 'lengthPack'].includes(name)
        ? Math.max(0, Number(value))
        : value;
  
       


   setProduct((prev) => ({
          ...prev,
          [name]: 
            (name === 'price' || name === 'sale_price'|| name === 'buying_price' )
              ? 
                { 
                    value: Math.max(0, Number(value)), 
                    dateChanged: new Date().toISOString(), // Store the date when the price was set
                    origialCurrency: true,
                    currency : currency
                  
                }
              : updatedValue
        }));

  };

  
  

  // Handle checkbox changes for countries
  const handleCountryCheckboxChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      
        setSelectedCountries((prev) => ([...prev, value]));
      
    } else {
        setSelectedCountries((prev) => prev.filter((country) => country !== value));
      
    }
  };

  const handleShippingCostChange = (e, country, currency) => {
    const value = parseInt(e.target.value) || 0;
  
    setShippingCosts(prev => ({
      ...prev,
      [country]: { value, originalCurrency: true, currency: currency }, // Endast senaste valda valutan sparas
    }));
  };
  

  const handleShippingCurrencyChange = (e) => {
    setShippingCurrency(e.target.value);
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

  const handleCurrencyChange = (event) => {
    const newCurrency = event.target.value;
    setCurrency(newCurrency);
    const priceInput = document.getElementById('price');
    const salepriceInput = document.getElementById('sale_price');
const buyingpriceInput = document.getElementById('buying_price');
    priceInput.value = ""
    salepriceInput.value = ""
    buyingpriceInput.value= ""
  };
  
  const handleProductCountryOfOrginChange = (e) => {
    console.log(e.target.value)
    
    setProductCountryOfOrgin(e.target.value);

  };



const handleCombinedWithChange = (e) => {
  const options = Array.from(e.target.selectedOptions);
  const values = options.map((o) => o.value);
  setShippingSpecial((prev) => ({ ...prev, combinedWith: values }));
};

// Uppdatera units direkt i parent
const handleUnitsChange = (e) => {
  const value = parseInt(e.target.value, 10);
  setShippingSpecial(prev => ({ ...prev, units: isNaN(value) ? 1 : value }));
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
    ['price', 'sale_price','buying_price' ,'quantity', 'weightPack', 'widthPack', 'heightPack', 'lengthPack'].every(
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
                value={product.name}
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
                value={product.sku}
                style={{ width: '226px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Artiekelnummer från leverantör:</label>
              <input
                type="text"
                name="supplierArticleNumber"
                onChange={handleInputChange}
                required
                value={product.supplierArticleNumber}
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
              <label>Orginal valuta på produkt:</label>
              <select name="currency" value={currency} onChange={handleCurrencyChange} required style={{ width: '226px' }}>
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>


             <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Inköpspris:</label>
              <input
                type="number"
                name="buying_price"
                  id="buying_price"
                onChange={handleInputChange}
                value={product.buying_price.value}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Pris:</label>
              <input
                type="number"
                name="price"
                  id="price"
                onChange={handleInputChange}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
                value={product.price.value}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Försäljningspris:</label>
              <input
                type="number"
                id="sale_price"
                name="sale_price"
                onChange={handleInputChange}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
                value={product.sale_price.value || 0}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Antal produkter i lager:</label>
              <input
                type="number"
                name="quantity"
                onChange={handleInputChange}
                style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
                min="0"
                value={product.quantity.value || 0}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
  <label>Är detta ett tillbehör?:</label>
  <input
    type="checkbox"
    name="isProductOption"
    onChange={(e) =>
      setProduct((prev) => ({ ...prev, isProductOption: e.target.checked }))
    }
  
    style={{ width: '20px', height: '20px' }}
  />
</div>


<div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
  <label>Vill du dölja produkten? (Från text filtersidan):</label>
  <input
    type="checkbox"
    name="hideProductFromView"
    onChange={(e) =>
      setProduct((prev) => ({ ...prev, hideProductFromView: e.target.checked }))
    }
    style={{ width: '20px', height: '20px' }}
  />
</div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
 {/*  <label>Ungefärlig leveranstid (dagar):</label>
  <input
    type="number"
    name="deliveryTime"
    value={deliveryTime}
    onChange={handleDeliveryTimeChange}
    style={{ width: '226px', fontSize: '19px', textAlign: 'right' }}
    min="0"
    required
  /> */}
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
                  value={product.weightPack}
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
                  value={product.lengthPack}
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
                  value={product.widthPack}
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
                  value={product.heightPack}
                  style={{ width: '120px', fontSize: '19px', textAlign: 'right' }}
                />
              </div>
            </div>
          </div>
<div style={{ marginBottom: '10px' }}>
  <label>
    <input
      type="checkbox"
      checked={specialShippingEnabled}
      onChange={(e) => setSpecialShippingEnabled(e.target.checked)}
    />
    {' '}Klicka här för speciell frakt logik
  </label>
</div>
{/* {specialShippingEnabled && (
  <SpecialShippingSelector
    value={shippingSpecial.combinedWith}
    onChange={(newIds) =>
      setShippingSpecial((prev) => ({ ...prev, combinedWith: newIds }))
    }
  />
)} */}

{specialShippingEnabled && (
        <div style={{ marginTop: '15px' }}>
           <SpecialShippingSelector
    value={shippingSpecial.combinedWith}
    onChange={(newIds) =>
      setShippingSpecial((prev) => ({ ...prev, combinedWith: newIds }))
    }
  />

          <label style={{ marginTop: '10px' }}>
            Antal enheter för fraktrabatt:{' '}
            <input
              type="number"
              min="1"
              value={shippingSpecial.units}
              onChange={handleUnitsChange}
              style={{ width: '80px' }}
            />
          </label>
        </div>
      )}



          <div
            style={{
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px 20px',
              backgroundColor: 'red',
            }}
          >
           


            {/* Currency Dropdown */}
           <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
  <label>Vilket land utgår produkten från:</label>
  <select
  name="countryOfOrigin"
  value={product.productCountryOfOrigin}
  onChange={handleProductCountryOfOrginChange}
  required
  style={{ width: '226px' }}
>
  {productOriginOptions.map((code) => (
    <option key={code} value={code}>
      {countryLabels[code] || 'Okänt land'}
    </option>
  ))}
</select>
</div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#eaeaea' }}>
         <div> <label>Valuta för frakt:</label>
  <select value={shippingCurrency} onChange={handleShippingCurrencyChange}>
    {currencyOptions.map((currency) => (
      <option key={currency} value={currency}>{currency}</option>
    ))}
  </select>
  </div>
  <div>
  <label>Vilka länder får den säljas?</label>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {product.sellInCountries.map((country) => (
  <div key={country} style={{ marginBottom: '8px' }}>
    <label>
      <input
        type="checkbox"
        value={country}
        checked={product.sellInCountries.includes(country)}
        onChange={(e) => {
          const checked = e.target.checked;
          setSelectedCountries((prev) =>
            checked ? [...prev, country] : prev.filter(c => c !== country)
          );
        }}
      />
      {country}
    </label>

    {selectedCountries.includes(country) && (
      <input
        type="number"
        placeholder={`Frakt ${country}`}
        value={shippingCosts[country] || ''}
        onChange={(e) => {
          const value = e.target.value;
          setShippingCosts((prev) => ({
            ...prev,
            [country]: value ? Number(value) : ''
          }));
        }}
        style={{ marginLeft: '10px', width: '100px' }}
      />
    )}
  </div>
))}

  </div>

  {Array.isArray(selectedCountries) && selectedCountries.length > 0 && (
    <div>
      <h4>Leveranstid per land (dagar)</h4>
      {selectedCountries.map((countryCode) => (
        <div key={countryCode}>
          <label>
            {countryCode.toUpperCase()}:
            <input
              type="number"
              value={(deliveryTime && deliveryTime[countryCode]) || ''}
              onChange={(e) =>
                setDeliveryTime((prev) => ({
                  ...prev,
                  [countryCode]: Number(e.target.value),
                }))
              }
              placeholder={`Leveranstid för ${countryCode.toUpperCase()}`}
            />
          </label>
        </div>
      ))}
    </div>
  )}
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

<div className="keyword-section">
            <label>Sökord:</label>
            <div className="keyword-input-container">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Lägg till sökord"
              />
              <button onClick={handleAddKeyword} >Lägg till</button>
            </div>
            <div className="keyword-list">
              {searchKeywords.map((keyword) => (
                <span key={keyword} className="keyword-item">
                  {keyword} <FaTimes onClick={() => handleRemoveKeyword(keyword)} />
                </span>
              ))}
            </div>
          </div>
        </div>
          </div>
       
      )}


        
    </div>
  );
};

export default GeneralInfo;
