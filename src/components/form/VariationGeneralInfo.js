import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import categoriesData from '../../data/categoriesData'; // Adjust path as needed
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import SpecialShippingSelector from '../form/SpecialShippingSelector'

const currencyOptions = ['EUR', 'SEK']; // Currency options




const GeneralInfo = ({product, setProduct, accessory }) => {
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
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
  const [shippingCosts, setShippingCosts] = useState({ });
  const [shippingCurrency, setShippingCurrency] = useState('SEK');
  const [price, setPrice] = useState(""); // Pris state
const [specialShippingEnabled, setSpecialShippingEnabled] = useState(false);

const [shippingSpecial, setShippingSpecial] = useState({
  combinedWith: [],
  units: 1,
});

// Mockad lista över produkter att kombinera med
const allProducts = [
  { _id: 'abc123', name: 'Produkt A' },
  { _id: 'def456', name: 'Produkt B' },
  { _id: 'ghi789', name: 'Produkt C' },
];


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

  
 

  // Update the product data based on user input
  useEffect(() => {
    setProduct((prev) => ({
      ...prev,
      sellInCountries : selectedCountries,
/*       category: buildCategoryStructure(),
 */      currency,
      deliveryTime, // Add delivery time to product data
      searchKeywords,
      shippingCosts,
      shippingCurrency,
    
      shippingSpecial,
      categoryPath : [mainCategory, subCategory, subSubCategory].filter(Boolean)
    }));
  }, [selectedCountries, shippingSpecial, mainCategory, subCategory, subSubCategory,  subSubSubCategory, currency, deliveryTime,searchKeywords, setProduct, shippingCosts, shippingCurrency]);
  

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
      [country]: { value, originalCurrency: true,  currency: currency }, // Endast senaste valda valutan sparas
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
              <label>Gruppnamn:</label>
              <input
                type="text"
                name="variationGroup"
                onChange={handleInputChange}
                required
                value={accessory.type}
                style={{ width: '226px' }}
              />
            </div>
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
              <label>Namn på huvudprodukt:</label>
              <input
                type="text"
                name="name_parrent"
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
                required
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

{/* {specialShippingEnabled && (
  <SpecialShippingSelector
    value={shippingSpecial.combinedWith}
    onChange={(newIds) =>
      setShippingSpecial((prev) => ({ ...prev, combinedWith: newIds }))
    }
  />
)} */}





          <div
            style={{
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px 20px',
              backgroundColor: 'red',
            }}
          >
           

          

           





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
    {countryOptions.map((country) => (
      <div key={country}>
        <input
          type="checkbox"
          value={country}
          checked={selectedCountries.includes(country)}
          onChange={handleCountryCheckboxChange}
        />
        {country}
        {selectedCountries.includes(country) && (
          <input
            type="text"
            placeholder={`Frakt ${country}`}
            value={shippingCosts[country]?.[shippingCurrency]?.value || ''}
            onChange={(e) => handleShippingCostChange(e, country, shippingCurrency)}
          />
        )}
      </div>
    ))}
  </div>
  {selectedCountries.length > 0 && (
  <div>
    <h4>Leveranstid per land (dagar)</h4>
    {selectedCountries.map((countryCode) => (
      <div key={countryCode}>
        <label>
          {countryCode.toUpperCase()}:
          <input
            type="number"
            value={deliveryTime[countryCode] || ''}
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


            

           

            





        </div>
         
       
      )}


        
    </div>
  );
};

export default GeneralInfo;
