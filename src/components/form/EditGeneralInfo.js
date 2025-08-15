import React, { useState, useEffect, useCallback } from 'react'; // Lade till useCallback
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import categoriesData from '../../data/categoriesData'; // Adjust path as needed
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import SpecialShippingSelector from '../form/SpecialShippingSelector'; // Förutsätter att denna hanterar sin egen state eller får props
import KeywordInput from './components/keyWordInput'; // Förutsätter att denna hanterar sin egen state eller får props
import PackagingInfo from './components/packagingInfo'; // Förutsätter att denna hanterar sin egen state eller får props
import LabeledInput from './components/FormElements/LabeledInput';
import LabeledSelect from './components/FormElements/LabeledSelect';
import ShippingAndSalesCountries from './components/FormElements/ShippingAndSalesCountries'; // Anpassa sökvägen
import CategorySelector from './components/FormElements/CategorySelector'; // Anpassa sökvägen

// --- Globala konstanter (kan flyttas till egen fil om de används på fler ställen) ---
const currencyOptions = ['EUR', 'SEK'];

// Dessa landskoder och etiketter används i LabeledSelect för produktens ursprung
const productOriginOptions = ['SV', 'AX', 'FI'];
const countryLabels = {
  SV: 'Sverige',
  FI: 'Finland',
  AX: 'Åland',
};

// Dessa landskoder används i ShippingAndSalesCountries för vilka länder produkten får säljas
const sellableCountryOptions = ['SV', 'FI', 'AX'];

// --- GeneralInfo Komponent ---
const GeneralInfo = ({ product, setProduct }) => {
  // --- Lokal state för formulärdata ---
  // Initialiserar lokal state baserat på inkommande 'product' prop
  const [localProduct, setLocalProduct] = useState(() => {
    // Definiera en grundläggande struktur för att undvika undefined errors
    const baseProduct = {
      name: '',
      sku: '',
      supplierArticleNumber: '',
      commoditycode: '',
      brand: '',
      isProductOption: false,
      hideProductFromView: false,
      quantity: 0,
      price: { value: 0, currency: 'SEK', dateChanged: '' },
      sale_price: { value: 0, currency: 'SEK', dateChanged: '' },
      buying_price: { value: 0, currency: 'SEK', dateChanged: '' },
      packaging: { weightPack: 0, lengthPack: 0, widthPack: 0, heightPack: 0 },
      productCountryOfOrigin: 'AX',
      category: [],
      sellInCountries: {},
      shippingSpecial: { combinedWith: [], units: 1, enabled: false },
      searchKeywords: [],
      shippingCurrency: 'SEK',
      specialProductData: false, // Initialiserar som falskt som standard
    };
    // Slå ihop basprodukten med den faktiska produkten som skickas in
    return { ...baseProduct, ...product };
  });

  // --- Övrig lokal UI-state ---
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState(localProduct.category[0]?.name || '');
  const [subCategory, setSubCategory] = useState(localProduct.category[0]?.child?.[0]?.name || '');
  const [subSubCategory, setSubSubCategory] = useState(localProduct.category[0]?.child?.[0]?.child?.[0]?.name || '');
  const [subSubSubCategory, setSubSubSubCategory] = useState(localProduct.category[0]?.child?.[0]?.child?.[0]?.child?.[0]?.name || '');
  const [brands, setBrands] = useState([]);
  const [currency, setCurrency] = useState(localProduct.price.currency || 'SEK');
  const [shippingCurrency, setShippingCurrency] = useState(localProduct.shippingCurrency || 'SEK');
  const [specialShippingEnabled, setSpecialShippingEnabled] = useState(localProduct.shippingSpecial.enabled || false);
  const [sellInCountries, setSellInCountries] = useState(localProduct.sellInCountries || {});
  const [specialProductData, setSpecialProductData] = useState(localProduct.specialProductData || false);
  const [searchKeywords, setSearchKeywords] = useState(localProduct.searchKeywords || []);
  const [showExtra, setShowExtra] = useState(!!localProduct.specialProductData); // Styr visning baserat på befintlig data

  // --- useEffect för att hämta varumärken ---
  // Körs en gång vid komponentens mount
  useEffect(() => {
    const fetchBrands = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.warn('User not authenticated for fetching brands.');
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/brands`, {
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
  // Detta useEffect körs varje gång en av de lokala tillstånden ändras som påverkar 'product'
  useEffect(() => {
    setProduct((prev) => ({
      ...prev,
      ...localProduct, // Koppla ihop alla lokala produktfält
      category: buildCategoryStructure(),
      currency,
      searchKeywords,
      shippingCurrency,
       specialProductData: specialProductData, // Skicka hela specialProductData-objektet
    
      shippingSpecial: shippingSpecial, // Ensure enabled flag is synced
      sellInCountries,
      // Hantera här eventuella fält som inte finns direkt i localProduct men som ändras via separat state
      // t.ex. categoryPath, som är beroende av CategorySelector's state
      categoryPath: [mainCategory, subCategory, subSubCategory, subSubSubCategory].filter(Boolean),
    }));
  }, [
    localProduct,
    buildCategoryStructure,
    currency,
    searchKeywords,
    setProduct,
    shippingCurrency,
    specialShippingEnabled,
    sellInCountries,
    mainCategory, subCategory, subSubCategory, subSubSubCategory, // Nödvändiga för categoryPath
  ]);


  // --- Generell hanterare för input-fält (text och nummer) ---
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setLocalProduct((prev) => {
      // Hantera pris- och köpprisobjekt
      if (['price', 'sale_price', 'buying_price'].includes(name)) {
        return {
          ...prev,
          [name]: {
            ...prev[name], // Behåll befintliga egenskaper som dateChanged om de finns
            value: Math.max(0, Number(value)),
            currency: currency, // Använd den aktuella valutan
          },
        };
      }
      // Hantera packningsinformation som är nästlad
      else if (['weightPack', 'lengthPack', 'widthPack', 'heightPack'].includes(name)) {
        return {
          ...prev,
          packaging: {
            ...prev.packaging,
            [name]: Math.max(0, parseFloat(value)),
          },
        };
      }
      // Hantera generiska nummerfält som quantity
      else if (type === 'number') {
        return {
          ...prev,
          [name]: Math.max(0, parseFloat(value)),
        };
      }
      // Hantera övriga textfält
      else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  // --- Hanterare för specialprodukt-information ---
  const handleSpecialProductDataChange = (field, value) => {
    setSpecialProductData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSpecialProductInfoChange = (e) => {
    handleSpecialProductDataChange('info', { se: e.target.value });
  };
  const handleSpecialProductSalesOptionChange = (e) => {
    handleSpecialProductDataChange('salesOption', e.target.value);
  };

  // --- Hanterare för länder som produkten får säljas i (passas till ShippingAndSalesCountries) ---
  const handleSellInCountryCheckboxChange = (e) => { // Renamed for clarity
    const country = e.target.value;
    const checked = e.target.checked;
    setSellInCountries((prev) => {
      const newData = { ...prev };
      if (checked) {
        if (!newData[country]) {
          newData[country] = { shippingCost: 0, deliveryTime: '' };
        }
      } else {
        delete newData[country];
      }
      return newData;
    });
  };

  const handleSellInCountryShippingCostChange = (e, country) => { // Renamed for clarity
    const value = e.target.value;
    setSellInCountries((prev) => ({
      ...prev,
      [country]: {
        ...prev[country],
        shippingCost: parseInt(value),
        currency: shippingCurrency, // Använder den aktuella shippingCurrency
      },
    }));
  };

  const handleSellInCountryDeliveryTimeChange = (e, country) => { // Renamed for clarity
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


  // --- Hanterare för kategoriväljare ---
  const handleMainCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory('');
    setSubSubCategory('');
    setSubSubSubCategory('');
  };

  const handleSubCategoryChange = (e) => {
    setSubCategory(e.target.value);
    setSubSubCategory('');
    setSubSubSubCategory('');
  };

  const handleSubSubCategoryChange = (e) => {
    setSubSubCategory(e.target.value);
    setSubSubSubCategory('');
  };

  const handleSubSubSubCategoryChange = (e) => {
    setSubSubSubCategory(e.target.value);
  };

  // --- Hanterare för valutaändring (och nollställning av priser) ---
  const handleCurrencyChange = (event) => {
    const newCurrency = event.target.value;
    setCurrency(newCurrency);
    // Nollställer priserna i localProduct state när valutan ändras
    setLocalProduct((prev) => ({
      ...prev,
      price: { ...prev.price, value: 0, currency: newCurrency },
      sale_price: { ...prev.sale_price, value: 0, currency: newCurrency },
      buying_price: { ...prev.buying_price, value: 0, currency: newCurrency },
    }));
  };

  // --- Hanterare för produktens ursprungsland ---
  const handleProductCountryOfOriginChange = (e) => {
    setLocalProduct((prevProduct) => ({
      ...prevProduct,
      productCountryOfOrigin: e.target.value,
    }));
  };

  // --- Hanterare för specialfrakt enheter ---
  const handleUnitsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setLocalProduct(prev => ({
      ...prev,
      shippingSpecial: { ...prev.shippingSpecial, units: isNaN(value) ? 1 : value }
    }));
  };
  const handleSpecialShippingCombinedWithChange = (newIds) => { // Hanterare för SpecialShippingSelector
    setLocalProduct(prev => ({
      ...prev,
      shippingSpecial: { ...prev.shippingSpecial, combinedWith: newIds }
    }));
  };


  // --- Hanterare för sökord ---
  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (localProduct.keywordInput.trim() && !searchKeywords.includes(localProduct.keywordInput.trim())) {
      setSearchKeywords([...searchKeywords, localProduct.keywordInput.trim()]);
      setLocalProduct(prev => ({ ...prev, keywordInput: '' })); // Nollställ inputfält
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setSearchKeywords(searchKeywords.filter((k) => k !== keyword));
  };


  // --- Validering för formulärstatus ---
  const isFormCompleted =
    mainCategory &&
    currency &&
    localProduct.name &&
    localProduct.brand &&
    localProduct.sku &&
    localProduct.price &&
    localProduct.sale_price &&
    localProduct.buying_price &&
    Number.isFinite(localProduct.price.value) &&
    Number.isFinite(localProduct.sale_price.value) &&
    Number.isFinite(localProduct.buying_price.value) &&
    Number.isFinite(localProduct.quantity) &&
    (localProduct.packaging ? Number.isFinite(localProduct.packaging.weightPack) : false) &&
    (localProduct.packaging ? Number.isFinite(localProduct.packaging.widthPack) : false) &&
    (localProduct.packaging ? Number.isFinite(localProduct.packaging.heightPack) : false) &&
    (localProduct.packaging ? Number.isFinite(localProduct.packaging.lengthPack) : false);

  // --- Renderingslogik ---
  return (<>
 
    </>
  );
};

export default GeneralInfo;