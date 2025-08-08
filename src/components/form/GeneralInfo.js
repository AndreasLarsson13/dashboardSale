import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
/* import categoriesData from '../../data/categoriesData'; // Din kapslade categoriesData
 */import { fetchCategoryData } from '../../data/categoryFetch';

import { getAuth } from 'firebase/auth';
import axios from 'axios';

// Importera dina formulärelement-komponenter. DUBBELKOLLA SÖKVÄGARNA!
import SpecialShippingSelector from '../form/SpecialShippingSelector';
import KeywordInput from './components/keyWordInput';
import CompadibleWithProduct from './components/compadableWithProduct';
import PriceCalculatorModal from './PriceCalculatorModal';
import PackagingInfo from './components/packagingInfo';
import LabeledInput from './components/FormElements/LabeledInput';
import LabeledSelect from './components/FormElements/LabeledSelect';
import CategorySelector from './components/categorySelector'; // NY! Den dynamiska CategorySelector
import ShippingAndSalesCountries from './components/shippingAndSalesCountries'; // Den uppdaterade fraktkomponenten

// --- Globala konstanter (kan flyttas till egen fil om de används på fler ställen) ---
const currencyOptions = ['EUR', 'SEK'];
const productOriginOptions = ['SV', 'AX', 'FI'];
const countryLabels = {
  SV: 'Sverige',
  FI: 'Finland',
  AX: 'Åland',
};
const sellableCountryOptions = ['SV', 'FI', 'AX'];

// NY: Leveransalternativ med översättningar
const deliveryTimeOptions = [
  { value: '3-5_days', label: { se: '3-5 arbetsdagar', en: '3-5 working  days', fi: '3-5 arkipäivän kuluessa' } },
  { value: '5-10_days', label: { se: '5-10 arbetsdagar', en: '5-10 working  days', fi: '5-10 arkipäivän kuluessa' } },
  { value: '2-3_weeks', label: { se: '2-3 veckor', en: '2-3 weeks', fi: '2-3 viikkoa' } },
  { value: '+3_weeks', label: { se: '+ 3 veckor', en: '+3 weeks', fi: '+3 viikkoa' } },
];

// --- GeneralInfo Komponent ---
const GeneralInfo = ({ product, setProduct }) => {
 const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`); // Axios automatically parses JSON
        setCategoriesData(res.data); // `res.data` contains the parsed JSON
        console.log(res.data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    fetchData();
  }, []);
  // --- Lokal UI-state (initialiseras från 'product' prop vid första rendering) ---
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState([]);

  // --- Kategori State Hantering ---
  // Initialiseras från 'product' prop för att ladda existerande kategorier
  const [categoryPaths, setCategoryPaths] = useState(() => {
    const normalizePath = (path) => Array.isArray(path) ? path.filter(Boolean) : [];
    let initialPaths = [];

    // Prioritera product.categoryPaths om det redan är i det önskade formatet (array av arrayer)
 /*    if (Array.isArray(product.categoryPaths) && product.categoryPaths.length > 0) {
      initialPaths = product.categoryPaths.map(path => normalizePath(path));
    }
    // Fallback för äldre/annat product.category-format (kapslade objekt)
    else  */if (Array.isArray(product.category) && product.category.length > 0) {
      const convertNestedToFlatPath = (nestedCat) => {
        const path = [];
        let current = nestedCat;
        while (current && current.slug) {
          path.push(current.slug);
          current = current.child && current.child.length > 0 ? current.child[0] : null;
        }
        return path;
      };
      initialPaths = product.category.map(cat => normalizePath(convertNestedToFlatPath(cat)));
    }
    // Fallback för product.categoryPath (singular, en enda array-väg)
 /*    else if (Array.isArray(product.categoryPath) && product.categoryPath.length > 0) {
      initialPaths = [normalizePath(product.categoryPath)];
    } */

    if (initialPaths.length === 0) {
      initialPaths.push([]); // Se till att det alltid finns minst en tom sökväg att börja med
    }
    return initialPaths;
  });

  // Övrig state initialiserad från 'product' prop
  const [brands, setBrands] = useState([]);
  const [currency, setCurrency] = useState(product.price?.currency || 'SEK');
  const [shippingCurrency, setShippingCurrency] = useState(product.shippingCurrency || 'SEK');
  const [specialShippingEnabled, setSpecialShippingEnabled] = useState(product.shippingSpecial?.enabled || false);
 const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const [sellInCountries, setSellInCountries] = useState(() => {
    const getNormalizedDeliveryTimeValue = (deliveryTimeData) => {
      if (typeof deliveryTimeData === 'object' && deliveryTimeData !== null) {
        const foundOption = deliveryTimeOptions.find(opt => opt.label.se === deliveryTimeData.se);
        return foundOption ? foundOption.value : '';
      }
      return deliveryTimeData || '';
    };

    if (product.sellInCountries && typeof product.sellInCountries === 'object' && !Array.isArray(product.sellInCountries)) {
      const normalizedCountries = {};
      for (const countryCode in product.sellInCountries) {
        if (product.sellInCountries.hasOwnProperty(countryCode)) {
          const countryData = product.sellInCountries[countryCode];
          normalizedCountries[countryCode] = {
            ...countryData,
            deliveryTime: getNormalizedDeliveryTimeValue(countryData.deliveryTime)
          };
        }
      }
      return normalizedCountries;
    }
    else if (Array.isArray(product.sellInCountries)) {
      return product.sellInCountries.reduce((acc, countryCode) => {
        acc[countryCode] = { shippingCost: '', deliveryTime: '', currency: product.shippingCurrency || 'SEK' };
        return acc;
      }, {});
    }
    return {};
  });

  const [specialProductData, setSpecialProductData] = useState(() => {
    if (product.specialProductData && typeof product.specialProductData === 'object') {
      return { ...product.specialProductData, enabled: product.specialProductData.enabled ?? false };
    }
    return { info: { se: '' }, salesOption: 'direct', enabled: false };
  });

  const [searchKeywords, setSearchKeywords] = useState(product.searchKeywords || []);
   const [compadibleWithProduct, setcompadibleWithProduct] = useState(product.compadibleWithProduct || []);
  const [showExtra, setShowExtra] = useState(specialProductData.enabled);

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
        const token = await user.getIdToken();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/brands`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { uid: user.uid, uidEmail: user.email },
        });
        setBrands(response.data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  // --- Hjälpfunktion för att bygga den kapslade kategoristrukturen för 'product.category' ---
  const buildNestedCategoryStructure = useCallback((path, allCategoriesData) => {
    if (!path || path.length === 0) return null;

    const createNested = (segments, currentLevelData, isTopLevel = false) => {
      if (segments.length === 0) return null;

      const currentSegmentValue = segments[0];
      let categoryObject = null;

      if (isTopLevel) {
        categoryObject = Object.values(currentLevelData).find(cat => cat.value === currentSegmentValue);
      } else {
        categoryObject = currentLevelData.find(cat => cat.value === currentSegmentValue);
      }

      if (!categoryObject) return null;

      const newObject = {
        name: categoryObject.label,
        slug: categoryObject.value,
      };

      if (segments.length > 1 && categoryObject.child && categoryObject.child.length > 0) {
        const childResult = createNested(segments.slice(1), categoryObject.child);
        if (childResult) {
          newObject.child = [childResult];
        }
      }
      return newObject;
    };

    return createNested(path, allCategoriesData, true);
  }, []);

  // --- useEffect för att uppdatera den överordnade 'product' prop:en ---
  useEffect(() => {

    const stringPaths = categoryPaths.map(pathArray => pathArray.join('/'));

    const cleanedCategoryPaths = categoryPaths
      .map(path => path.filter(Boolean))
      .filter(path => path.length > 0);

    const nestedCategoriesForProduct = cleanedCategoryPaths
      .map(path => buildNestedCategoryStructure(path, categoriesData))
      .filter(Boolean);

    const sellInCountriesForBackend = {};
    for (const countryCode in sellInCountries) {
      if (sellInCountries.hasOwnProperty(countryCode)) {
        const countryData = sellInCountries[countryCode];
        let deliveryTimeOutput = countryData.deliveryTime;

        if (typeof countryData.deliveryTime === 'string' && countryData.deliveryTime !== '') {
          const foundOption = deliveryTimeOptions.find(opt => opt.value === countryData.deliveryTime);
          if (foundOption) {
            deliveryTimeOutput = foundOption.label;
          } else {
            deliveryTimeOutput = countryData.deliveryTime;
          }
        }
        else if (typeof countryData.deliveryTime === 'object' && countryData.deliveryTime !== null) {
          deliveryTimeOutput = countryData.deliveryTime;
        }

        sellInCountriesForBackend[countryCode] = {
          ...countryData,
          deliveryTime: deliveryTimeOutput
        };
      }
    }

    const updatedFields = {
      category: nestedCategoriesForProduct,
      categoryPaths: stringPaths, // <--- Här skickas de valda sökvägarna (array av arrayer av slugs)
      currency,
      searchKeywords,
      compadibleWithProduct,
      shippingCurrency,
      specialProductData,
      shippingSpecial: { ...shippingSpecial, enabled: specialShippingEnabled },
      sellInCountries: sellInCountriesForBackend,
    };

    setProduct(prev => ({
      ...prev,
      ...updatedFields,
    }));

  }, [
    setProduct,
    categoryPaths, // Denna beroende-lista är nu korrekt
    buildNestedCategoryStructure,
    categoriesData,
    currency, shippingCurrency,
    specialShippingEnabled, shippingSpecial,
    sellInCountries,
    specialProductData, searchKeywords, compadibleWithProduct
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


  // --- Hanterare för länder som produkten får säljas i ---
  const handleSellInCountryCheckboxChange = useCallback((e) => {
    const country = e.target.value;
    const checked = e.target.checked;
    setSellInCountries((prev) => {
      const newData = { ...prev };
      if (checked) {
        if (!newData[country]) {
          newData[country] = { shippingCost: '', deliveryTime: '', currency: shippingCurrency };
        }
      } else {
        delete newData[country];
      }
      return newData;
    });
  }, [shippingCurrency]);

  const handleSellInCountryShippingCostChange = useCallback((e, country) => {
    const value = e.target.value;
    setSellInCountries((prev) => ({
      ...prev,
      [country]: {
        ...prev[country],
        shippingCost: parseInt(value) || 0,
        currency: shippingCurrency,
      },
    }));
  }, [shippingCurrency]);

  const handleSellInCountryDeliveryTimeChange = useCallback((e, country) => {
    const selectedValue = e.target.value;
    setSellInCountries((prev) => ({
      ...prev,
      [country]: {
        ...prev[country],
        deliveryTime: selectedValue,
      },
    }));
  }, []);

  const handleShippingCurrencyChange = useCallback((e) => {
    setShippingCurrency(e.target.value);
  }, []);


  // --- HANTERING AV KATEGORIVÄGAR (FÖR FLERA TRÄD) ---
  /* const handleCategoryPathChange = useCallback((pathIndex, level, value) => {
    setCategoryPaths(prevPaths => {
      const newPaths = [...prevPaths];
      const currentPath = [...newPaths[pathIndex]]; // Kopiera den specifika sökvägen

      currentPath[level] = value; // Uppdatera värdet på den aktuella nivån
      // Tronka sökvägen från nästa nivå och framåt för att rensa underliggande val
      const updatedPath = currentPath.slice(0, level + 1);

      newPaths[pathIndex] = updatedPath; // Uppdatera den specifika sökvägen i arrayen
      return newPaths;
    });
  }, []); */

  const addCategoryPath = useCallback((e) => {
    e.preventDefault()
    setCategoryPaths(prevPaths => [...prevPaths, []]);
  }, []);

 /*  const removeCategoryPath = useCallback((indexToRemove) => {
    setCategoryPaths(prevPaths => {
      const filteredPaths = prevPaths.filter((_, index) => index !== indexToRemove);
      if (filteredPaths.length === 0) {
        return [[]]; // Se till att minst en tom sökväg återstår om alla tas bort
      }
      return filteredPaths;
    });
  }, []); */


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
    (categoryPaths.length > 0 && categoryPaths.some(path => path.length > 0 && path[0] !== '')) && // Kontrollera att minst en väg är vald
    currency &&
    product.name && product.name.trim() !== '' &&
   /*  product.sku && product.sku.trim() !== '' &&  */ // not marked as required 31/7 
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
              label="Kundpris (ex moms)"
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

<LabeledInput label="SKU" name="sku" value={product.sku || ''} onChange={handleInputChange} /> {/* Removed required 31/7 */}
            <LabeledInput
              label="Rabbaterat pris (ex moms)"
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

{/* Lägg till kalkylatorknappen här, kanske i en div tillsammans med inputen */}
<div style={{ gridColumn: '1 / 4', display: 'flex', justifyContent: 'center', marginTop: '10px' }}> {/* Spänner över alla 3 kolumner */}
    <button
        onClick={(e) =>   {e.preventDefault();
 setIsPriceModalOpen(true)}}
        style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            maxWidth: '300px', // Begränsa bredden
            width: '100%',
            margin: '0 auto', // Centrera knappen
        }}
    >
        Öppna priskalkylator
    </button>
</div>

            <LabeledInput
              label="Inköpspris (ex moms)"
              name="buying_price"
              value={product.buying_price?.value ?? ''}
              onChange={handleInputChange}
              type="number"
              min="0"
              required
            />

            {/* --- Specialproduktsektion --- */}
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
 <CompadibleWithProduct
            compadibleWith={compadibleWithProduct}
            setcompadibleWith={setcompadibleWithProduct}
          /> 
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
            sellInCountries={sellInCountries}
            handleCountryCheckboxChange={handleSellInCountryCheckboxChange}
            handleShippingCostChange={handleSellInCountryShippingCostChange}
            handleDeliveryTimeChange={handleSellInCountryDeliveryTimeChange}
            deliveryTimeOptions={deliveryTimeOptions}
          />

          {/* --- KATEGORIHANTERING MED FLERA TRÄD --- */}
           <div style={{ padding: '10px' }}>
            <h2>Produktkategorier</h2>
            {/* Itererar över categoryPaths för att rendera en CategorySelector för varje sökväg */}
     {categoryPaths.map((path, index) => (
  <div key={index} style={{ border: "1px dashed #ccc", padding: "10px", marginBottom: "15px", borderRadius: "5px" }}>
    <CategorySelector
      selectedPath={path} // <-- HÄR: Skicka 'path' direkt, den är redan en array av strängar
      onChange={(newPathArray) => { // <-- HÄR: Förvänta dig att 'newPathArray' är en array av strängar
        setCategoryPaths(prev => {
          const copy = [...prev];
          copy[index] = newPathArray; // <-- HÄR: Spara den nya arrayen direkt
          return copy;
        });
      }}
    />
    {/* Ta bort-knapp */}
    {categoryPaths.length > 0 && <button
      onClick={(e) => {
        e.preventDefault();
        setCategoryPaths(prev => prev.filter((_, i) => i !== index));
      }}
      style={{ marginTop: "10px", backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
    >
      Ta bort
    </button>}
  </div>
))}


            {/* Knapp för att lägga till en ny tom kategoriväg */}
            <button
              onClick={addCategoryPath}
              style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Lägg till ytterligare kategoriväg
            </button>
          </div>

          {/* --- Nyckelord (egen komponent) --- */}
          <KeywordInput
            keywords={searchKeywords}
            setKeywords={setSearchKeywords}
          />



          {/* Priskalkylator Modal */}
<PriceCalculatorModal
    isOpen={isPriceModalOpen}
    onClose={() => setIsPriceModalOpen(false)}
    product={product}
    setProduct={setProduct}
    currentCurrency={currency} // Skicka med den valda valutan
/>
        </div>

        
      )}
    </div>
  );
};

export default GeneralInfo;