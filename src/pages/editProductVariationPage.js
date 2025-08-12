import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Importera dina formulärkomponenter
import GeneralInfo from '../components/form/VariationGeneralInfo';
import Description from '../components/form/editDescription';
import VariationsDropdown from '../components/form/Variations'; // Din VariationsDropdown
import OptionsDropdown from '../components/form/Options'; // Din OptionsDropdown (förmodligen samma komponent som VariationsDropdown)
import Meta from '../components/form/Meta';
import EditImages from '../components/form/editImage'; // Din EditImages-komponent
import VariationGroup from '../components/form/components/variationGroup';

const EditProductPage = () => {
  const { id } = useParams(); // Hämta produkt-ID från URL-parametern


  const [accessory, setAccessory] = useState({
     
      color: false,
      meta: false,
      type: '',
     
    });
  // Definiera den fullständiga grundstrukturen för ett produktobjekt.
  // Detta är kritiskt för att säkerställa att alla fält finns initialt
  // och för att förhindra 'undefined' fel när API-svaret kanske saknar vissa fält.
  const defaultProductStructure = {
    name: '',
    sku: '',
    supplierArticleNumber: '',
    price: { value: 0, currency: 'SEK', dateChanged: '' },
    sale_price: { value: 0, currency: 'SEK', dateChanged: '' },
    buying_price: { value: 0, currency: 'SEK', dateChanged: '' },
    quantity: 0,
    description: { se: '' },
    variations: [], // Initialiseras som tom array
    options: [],    // Initialiseras som tom array för tillbehör
    meta: [],
    image: { thumbnail: '', original: '' },
    gallery: [],
    brand: '',
    featured: false,
    category: [], // Komplett kapslad kategoristruktur
    categoryPaths: [], // För `categoryPaths` som array av arrayer av strängar
    productCountryOfOrigin: 'AX',
    packaging: {
      weightPack: 0,
      widthPack: 0,
      heightPack: 0,
      lengthPack: 0,
    },
    sellInCountries: {},
    shippingCurrency: 'SEK',
    shippingSpecial: { combinedWith: [], units: 1, enabled: false },
    searchKeywords: [],
    specialProductData: {
      info: { se: '' },
      salesOption: 'direct',
      enabled: false,
    },
    isProductOption: false,
    hideProductFromView: false,
        variationGroup: { se: '', fi: '', en: '' }, // Här är din variationGroup

  };

  const [product, setProduct] = useState(defaultProductStructure);
  const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
  
  const [error, setError] = useState(null);

const handleInputChange = (e) => {
  const { name, value } = e.target;

  setAccessory((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  // --- useEffect för att hämta produktdata från API ---
 useEffect(() => {
  const fetchProductData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/variationer/${id}`);
      const fetchedData = response.data;

      // Förbered alla fält
      const newProduct = {
        ...defaultProductStructure,
        ...fetchedData,
        price: { ...defaultProductStructure.price, ...(fetchedData.price || {}) },
        sale_price: { ...defaultProductStructure.sale_price, ...(fetchedData.sale_price || {}) },
        buying_price: { ...defaultProductStructure.buying_price, ...(fetchedData.buying_price || {}) },
        description: { ...defaultProductStructure.description, ...(fetchedData.description || {}) },
        shippingSpecial: { ...defaultProductStructure.shippingSpecial, ...(fetchedData.shippingSpecial || {}) },
        specialProductData: { ...defaultProductStructure.specialProductData, ...(fetchedData.specialProductData || {}) },
        packaging: { ...defaultProductStructure.packaging, ...(fetchedData.packaging || {}) },
        searchKeywords: Array.isArray(fetchedData.searchKeywords) ? fetchedData.searchKeywords : [],
        category: Array.isArray(fetchedData.category) ? fetchedData.category : [],
        categoryPaths: Array.isArray(fetchedData.categoryPaths) ? fetchedData.categoryPaths : [],
        gallery: Array.isArray(fetchedData.gallery) ? fetchedData.gallery : [],
        variations: Array.isArray(fetchedData.variations) ? fetchedData.variations : [],
        options: Array.isArray(fetchedData.options) ? fetchedData.options : [],
  variationGroup: {
            ...defaultProductStructure.variationGroup,
            ...(fetchedData.variationGroup || {})
          }
      };

      // Jämför om något faktiskt förändrats (framför allt .options)
      setProduct((prevProduct) => {
        const sameOptions = JSON.stringify(prevProduct.options) === JSON.stringify(newProduct.options);
        const sameData = JSON.stringify(prevProduct) === JSON.stringify(newProduct); // Valfritt – djup jämförelse
        return sameOptions && sameData ? prevProduct : newProduct;
      });

    } catch (err) {
      console.error('Fel vid hämtning av produkt:', err);
      setError('Kunde inte ladda produktdata. Kontrollera nätverksanslutningen eller försök igen senare.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchProductData();
}, [id]);

 // --- Hanterare för VariationsDropdown (för product.variations) ---
  const handleVariationsUpdate = useCallback((variations) => {
    setProduct((prev) => ({
      ...prev,
      variations: variations.map((v) => ({ ...v, isNew: undefined })),
    }));
  }, []);
  // --- Hanterare för VariationsDropdown (för product.variations) ---
  
  // Hanterare för att lägga till/ändra bildlänk för en variation
  const handleImageLinkAdd = useCallback((variationId, link) => {
    setProduct((prev) => {
      // Uppdaterar 'extraColor' för det första galleri-objektet (standardantagande)
      const newGallery = prev.gallery.map((item, index) => {
        if (index === 0) { // Antar att extraColor-data sitter på första galleribilden
          return {
            ...item,
            extraColor: {
              ...(item.extraColor || {}), // Behåll befintliga extra färger
              [variationId]: link,        // Lägg till/uppdatera länk för specifik variation
            },
          };
        }
        return item;
      });
      return { ...prev, gallery: newGallery };
    });
  }, []);

  // Hanterare för att ta bort extra färger kopplade till en variation
  const handleRemoveExtraColors = useCallback((variationId) => {
    setProduct((prev) => {
      const newGallery = prev.gallery.map((item, index) => {
        if (index === 0 && item.extraColor) {
          const { [variationId]: _, ...remainingColors } = item.extraColor;
          return { ...item, extraColor: remainingColors };
        }
        return item;
      });
      return { ...prev, gallery: newGallery };
    });
  }, []);


 // Hanterare för att uppdatera variationGroup-objektet
  // Den tar event-objektet (e) och språkkoden (lang, t.ex. 'se', 'fi', 'en')
  const handleVariationGroupChange = useCallback((e, lang) => {
    const { value } = e.target; // Hämta värdet från inputfältet
    setProduct((prevProduct) => ({
      ...prevProduct, // Behåll befintliga produktdata
      variationGroup: {
        ...prevProduct.variationGroup, // Behåll befintliga översättningar
        [lang]: value, // Uppdatera specifikt språkvärde
      },
    }));
  }, []);

  // Hanterare när en variation tas bort
  const handleVariationRemove = useCallback((variationId) => {
    // Anropa även för att rensa eventuella extra färger kopplade till variationen
    handleRemoveExtraColors(variationId);
    setProduct((prev) => ({
      ...prev,
      variations: prev.variations.filter((v) => v.id !== variationId),
    }));
  }, [handleRemoveExtraColors]);


  // --- HANTERARE FÖR OptionsDropdown (för product.options) ---
  const handleOptionsUpdate = useCallback((optionsList) => {
    // VIKTIGT: Jämför om listan faktiskt har ändrats för att undvika oändlig loop
    const currentOptionIds = product.options.map(o => o.id).sort().join(',');
    const newOptionIds = optionsList.map(o => o.id).sort().join(',');

    if (currentOptionIds !== newOptionIds) {
      setProduct((prev) => ({
        ...prev,
        // Behåll isNew-flaggan om den är viktig, annars kan du ta bort den i .map()
        options: optionsList.map((o) => (o.isNew ? o : o)),
      }));
    }
  }, [product.options]); // Beroende på product.options för jämförelse


  // --- Hantera formulärinlämning ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/variationer/${id}`, product, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        alert('Produkten uppdaterades framgångsrikt!');
        // Du kan här lägga till logik för att omdirigera användaren
      } else {
        console.error('Misslyckades med att uppdatera produkt:', response.status, response.data);
        alert(`Kunde inte uppdatera produkten. Fel: ${response.status} ${response.data?.message || 'Okänt fel'}`);
      }
    } catch (error) {
      console.error('Fel vid uppdatering av produkt:', error);
      alert('Ett oväntat fel inträffade vid uppdatering av produkten.');
    }
  };

  // --- Laddnings- och felmeddelanden ---
  if (isLoading) {
    return <div className="loading-message">Laddar produktdata... Var god vänta.</div>;
  }
  if (error) {
    return <div className="error-message">Fel: {error}</div>;
  }
  if (!product || !product.name) {
    return <div className="no-product-found">Ingen produkt hittades med ID: {id} eller data är ofullständig.</div>;
  }

  // --- Rendering av formuläret ---
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Redigera Variation: {product.name} zzz</h2>

       
      <div className="form-section">
        <h3>Gruppnamn för variationer (översättningar)</h3>
        <div className="form-field">
          <label htmlFor="variationGroup_se">Svenska:</label>
          <input
            type="text"
            id="variationGroup_se"
            value={product.variationGroup.se || ''} 
            onChange={(e) => handleVariationGroupChange(e, 'se')} 
            placeholder="T.ex. Färg"
          />
        </div>
        <div className="form-field">
          <label htmlFor="variationGroup_fi">Finska:</label>
          <input
            type="text"
            id="variationGroup_fi"
            value={product.variationGroup.fi || ''}
            onChange={(e) => handleVariationGroupChange(e, 'fi')} 
            placeholder="Esim. Väri"
          />
        </div>
        <div className="form-field">
          <label htmlFor="variationGroup_en">Engelska:</label>
          <input
            type="text"
            id="variationGroup_en"
            value={product.variationGroup.en || ''} 
            onChange={(e) => handleVariationGroupChange(e, 'en')} 
            placeholder="E.g. Color"
          />
        </div>
      </div>

      {/* GeneralInfo - Huvudinformation */}
      <GeneralInfo product={product} setProduct={setProduct} />

      {/* Description - Produktbeskrivning */}
      <Description product={product} setProduct={setProduct} />

      {/* Images - Bildhantering */}
      <EditImages
        product={product}
        setProduct={setProduct}
      />

      {/* OptionsDropdown - Tillbehör (skickar product.options till den) */}
      <OptionsDropdown
      
        onVariationsUpdate={handleOptionsUpdate}
        initialSelectedVariations={product.options || []}
      />  

      {/* VariationsDropdown - Variationer (skickar product.variations till den) */}
    

      {/* Meta - Meta-data */}
      <Meta product={product} setProduct={setProduct} />

      <button type="submit" className="submit-button">Uppdatera Produkt</button>
    </form>
  );
};

export default EditProductPage;