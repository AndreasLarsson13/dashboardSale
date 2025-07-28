import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import categoriesData from '../../data/categoriesData'; // Din kapslade categoriesData
import { getAuth } from 'firebase/auth';
import axios from 'axios';

// Importera dina formulärelement-komponenter. DUBBELKOLLA SÖKVÄGARNA!
import SpecialShippingSelector from '../form/SpecialShippingSelector';
import KeywordInput from './components/keyWordInput';
import CompadibleWithProduct from './components/compadableWithProduct';

import PackagingInfo from './components/packagingInfo';
import LabeledInput from './components/FormElements/LabeledInput'; // Assumed updated LabeledInput
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

const deliveryTimeOptions = [
  { value: '3-5_days', label: { se: '3-5 dagar', en: '3-5 days', fi: '3-5 päivää' } },
  { value: '5-10_days', label: { se: '5-10 dagar', en: '5-10 days', fi: '5-10 viikkoa' } },
  { value: '2-3_weeks', label: { se: '2-3 veckor', en: '2-3 weeks', fi: '2-3 viikkoa' } },
  { value: '+3_weeks', label: { se: '+ 3 veckor', en: '+3 weeks', fi: '+3 viikkoa' } },
];

// --- Hjälpfunktioner för prisberäkning ---
const calculatePriceWithMargin = (basePrice, marginPercentage) => {
  const bp = parseFloat(basePrice);
  const mp = parseFloat(marginPercentage);

  if (isNaN(bp) || bp < 0 || isNaN(mp) || mp < 0) {
    return 0;
  }
  return bp * (1 + mp / 100);
};

const calculateMarginPercentage = (sellingPrice, buyingPrice) => {
  const sp = parseFloat(sellingPrice);
  const bp = parseFloat(buyingPrice);

  if (isNaN(sp) || isNaN(bp) || bp <= 0) {
    return 0;
  }
  return ((sp - bp) / bp) * 100;
};

const calculateBuyingPriceFromSellingPriceAndMargin = (sellingPrice, marginPercentage) => {
  const sp = parseFloat(sellingPrice);
  const mp = parseFloat(marginPercentage);

  if (isNaN(sp) || sp < 0 || isNaN(mp) || mp < -100) {
      return 0;
  }
  const divisor = (1 + mp / 100);
  if (divisor === 0) {
      return 0;
  }
  return sp / divisor;
};


// --- GeneralInfo Komponent ---
const GeneralInfo = ({ product, setProduct }) => {
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState([]);

  const [categoryPaths, setCategoryPaths] = useState(() => {
    const normalizePath = (path) => Array.isArray(path) ? path.filter(Boolean) : [];
    let initialPaths = [];

    if (Array.isArray(product.category) && product.category.length > 0) {
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

    if (initialPaths.length === 0) {
      initialPaths.push([]);
    }
    return initialPaths;
  });

  const [brands, setBrands] = useState([]);
  const [currency, setCurrency] = useState(product.price?.currency || 'SEK');
  const [shippingCurrency, setShippingCurrency] = useState(product.shippingCurrency || 'SEK');
  const [specialShippingEnabled, setSpecialShippingEnabled] = useState(product.shippingSpecial?.enabled || false);

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

  const [margin1, setMargin1] = useState(product.margin1 ?? 20);
  const [margin2, setMargin2] = useState(product.margin2 ?? 10);

  // New state to control which calculation flow is active
  const [calculationBase, setCalculationBase] = useState('buying_price'); // 'buying_price' or 'customer_price'

  // Temporary input for direct customer/sale price calculations when calculationBase is 'customer_price'
  const [tempCustomerPriceInput, setTempCustomerPriceInput] = useState('');
  const [tempSalePriceInput, setTempSalePriceInput] = useState('');
  const [desiredMarginForBuyingPriceCalculation, setDesiredMarginForBuyingPriceCalculation] = useState(20);


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
          // Assuming deliveryTime.se might be a property of deliveryTimeData object if present
          // Otherwise, directly use countryData.deliveryTime as a string value for comparison
          const foundOption = deliveryTimeOptions.find(opt => opt.label.se === countryData.deliveryTime); 
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

    // Always keep product.buying_price in sync with actual state,
    // as it's the base for all calculations.
    const currentBuyingPrice = product.buying_price?.value ?? 0;
    const calculatedPrice = calculatePriceWithMargin(currentBuyingPrice, margin1);
    const calculatedSalePrice = calculatePriceWithMargin(currentBuyingPrice, margin2);

    setProduct(prev => ({
      ...prev,
      category: nestedCategoriesForProduct,
      categoryPaths: stringPaths,
      currency,
      searchKeywords,
      compadibleWithProduct,
      shippingCurrency,
      specialProductData,
      shippingSpecial: { ...shippingSpecial, enabled: specialShippingEnabled },
      sellInCountries: sellInCountriesForBackend,
      price: { ...prev.price, value: calculatedPrice, currency: currency },
      sale_price: { ...prev.sale_price, value: calculatedSalePrice, currency: currency },
      margin1,
      margin2,
    }));

  }, [
    setProduct,
    categoryPaths,
    buildNestedCategoryStructure,
    categoriesData,
    currency, shippingCurrency,
    specialShippingEnabled, shippingSpecial,
    sellInCountries,
    specialProductData, searchKeywords, compadibleWithProduct,
    product.buying_price?.value, margin1, margin2,
    product.price, product.sale_price
  ]);


  // --- Generell hanterare för input-fält (text och nummer) ---
  const handleInputChange = useCallback((e) => {
    const { name, value, type } = e.target;

    setProduct((prev) => {
      // Handle margin inputs directly, ONLY if calculationBase is 'buying_price'
      if (calculationBase === 'buying_price') {
          if (name === 'margin1') {
            const newMargin = parseFloat(value) || 0;
            setMargin1(newMargin);
            const buyingPriceValue = prev.buying_price?.value ?? 0;
            const calculatedPrice = calculatePriceWithMargin(buyingPriceValue, newMargin);
            return {
              ...prev,
              price: { ...prev.price, value: calculatedPrice, currency: currency },
              margin1: newMargin,
            };
          }
          if (name === 'margin2') {
            const newMargin = parseFloat(value) || 0;
            setMargin2(newMargin);
            const buyingPriceValue = prev.buying_price?.value ?? 0;
            const calculatedSalePrice = calculatePriceWithMargin(buyingPriceValue, newMargin);
            return {
              ...prev,
              sale_price: { ...prev.sale_price, value: calculatedSalePrice, currency: currency },
              margin2: newMargin,
            };
          }
      }

      // Handle buying_price input, always active
      if (name === 'buying_price') {
        const newBuyingPrice = parseFloat(value) || 0;
        const calculatedPrice = calculatePriceWithMargin(newBuyingPrice, margin1);
        const calculatedSalePrice = calculatePriceWithMargin(newBuyingPrice, margin2);
        return {
          ...prev,
          buying_price: {
            ...prev.buying_price,
            value: newBuyingPrice,
            currency: currency,
          },
          price: { ...prev.price, value: calculatedPrice, currency: currency },
          sale_price: { ...prev.sale_price, value: calculatedSalePrice, currency: currency },
        };
      }
      // Handle packaging dimensions
      else if (['weightPack', 'lengthPack', 'widthPack', 'heightPack'].includes(name)) {
        const parsedValue = parseFloat(value) || 0;
        return {
          ...prev,
          packaging: {
            ...prev.packaging,
            [name]: Math.max(0, parsedValue),
          },
        };
      }
      // Handle quantity (ensure integer)
      else if (name === 'quantity') {
        const parsedValue = parseInt(value) || 0;
        return {
          ...prev,
          [name]: Math.max(0, parsedValue),
        };
      }
      // Handle other generic number inputs (VAT etc., if any exist with this handler)
      else if (type === 'number') {
        const parsedValue = parseFloat(value) || 0;
        return {
          ...prev,
          [name]: Math.max(0, parsedValue),
        };
      }
      // Handle text inputs
      else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  }, [setProduct, currency, margin1, margin2, calculationBase]); // Added calculationBase dependency

  // Handle temporary input for customer price
  const handleTempCustomerPriceInputChange = useCallback((e) => {
    setTempCustomerPriceInput(e.target.value);
  }, []);

  // Handle temporary input for sale price
  const handleTempSalePriceInputChange = useCallback((e) => {
    setTempSalePriceInput(e.target.value);
  }, []);

  // Handle desired margin for buying price calculation
  const handleDesiredMarginForBuyingPriceCalculationChange = useCallback((e) => {
    setDesiredMarginForBuyingPriceCalculation(parseFloat(e.target.value) || 0);
  }, []);

  // Calculate Margin 1 from direct customer price input
  const calculateMarginFromCustomerPrice = useCallback(() => {
    const customerPrice = parseFloat(String(tempCustomerPriceInput).replace(/,/g, '.'));
    const buyingPrice = product.buying_price?.value ?? 0;

    if (isNaN(customerPrice) || customerPrice <= 0 || isNaN(buyingPrice) || buyingPrice <= 0) {
      alert("Ange ett giltigt inköpspris och kundpris för att beräkna marginalen.");
      return;
    }

    const calculatedMargin = calculateMarginPercentage(customerPrice, buyingPrice);
    setMargin1(calculatedMargin);
    
    // Update the main product.price with the manually entered value
    setProduct(prev => ({
      ...prev,
      price: { ...prev.price, value: customerPrice, currency: currency },
      margin1: calculatedMargin, // Save margin to product state immediately
    }));
    setTempCustomerPriceInput(''); // Clear temporary input
  }, [tempCustomerPriceInput, product.buying_price, currency, setProduct]);

  // Calculate Margin 2 from direct sale price input
  const calculateMarginFromSalePrice = useCallback(() => {
    const salePrice = parseFloat(String(tempSalePriceInput).replace(/,/g, '.'));
    const buyingPrice = product.buying_price?.value ?? 0;

    if (isNaN(salePrice) || salePrice <= 0 || isNaN(buyingPrice) || buyingPrice <= 0) {
      alert("Ange ett giltigt inköpspris och rabatterat pris för att beräkna marginalen.");
      return;
    }

    const calculatedMargin = calculateMarginPercentage(salePrice, buyingPrice);
    setMargin2(calculatedMargin);

    // Update the main product.sale_price with the manually entered value
    setProduct(prev => ({
      ...prev,
      sale_price: { ...prev.sale_price, value: salePrice, currency: currency },
      margin2: calculatedMargin, // Save margin to product state immediately
    }));
    setTempSalePriceInput(''); // Clear temporary input
  }, [tempSalePriceInput, product.buying_price, currency, setProduct]);

  // Calculate buying price from customer price and desired margin
  const calculateBuyingPriceFromCustomerPriceAndDesiredMargin = useCallback(() => {
      const customerPrice = parseFloat(String(tempCustomerPriceInput).replace(/,/g, '.'));
      const desiredMargin = desiredMarginForBuyingPriceCalculation;

      if (isNaN(customerPrice) || customerPrice <= 0 || isNaN(desiredMargin)) {
          alert("Ange ett giltigt kundpris och önskad marginal för att beräkna inköpspriset.");
          return;
      }
      if (desiredMargin <= -100) {
          alert("Marginalen kan inte vara -100% eller lägre vid denna beräkning. Justera marginalen.");
          return;
      }

      const calculatedBuyingPrice = calculateBuyingPriceFromSellingPriceAndMargin(customerPrice, desiredMargin);

      setProduct(prev => ({
          ...prev,
          buying_price: { ...prev.buying_price, value: calculatedBuyingPrice, currency: currency },
      }));

      // Update margin1 to reflect the desired margin used for this calculation
      setMargin1(desiredMargin);

      setTempCustomerPriceInput(''); // Clear input after calculation
      // setDesiredMarginForBuyingPriceCalculation(20); // Optionally reset
  }, [tempCustomerPriceInput, desiredMarginForBuyingPriceCalculation, currency, setProduct, setMargin1]);


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
    const value = parseFloat(e.target.value.replace(/,/g, '.')) || 0;
    setSellInCountries((prev) => ({
      ...prev,
      [country]: {
        ...prev[country],
        shippingCost: Math.max(0, value),
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
  const addCategoryPath = useCallback((e) => {
    e.preventDefault();
    setCategoryPaths(prevPaths => [...prevPaths, []]);
  }, []);


  // --- Hanterare för valutaändring (och nollställning av priser) ---
  const handleCurrencyChange = useCallback((event) => {
    const newCurrency = event.target.value;
    setCurrency(newCurrency);
    setProduct((prev) => ({
      ...prev,
      price: { ...prev.price, currency: newCurrency },
      sale_price: { ...prev.sale_price, currency: newCurrency },
      buying_price: { ...prev.buying_price, currency: newCurrency },
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
    (categoryPaths.length > 0 && categoryPaths.some(path => path.length > 0 && path[0] !== '')) &&
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
              type="number" // Quantity should remain as integer input
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

            {/* --- Här väljer användaren beräkningsbas --- */}
            <div style={{ gridColumn: '1 / span 3', marginBottom: '15px' }}>
                <LabeledSelect
                    label="Välj beräkningsbas för priser"
                    name="calculationBase"
                    value={calculationBase}
                    onChange={(e) => setCalculationBase(e.target.value)}
                    options={['buying_price', 'customer_price']}
                    optionLabels={{
                        'buying_price': 'Utgå från Inköpspris',
                        'customer_price': 'Utgå från Kundpris'
                    }}
                />
            </div>

            {/* --- Prissättning baserad på Inköpspris --- */}
            {calculationBase === 'buying_price' && (
                <>
                    <LabeledInput
                      label="Inköpspris (ex moms)"
                      name="buying_price"
                      value={product.buying_price?.value ?? ''}
                      onChange={handleInputChange}
                      type="number"
                      min="0"
                      required
                    />
                    <div style={{ gridColumn: '2 / span 2' }}></div> {/* Spacer */}

                    <LabeledInput label="SKU" name="sku" value={product.sku || ''} onChange={handleInputChange} required />

                    <LabeledInput
                      label="Marginal 1 (%) (för kundpris)"
                      name="margin1"
                      value={margin1 ?? ''}
                      onChange={handleInputChange}
                      type="number"
                      min="0"
                    />

                    <LabeledInput
                      label={`Kundpris (ex moms, beräknat, ${currency})`}
                      name="price"
                      value={product.price?.value?.toFixed(2) ?? ''}
                      readOnly
                      inputStyle={{ backgroundColor: '#f0f0f0' }}
                    />

                    <div style={{ gridColumn: '1 / span 1' }}></div> {/* Spacer */}

                    <LabeledInput
                      label="Marginal 2 (%) (för rabatterat pris)"
                      name="margin2"
                      value={margin2 ?? ''}
                      onChange={handleInputChange}
                      type="number"
                      min="0"
                    />

                    <LabeledInput
                      label={`Rabatterat pris (ex moms, beräknat, ${currency})`}
                      name="sale_price"
                      value={product.sale_price?.value?.toFixed(2) ?? ''}
                      readOnly
                      inputStyle={{ backgroundColor: '#f0f0f0' }}
                    />
                </>
            )}

            {/* --- Prissättning baserad på Kundpris --- */}
            {calculationBase === 'customer_price' && (
                <>
                    <LabeledInput
                      label="Inköpspris (ex moms)"
                      name="buying_price"
                      value={product.buying_price?.value?.toFixed(2) ?? ''}
                      readOnly
                      inputStyle={{ backgroundColor: '#f0f0f0' }}
                    />
                    <div style={{ gridColumn: '2 / span 2' }}></div> {/* Spacer */}

                    <LabeledInput label="SKU" name="sku" value={product.sku || ''} onChange={handleInputChange} required />

                    {/* Direkt Kundpris Input (för att beräkna inköpspris eller marginal) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <LabeledInput
                              label="Ange Kundpris"
                              name="tempCustomerPriceInput"
                              value={tempCustomerPriceInput}
                              onChange={handleTempCustomerPriceInputChange}
                              type="number"
                              min="0"
                              inputStyle={{ width: '150px' }}
                            />
                            <button
                              type="button"
                              onClick={calculateMarginFromCustomerPrice}
                              title="Beräkna Marginal 1 från angivet kundpris och det befintliga inköpspriset"
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Beräkna M1
                            </button>
                        </div>
                        {/* Beräkna Inköpspris från Kundpris och önskad marginal */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <LabeledInput
                                label="Rabbat från kunpris (%)"
                                name="desiredMarginForBuyingPriceCalculation"
                                value={desiredMarginForBuyingPriceCalculation ?? ''}
                                onChange={handleDesiredMarginForBuyingPriceCalculationChange}
                                type="number"
                                min="-99.99"
                                inputStyle={{ width: '100px' }}
                            />
                            <button
                                type="button"
                                onClick={calculateBuyingPriceFromCustomerPriceAndDesiredMargin}
                                title="Beräkna inköpspris från angivet kundpris och önskad marginal"
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Beräkna Inköpspris
                            </button>
                        </div>
                    </div>

                    <LabeledInput
                      label={`Kundpris (ex moms, visas, ${currency})`}
                      name="price"
                      value={product.price?.value?.toFixed(2) ?? ''}
                      readOnly
                      inputStyle={{ backgroundColor: '#f0f0f0' }}
                    />

                    {/* Marginal 1 (visas alltid) */}
                    <LabeledInput
                      label="Marginal 1 (%) (visas)"
                      name="margin1"
                      value={margin1?.toFixed(2) ?? ''}
                      readOnly
                      inputStyle={{ backgroundColor: '#f0f0f0' }}
                    />
                     <div style={{ gridColumn: '1 / span 1' }}></div> {/* Spacer */}


                    {/* Direkt Rabatterat pris Input (för att beräkna marginal) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <LabeledInput
                              label="Ange Rabatterat pris"
                              name="tempSalePriceInput"
                              value={tempSalePriceInput}
                              onChange={handleTempSalePriceInputChange}
                              type="number"
                              min="0"
                              inputStyle={{ width: '150px' }}
                            />
                            <button
                              type="button"
                              onClick={calculateMarginFromSalePrice}
                              title="Beräkna Marginal 2 från angivet rabatterat pris och det befintliga inköpspriset"
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Beräkna M2
                            </button>
                        </div>
                    </div>

                    <LabeledInput
                      label={`Rabatterat pris (ex moms, visas, ${currency})`}
                      name="sale_price"
                      value={product.sale_price?.value?.toFixed(2) ?? ''}
                      readOnly
                      inputStyle={{ backgroundColor: '#f0f0f0' }}
                    />

                    {/* Marginal 2 (visas alltid) */}
                    <LabeledInput
                      label="Marginal 2 (%) (visas)"
                      name="margin2"
                      value={margin2?.toFixed(2) ?? ''}
                      readOnly
                      inputStyle={{ backgroundColor: '#f0f0f0' }}
                    />
                </>
            )}

            {/* Fält som alltid ska visas oavsett beräkningsbas */}
            <div style={{ gridColumn: '1 / span 3', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
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
            </div>

            {/* --- Specialproduktsektion --- */}
            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gridColumn: '1 / span 3' }}>
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
          </div> {/* End grid container for basic info */}

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
            {categoryPaths.map((path, index) => (
              <div key={index} style={{ border: "1px dashed #ccc", padding: "10px", marginBottom: "15px", borderRadius: "5px" }}>
                <CategorySelector
                  selectedPath={path}
                  onChange={(newPathArray) => {
                    setCategoryPaths(prev => {
                      const copy = [...prev];
                      copy[index] = newPathArray;
                      return copy;
                    });
                  }}
                />
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
        </div>
      )}
    </div>
  );
};

export default GeneralInfo;