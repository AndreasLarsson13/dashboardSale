// src/components/form/GeneralInfo.jsx (Anpassa sökvägen till din fil!)

import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import categoriesData from '../../data/categoriesData';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

// Importera dina formulärelement-komponenter. DUBBELKOLLA SÖKVÄGARNA!
import SpecialShippingSelector from '../form/SpecialShippingSelector';
import KeywordInput from './components/keyWordInput';
import PackagingInfo from './components/packagingInfo';
import LabeledInput from './components/FormElements/LabeledInput';
import LabeledSelect from './components/FormElements/LabeledSelect';
import ShippingAndSalesCountries from './components/shippingAndSalesCountries'; // Anpassa sökväg
import CategorySelector from './components/categorySelector'; // Anpassa sökväg


// --- Globala konstanter (kan flyttas till egen fil om de används på fler ställen) ---
const currencyOptions = ['EUR', 'SEK'];
const productOriginOptions = ['SV', 'AX', 'FI'];
const countryLabels = {
  SV: 'Sverige',
  FI: 'Finland',
  AX: 'Åland',
};
const sellableCountryOptions = ['SV', 'FI', 'AX'];

// --- GeneralInfo Komponent ---
const GeneralInfo = ({ product, setProduct }) => {
  // --- Lokal UI-state (initialiseras från 'product' prop vid första rendering) ---
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);

  // Initialisera kategorier från produktens 'category' fält
  const [mainCategory, setMainCategory] = useState(product.category[0]?.name || '');
  const [subCategory, setSubCategory] = useState(product.category[0]?.child?.[0]?.name || '');
  const [subSubCategory, setSubSubCategory] = useState(product.category[0]?.child?.[0]?.child?.[0]?.name || '');
  const [subSubSubCategory, setSubSubSubCategory] = useState(product.category[0]?.child?.[0]?.child?.[0]?.child?.[0]?.name || '');

  // Övrig state initialiserad från 'product' prop
  const [brands, setBrands] = useState([]); // Brands hämtas från API
  const [currency, setCurrency] = useState(product.price?.currency || 'SEK');
  const [shippingCurrency, setShippingCurrency] = useState(product.shippingCurrency || 'SEK');
  const [specialShippingEnabled, setSpecialShippingEnabled] = useState(product.shippingSpecial?.enabled || false);
  
  // *** FÖRÄNDRING HÄR: Robust initialisering av sellInCountries ***
  const [sellInCountries, setSellInCountries] = useState(() => {
    // Om product.sellInCountries är ett objekt (som det förväntas sparas som)
    if (product.sellInCountries && typeof product.sellInCountries === 'object' && !Array.isArray(product.sellInCountries)) {
      return product.sellInCountries;
    } 
    // OM product.sellInCountries är en ARRAY av landskoder (äldre format från API?)
    else if (Array.isArray(product.sellInCountries)) {
      // Konvertera arrayen till det förväntade objektformatet
      return product.sellInCountries.reduce((acc, countryCode) => {
        // Initiera med tomma strängar som default för fraktkostnad/leveranstid,
        // och den aktuella shippingCurrency.
        acc[countryCode] = { shippingCost: '', deliveryTime: '', currency: product.shippingCurrency || 'SEK' };
        return acc;
      }, {});
    }
    // Fallback: Om det inte finns, eller är null/undefined/tom array, använd ett tomt objekt
    return {};
  });
  // *** SLUT FÖRÄNDRING HÄR ***

  // Initialisera specialProductData med 'enabled' flaggan
  const [specialProductData, setSpecialProductData] = useState(() => {
    if (product.specialProductData && typeof product.specialProductData === 'object') {
        return { ...product.specialProductData, enabled: product.specialProductData.enabled ?? false };
    }
    return { info: { se: '' }, salesOption: 'direct', enabled: false };
  });

  const [searchKeywords, setSearchKeywords] = useState(product.searchKeywords || []);
  const [showExtra, setShowExtra] = useState(specialProductData.enabled); 

  // Initialisera shippingSpecial från product prop (säkerställer att det alltid är ett objekt med 'enabled')
  const [shippingSpecial, setShippingSpecial] = useState(() => {
    if (product.shippingSpecial && typeof product.shippingSpecial === 'object') {
        return { ...product.shippingSpecial, enabled: product.shippingSpecial.enabled ?? false };
    }
    return { combinedWith: [], units: 1, enabled: false };
  });

  // --- useEffect för att hämta varumärken ---
  useEffect(() => {
    const fetchBrands = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.warn('User not authenticated for fetching brands.');
        return;
      }
      try {
        const response = await axios.get('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/brands', {
          params: { uid: user.uid, uidEmail: user.email },
        });
        setBrands(response.data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  // --- Hjälpfunktion för att bygga kategoristrukturen (Memoized med useCallback) ---
  const buildCategoryStructure = useCallback(() => {
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
  }, [mainCategory, subCategory, subSubCategory, subSubSubCategory]);


  // --- useEffect för att uppdatera den överordnade 'product' prop:en ---
  useEffect(() => {
    const updatedFields = {
      category: buildCategoryStructure(),
      currency,
      searchKeywords,
      shippingCurrency,
      specialProductData,
      shippingSpecial: { ...shippingSpecial, enabled: specialShippingEnabled }, 
      sellInCountries, // sellInCountries är nu ett objekt
      categoryPath: [mainCategory, subCategory, subSubCategory, subSubSubCategory].filter(Boolean),
    };

    setProduct(prev => ({
      ...prev,
      ...updatedFields, 
    }));

  }, [
    setProduct, 
    mainCategory, subCategory, subSubCategory, subSubSubCategory, buildCategoryStructure, 
    currency, shippingCurrency, 
    specialShippingEnabled, shippingSpecial, 
    sellInCountries, specialProductData, searchKeywords,
  ]);


  // --- Generell hanterare för input-fält (text och nummer) ---
  const handleInputChange = useCallback((e) => {
    const { name, value, type } = e.target;

    setProduct((prev) => { 
      if (['price', 'sale_price', 'buying_price'].includes(name)) {
        return {
          ...prev,
          [name]: {
            ...prev[name], 
            value: Math.max(0, Number(value)),
            currency: currency, 
          },
        };
      }
      else if (['weightPack', 'lengthPack', 'widthPack', 'heightPack'].includes(name)) {
        return {
          ...prev,
          packaging: {
            ...prev.packaging, 
            [name]: Math.max(0, parseFloat(value)), 
          },
        };
      }
      else if (type === 'number') {
        return {
          ...prev,
          [name]: Math.max(0, parseFloat(value)),
        };
      }
      else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  }, [setProduct, currency]); 

  // --- Hanterare för specialprodukt-information ---
  const handleSpecialProductDataChange = useCallback((field, value) => {
    setSpecialProductData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSpecialProductInfoChange = useCallback((e) => {
    handleSpecialProductDataChange('info', { se: e.target.value });
  }, [handleSpecialProductDataChange]);

  const handleSpecialProductSalesOptionChange = useCallback((e) => {
    handleSpecialProductDataChange('salesOption', e.target.value);
  }, [handleSpecialProductDataChange]);


  // --- Hanterare för länder som produkten får säljas i (passas till ShippingAndSalesCountries) ---
  const handleSellInCountryCheckboxChange = useCallback((e) => {
    const country = e.target.value;
    const checked = e.target.checked;
    setSellInCountries((prev) => {
      const newData = { ...prev };
      if (checked) {
        if (!newData[country]) {
          // Viktigt: Initiera med defaultvärden, inklusive currency
          newData[country] = { shippingCost: '', deliveryTime: '', currency: shippingCurrency };
        }
      } else {
        delete newData[country];
      }
      return newData;
    });
  }, [shippingCurrency]); // Beroende av shippingCurrency

  const handleSellInCountryShippingCostChange = useCallback((e, country) => {
    const value = e.target.value;
    setSellInCountries((prev) => ({
      ...prev,
      [country]: {
        ...prev[country],
        shippingCost: parseInt(value) || 0, // Spara 0 om NaN
        currency: shippingCurrency, // Se till att rätt valuta sparas
      },
    }));
  }, [shippingCurrency]);

  const handleSellInCountryDeliveryTimeChange = useCallback((e, country) => {
    const value = e.target.value;
    setSellInCountries((prev) => ({
      ...prev,
      [country]: {
        ...prev[country],
        deliveryTime: parseInt(value) || 0, // Spara 0 om NaN
      },
    }));
  }, []);

  const handleShippingCurrencyChange = useCallback((e) => {
    setShippingCurrency(e.target.value);
  }, []);


  // --- Hanterare för kategoriväljare ---
  const handleMainCategoryChange = useCallback((e) => {
    setMainCategory(e.target.value);
    setSubCategory('');
    setSubSubCategory('');
    setSubSubSubCategory('');
  }, []);

  const handleSubCategoryChange = useCallback((e) => {
    setSubCategory(e.target.value);
    setSubSubCategory('');
    setSubSubSubCategory('');
  }, []);

  const handleSubSubCategoryChange = useCallback((e) => {
    setSubSubCategory(e.target.value);
    setSubSubSubCategory('');
  }, []);

  const handleSubSubSubCategoryChange = useCallback((e) => {
    setSubSubSubCategory(e.target.value);
  }, []);

  // --- Hanterare för valutaändring (och nollställning av priser) ---
  const handleCurrencyChange = useCallback((event) => {
    const newCurrency = event.target.value;
    setCurrency(newCurrency);
    setProduct((prev) => ({
      ...prev,
      price: { ...prev.price, value: 0, currency: newCurrency },
      sale_price: { ...prev.sale_price, value: 0, currency: newCurrency },
      buying_price: { ...prev.buying_price, value: 0, currency: newCurrency },
    }));
  }, [setProduct]);


  // --- Hanterare för produktens ursprungsland ---
  const handleProductCountryOfOriginChange = useCallback((e) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      productCountryOfOrigin: e.target.value,
    }));
  }, [setProduct]);

  // --- Hanterare för specialfrakt enheter ---
  const handleUnitsChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    setShippingSpecial((prev) => ({ ...prev, units: isNaN(value) ? 1 : value }));
  }, []);

  // --- Hanterare för SpecialShippingSelector (combinedWith) ---
  const handleSpecialShippingCombinedWithChange = useCallback((newIds) => {
    setShippingSpecial(prev => ({
      ...prev,
      combinedWith: newIds
    }));
  }, []);

  // --- Hanterare för KeywordInput ---
  const handleAddKeyword = useCallback((keywordInput) => {
    if (keywordInput.trim() && !searchKeywords.includes(keywordInput.trim())) {
      setSearchKeywords(prev => [...prev, keywordInput.trim()]);
    }
  }, [searchKeywords]);

  const handleRemoveKeyword = useCallback((keyword) => {
    setSearchKeywords(prev => prev.filter((k) => k !== keyword));
  }, []);


  // --- Validering för formulärstatus ---
  const isFormCompleted =
    mainCategory && 
    currency &&     
    product.name && product.name.trim() !== '' && 
    product.sku && product.sku.trim() !== '' &&   
    product.brand && product.brand.trim() !== '' && 
    product.price?.value !== undefined && Number.isFinite(product.price.value) && product.price.value >= 0 && 
    product.sale_price?.value !== undefined && Number.isFinite(product.sale_price.value) && product.sale_price.value >= 0 && 
    product.buying_price?.value !== undefined && Number.isFinite(product.buying_price.value) && product.buying_price.value >= 0 && 
    product.quantity !== undefined && Number.isFinite(product.quantity) && product.quantity >= 0 && 
    product.packaging?.weightPack !== undefined && Number.isFinite(product.packaging.weightPack) && product.packaging.weightPack >= 0 &&
    product.packaging?.widthPack !== undefined && Number.isFinite(product.packaging.widthPack) && product.packaging.widthPack >= 0 &&
    product.packaging?.heightPack !== undefined && Number.isFinite(product.packaging.heightPack) && product.packaging.heightPack >= 0 &&
    product.packaging?.lengthPack !== undefined && Number.isFinite(product.packaging.lengthPack) && product.packaging.lengthPack >= 0;


  // --- Renderingslogik ---
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
          {/* --- Grundläggande Produktinformation --- */}
          <div
            style={{
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px 20px',
              backgroundColor: '#eaeaea',
            }}
          >
            <LabeledInput label="Namn" name="name" value={product.name || ''} onChange={handleInputChange} required />

            <LabeledSelect
              label="Original valuta på produkt"
              name="currency"
              value={currency} 
              onChange={handleCurrencyChange}
              options={currencyOptions}
              optionLabels={Object.fromEntries(currencyOptions.map((opt) => [opt, opt]))}
              required
            />

            <LabeledInput
              label="Antal produkter i lager"
              name="quantity"
              value={product.quantity ?? ''} 
              onChange={handleInputChange}
              type="number"
              min="0"
              required
            />

            <LabeledSelect
              label="Varumärke"
              name="brand"
              value={product.brand || ''}
              onChange={handleInputChange}
              options={['', ...brands.map((brand) => brand.slug)]} 
              optionLabels={{ '': 'Välj ett varumärke', ...Object.fromEntries(brands.map((brand) => [brand.slug, brand.name])) }}
              required
            />

            <LabeledInput
              label="Pris"
              name="price"
              value={product.price?.value ?? ''} 
              onChange={handleInputChange}
              type="number"
              min="0"
              required
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <label>Är detta ett tillbehör?:</label>
              <input
                type="checkbox"
                name="isProductOption"
                checked={product.isProductOption || false}
                onChange={(e) => setProduct((prev) => ({ ...prev, isProductOption: e.target.checked }))}
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            <LabeledInput label="SKU" name="sku" value={product.sku || ''} onChange={handleInputChange} required />

            <LabeledInput
              label="Försäljningspris"
              name="sale_price"
              value={product.sale_price?.value ?? ''}
              onChange={handleInputChange}
              type="number"
              min="0"
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <label>Vill du dölja produkten? (Från text filtersidan):</label>
              <input
                type="checkbox"
                name="hideProductFromView"
                checked={product.hideProductFromView || false}
                onChange={(e) => setProduct((prev) => ({ ...prev, hideProductFromView: e.target.checked }))}
                style={{ width: '20px', height: '20px' }}
              />
            </div>

            <LabeledInput
              label="Artikelnummer"
              name="supplierArticleNumber"
              value={product.supplierArticleNumber || ''}
              onChange={handleInputChange}
            />

            <LabeledInput
              label="Inköpspris"
              name="buying_price"
              value={product.buying_price?.value ?? ''}
              onChange={handleInputChange}
              type="number"
              min="0"
              required
            />

            {/* --- Specialproduktsektion (utbruten som en logisk grupp) --- */}
            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label>Är detta en specialprodukt?</label>
                <input
                  type="checkbox"
                  checked={showExtra}
                  onChange={() => {
                    setShowExtra(!showExtra);
                    setSpecialProductData(prev => ({
                      ...prev,
                      enabled: !showExtra
                    }));
                  }}
                  style={{ width: '20px', height: '20px' }}
                />
              </div>

              {showExtra && specialProductData.enabled && ( 
                <div style={{ marginTop: '10px', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '500' }}>Info</label>
                    <textarea
                      value={specialProductData.info?.se || ''} 
                      onChange={handleSpecialProductInfoChange}
                      placeholder="Ange extra information"
                      style={{ width: '100%', border: '1px solid #d1d5db', padding: '8px 12px', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '500' }}>
                      Försäljningsalternativ
                    </label>
                    <select
                      value={specialProductData.salesOption || 'direct'} 
                      onChange={handleSpecialProductSalesOptionChange}
                      style={{ width: '100%', border: '1px solid #d1d5db', padding: '8px 12px', borderRadius: '6px', fontSize: '1rem' }}
                    >
                      <option value="direct">Sälj direkt</option>
                      <option value="offer">Bara offert</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- Förpackningsinformation (egen komponent) --- */}
          <PackagingInfo
            packaging={product.packaging} 
            onChange={handleInputChange} 
          />

          {/* --- Specialfrakt Logik --- */}
          <div style={{ marginBottom: '10px', padding: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={specialShippingEnabled}
                onChange={(e) => {
                  setSpecialShippingEnabled(e.target.checked);
                  setShippingSpecial((prev) => ({ ...prev, enabled: e.target.checked }));
                }}
              />{' '}
              Klicka här för speciell frakt logik
            </label>
          </div>

          {specialShippingEnabled && (
            <div style={{ marginTop: '15px', padding: '10px' }}>
              <SpecialShippingSelector
                value={shippingSpecial.combinedWith}
                onChange={handleSpecialShippingCombinedWithChange}
              />
              <label style={{ marginTop: '10px', display: 'block' }}>
                Antal enheter för fraktrabatt:{' '}
                <input
                  type="number"
                  min="1"
                  value={shippingSpecial.units || ''}
                  onChange={handleUnitsChange}
                  style={{ width: '80px' }}
                />
              </label>
            </div>
          )}

          {/* --- Produktens Ursprungsland (med LabeledSelect) --- */}
          <div
            style={{
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px 20px',
            }}
          >
            <LabeledSelect
              label="Vilket land utgår produkten från"
              name="productCountryOfOrigin"
              value={product.productCountryOfOrigin || ''}
              onChange={handleProductCountryOfOriginChange}
              options={productOriginOptions}
              optionLabels={countryLabels}
              required
            />
          </div>

          {/* --- Frakt- och Försäljningsländer (egen komponent) --- */}
          <ShippingAndSalesCountries
            currencyOptions={currencyOptions}
            shippingCurrency={shippingCurrency}
            handleShippingCurrencyChange={handleShippingCurrencyChange}
            countryOptions={sellableCountryOptions}
            sellInCountries={sellInCountries} // <--- Denna state är nu robust initialiserad
            handleCountryCheckboxChange={handleSellInCountryCheckboxChange}
            handleShippingCostChange={handleSellInCountryShippingCostChange}
            handleDeliveryTimeChange={handleSellInCountryDeliveryTimeChange}
          />

          {/* --- Kategoriväljare (egen komponent) --- */}
          <CategorySelector
            mainCategory={mainCategory}
            subCategory={subCategory}
            subSubCategory={subSubCategory}
            subSubSubCategory={subSubSubCategory}
            handleMainCategoryChange={handleMainCategoryChange}
            handleSubCategoryChange={handleSubCategoryChange}
            handleSubSubCategoryChange={handleSubSubCategoryChange}
            handleSubSubSubCategoryChange={handleSubSubSubCategoryChange}
            categoriesData={categoriesData}
          />

          {/* --- Nyckelord (egen komponent) --- */}
          <KeywordInput
            keywords={searchKeywords}
            setKeywords={setSearchKeywords}
          />
        </div>
      )}
    </div>
  );
};

export default GeneralInfo;