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
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subSubCategory, setSubSubCategory] = useState('');
  const [subSubSubCategory, setSubSubSubCategory] = useState(''); // New additional level
  const [brands, setBrands] = useState([]);
  const [currency, setCurrency] = useState('SEK'); // Default currency
  const [productCountryOfOrigin, setProductCountryOfOrgin] = useState('AX')
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
const [deliveryTime, setDeliveryTime] = useState({});
  const [searchKeywords, setsearchKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [shippingCosts, setShippingCosts] = useState({ });
  const [shippingCurrency, setShippingCurrency] = useState('SEK');
  const [price, setPrice] = useState(""); // Pris state
const [specialShippingEnabled, setSpecialShippingEnabled] = useState(false);
const [sellInCountries, setSellInCountries] = useState({
});
const [specialProductData, setSpecialProductData] = useState(false);


  const [showExtra, setShowExtra] = useState(false);
  const [info, setInfo] = useState('');
  const [salesOption, setSalesOption] = useState('direct');

const [shippingSpecial, setShippingSpecial] = useState({
  combinedWith: [],
  units: 1,
  enabled: false // kan ha med en flagga här om du vill
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
      sellInCountries : selectedCountries,
      category: buildCategoryStructure(),
      currency,
      deliveryTime, // Add delivery time to product data
      searchKeywords,
      shippingCosts,
      shippingCurrency,
      productCountryOfOrigin,
      shippingSpecial,
      categoryPath : [mainCategory, subCategory, subSubCategory].filter(Boolean),
      sellInCountries,
      specialProductData
    }));
  }, [sellInCountries,specialProductData, shippingSpecial, mainCategory, subCategory, subSubCategory,productCountryOfOrigin,  subSubSubCategory, currency, deliveryTime,searchKeywords, setProduct, shippingCosts, shippingCurrency]);
  

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
//special produkt
  useEffect(() => {
  if (showExtra && specialProductData === false) {
    setSpecialProductData({ info: {se: ""}, salesOption: 'direct' });
  }
  if (!showExtra) {
    setSpecialProductData(false); // Nollställ om checkboxen avmarkeras
  }
}, [showExtra]);
  




  // Handle checkbox changes for countries
 const handleCountryCheckboxChange = (e) => {
  const country = e.target.value;
  const checked = e.target.checked;

  setSellInCountries((prev) => {
    const newData = { ...prev };

    if (checked) {
      // Lägg till landet med defaultvärden om det inte finns
      if (!newData[country]) {
        newData[country] = { shippingCost: '', deliveryTime: '' };
      }
    } else {
      // Ta bort landet
      delete newData[country];
    }

    return newData;
  });
};


 const handleShippingCostChange = (e, country) => {
  const value = e.target.value;
  setSellInCountries((prev) => ({
    ...prev,
    [country]: {
      ...prev[country],
      shippingCost: parseInt(value),
      currency: shippingCurrency
    },
  }));
};
const handleDeliveryTimeChange = (e, country) => {
  const value = e.target.value;
  setSellInCountries((prev) => ({
    ...prev,
    [country]: {
      ...prev[country],
      deliveryTime: parseInt(value),
    },
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

/* 
  const handleDeliveryTimeChange = (e) => {
    const value = Math.max(0, Number(e.target.value)); // Ensure it's a non-negative number
    setDeliveryTime(value);
  }; */
  

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

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <label>Artiekelnummer från leverantör:</label>
              <input
                type="text"
                name="supplierArticleNumber"
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
<div className="space-y-4">
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={showExtra}
      onChange={() => setShowExtra(!showExtra)}
    />
    <span>Är detta en specialprodukt?</span>
  </label>

 {showExtra && specialProductData && (
  <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
    <div>
      <label className="block mb-1 text-sm font-medium">Info</label>
      <textarea
        value={specialProductData.info.se}
        onChange={(e) =>
          setSpecialProductData({ ...specialProductData, info: {se: e.target.value}  })
        }
        placeholder="Ange extra information"
        className="w-full border px-3 py-2 rounded-md"
      />
    </div>

    <div>
      <label className="block mb-1 text-sm font-medium">Försäljningsalternativ</label>
      <select
        value={specialProductData.salesOption}
        onChange={(e) =>
          setSpecialProductData({ ...specialProductData, salesOption: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md"
      >
        <option value="direct">Sälj direkt</option>
        <option value="offer">Bara offert</option>
      </select>
    </div>
  </div>
)}

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
<div style={{ marginBottom: '10px' }}>
  <label>
    <input
      type="checkbox"
      checked={specialShippingEnabled}
      onChange={(e) => {
    setSpecialShippingEnabled(e.target.checked);
    setShippingSpecial(prev => ({ ...prev, enabled: e.target.checked }));
  }}
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
  value={productCountryOfOrigin}
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
    {countryOptions.map((country) => {
  const isSelected = sellInCountries.hasOwnProperty(country);
  return (
    <div key={country}>
      <label>
        <input
          type="checkbox"
          value={country}
          checked={isSelected}
          onChange={handleCountryCheckboxChange}
        />
        {country}
      </label>
      {isSelected && (
        <div style={{ marginLeft: '20px' }}>
          <input
            type="number"
            placeholder={`Fraktpris för ${country}`}
            value={sellInCountries[country].shippingCost}
            onChange={(e) => handleShippingCostChange(e, country)}
          />
          <input
            type="number"
            placeholder={`Leveranstid (dagar) för ${country}`}
            value={sellInCountries[country].deliveryTime}
            onChange={(e) => handleDeliveryTimeChange(e, country)}
          />
        </div>
      )}
    </div>
  );
})}

  </div>
 {/*  {selectedCountries.length > 0 && (
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
)} */}
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
