// src/pages/EditProductPage.jsx (eller var din EditProductPage ligger)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Importera dina formulärkomponenter. DUBBELKOLLA SÖKVÄGARNA!
// Exempel: '../../components/form/GeneralInfo'
import GeneralInfo from '../components/form/GeneralInfo'; // Använd nu namnet GeneralInfo
import Description from '../components/form/editDescription'; // Behåller editDescription
import VariationsDropdown from '../components/form/EditVariations'; // Behåller EditVariations
import Meta from '../components/form/Meta'; // Behåller Meta
import Images from '../components/form/editImage'; // Behåller editImage

const EditProductPage = () => {
  const { id } = useParams(); // Hämta produkt-ID från URL-parametern

  // Definiera den fullständiga grundstrukturen för ett produktobjekt.
  // Detta är kritisk för att säkerställa att alla fält finns initialt
  // och för att förhindra 'undefined' fel när API-svaret kanske saknar vissa fält.
  const defaultProductStructure = {
    name: '',
    sku: '',
    supplierArticleNumber: '',
    // Prisobjekt för att matcha GeneralInfo's struktur
    price: { value: 0, currency: 'SEK', dateChanged: '' },
    sale_price: { value: 0, currency: 'SEK', dateChanged: '' },
    buying_price: { value: 0, currency: 'SEK', dateChanged: '' },
    quantity: 0,
    description: { se: '' }, // Antar att beskrivningen kan vara flerspråkig
    variations: [],
    meta: [], // För meta-taggar eller liknande
    image: { thumbnail: '', original: '' }, // Huvudbildens URL:er
    gallery: [], // En array av galleribilder (antingen sträng-URL:er eller objekt)
    brand: '',
    featured: false, // T.ex. om produkten ska visas som "featured"
    category: [], // Komplett kapslad kategoristruktur
    categoryPath: [], // En enklare, platt array av kategorinamn/slugs
    productCountryOfOrigin: 'AX', // Standard för Åland
    // Packningsinformation
    packaging: {
      weightPack: 0,
      widthPack: 0,
      heightPack: 0,
      lengthPack: 0,
    },
    // Frakt- och säljlandsinformation (objekt med landskod som nyckel)
    sellInCountries: {},
    shippingCurrency: 'SEK',
    shippingSpecial: { combinedWith: [], units: 1, enabled: false }, // För speciella fraktregler
    searchKeywords: [], // En array av sökord
 specialProductData: {
    info: { se: '' },
    salesOption: 'direct',
    enabled: false, // <-- Lägg till denna flagga
  },    isProductOption: false, // Om produkten är ett tillbehör
    hideProductFromView: false, // Om produkten ska döljas från vissa vyer
  };

  // State för hela produktobjektet. Initialiseras med default-strukturen.
  const [product, setProduct] = useState(defaultProductStructure);
  // State för laddningsstatus och fel
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- useEffect för att hämta produktdata från API ---
  // Körs en gång när komponenten mountas, eller när 'id' i URL:en ändras.
  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true); // Sätt laddningsstatus till true
      setError(null);     // Rensa eventuella tidigare fel

      try {
        const response = await axios.get(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products/${id}`);
        const fetchedData = response.data; // Den hämtade produktdata

        // Slå ihop default-strukturen med den hämtade datan på ett robust sätt.
        // Detta säkerställer att alla fält finns och är korrekt initialiserade,
        // samtidigt som hämtad data har företräde.
        setProduct((prevProduct) => ({
          ...defaultProductStructure, // Börja med den fullständiga defaultstrukturen
          ...fetchedData,             // Överlagra med all data som hämtats från API:et

          // För nästlade objekt, slå samman dem separat för att bevara djupare defaultvärden
          // om en egenskap saknas i fetchedData men är viktig att ha en default för.
          // Använd `|| {}` för att säkerställa att vi inte försöker sprida ut `undefined`
          price: { ...defaultProductStructure.price, ...(fetchedData.price || {}) },
          sale_price: { ...defaultProductStructure.sale_price, ...(fetchedData.sale_price || {}) },
          buying_price: { ...defaultProductStructure.buying_price, ...(fetchedData.buying_price || {}) },
          description: { ...defaultProductStructure.description, ...(fetchedData.description || {}) },
          shippingSpecial: { ...defaultProductStructure.shippingSpecial, ...(fetchedData.shippingSpecial || {}) },

          // *** KRITISKT FÖR PACKAGING: Säkerställ att den initialiseras korrekt ***
          packaging: {
            ...defaultProductStructure.packaging, // Ge defaultvärden till alla packningsfält
            ...(fetchedData.packaging || {})     // Lägg till ALLT från fetchedData.packaging, eller ett tomt objekt om det saknas
          },
          
          // Säkerställ att array-fält alltid är arrayer
          searchKeywords: Array.isArray(fetchedData.searchKeywords) ? fetchedData.searchKeywords : [],
          category: Array.isArray(fetchedData.category) ? fetchedData.category : [],
          gallery: Array.isArray(fetchedData.gallery) ? fetchedData.gallery : [],
          variations: Array.isArray(fetchedData.variations) ? fetchedData.variations : [],
          meta: Array.isArray(fetchedData.meta) ? fetchedData.meta : [],
          
          // Särskild hantering för specialProductData om det behövs
          specialProductData: fetchedData.specialProductData 
              ? (fetchedData.specialProductData.info ? fetchedData.specialProductData : { info: {se: ""}, salesOption: "direct" }) 
              : false,
        }));
      } catch (err) {
        console.error('Fel vid hämtning av produkt:', err);
        setError('Kunde inte ladda produktdata. Kontrollera nätverksanslutningen eller försök igen senare.');
      } finally {
        setIsLoading(false); // Sätt laddningsstatus till false oavsett resultat
      }
    };

    fetchProductData();
  }, [id]); // Beroendelista: körs om 'id' ändras

  // --- Hanterare för VariationsDropdown ---
  // Dessa hanterare använder useCallback för prestandaoptimering,
  // så att de inte återskapas i varje rendering om deras beroenden inte ändras.

  const handleVariationsUpdate = useCallback((variations) => {
    setProduct((prev) => ({
      ...prev,
      // Se till att variationer är rena objekt utan 'isNew' flaggor vid uppdatering
      variations: variations.map((v) => ({ ...v, isNew: undefined })),
    }));
  }, []);

  const handleImageLinkAdd = useCallback((variationId, link) => {
    setProduct((prev) => {
      // Uppdaterar 'extraColor' för det första galleri-objektet (standardantagande)
      const newGallery = prev.gallery.map((item, index) => {
        if (index === 0) {
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

  const handleRemoveExtraColors = useCallback((variationId) => {
    setProduct((prev) => {
      const newGallery = prev.gallery.map((item, index) => {
        if (index === 0 && item.extraColor) {
          // Destrukturera bort den specifika variationId:n från extraColor
          const { [variationId]: _, ...remainingColors } = item.extraColor;
          return { ...item, extraColor: remainingColors };
        }
        return item;
      });
      return { ...prev, gallery: newGallery };
    });
  }, []);

  const handleVariationRemove = useCallback((variationId) => {
    // Anropa även för att rensa eventuella extra färger kopplade till variationen
    handleRemoveExtraColors(variationId);
    setProduct((prev) => ({
      ...prev,
      variations: prev.variations.filter((v) => v.id !== variationId),
    }));
  }, [handleRemoveExtraColors]);

  // --- Hanterare för bilduppladdning (om 'Images' komponenterna använder dessa callbacks) ---
  // Om din 'Images' komponent hanterar sin egen interna state och uppdaterar 'product' direkt,
  // kanske dessa inte behövs här.
  const handleSingleImageUpload = useCallback((image) => {
    setProduct((prev) => ({
      ...prev,
      image, // 'image' är ett objekt { thumbnail, original }
    }));
  }, []);

  const handleGalleryImageAdd = useCallback((newImages) => {
    setProduct((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ...newImages], // Lägg till nya bilder i galleriet
    }));
  }, []);

  const handleGalleryImageRemove = useCallback((imageToRemoveUrl) => {
    setProduct(prev => ({
        ...prev,
        gallery: prev.gallery.filter(img => img.url !== imageToRemoveUrl) // Antar att galleribildobjekt har en 'url' egenskap
    }));
  }, []);

  // --- Hantera formulärinlämning ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Förhindra standardformulärinlämning

    // Enkel klientvalidering innan data skickas till servern.
    // Den mer detaljerade valideringen sköts av GeneralInfo's interna logik.
    // OBS! Dessa fält måste matchas mot hur GeneralInfo's isFormCompleted validerar!
    if (!product.name || !product.brand || !product.sku || !product.price?.value || !product.quantity) {
      alert('Vänligen fyll i alla obligatoriska fält (Namn, Varumärke, SKU, Pris, Antal i lager).');
      return;
    }
    // Lägg till fler specifika valideringar här om det behövs innan submission

    try {
      // Skicka det kompletta 'product'-objektet till API:et med PUT-metoden
      const response = await axios.put(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products/${id}`, product, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) { // Axios använder response.status för HTTP-statuskoder
        alert('Produkten uppdaterades framgångsrikt!');
        // Du kan här lägga till logik för att omdirigera användaren, t.ex.
        // navigate(`/products/${id}`);
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
  // Om 'product' är null/undefined efter laddning (bör inte hända med defaultProductStructure, men bra som fallback)
  if (!product || !product.name) {
    return <div className="no-product-found">Ingen produkt hittades med ID: {id} eller data är ofullständig.</div>;
  }

  // --- Rendering av formuläret ---
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Redigera Produkt: {product.name}</h2>

      {/* GeneralInfo - Huvudinformation */}
      {/* Skickar in hela produktobjektet och setProduct för att hantera uppdateringar */}
      <GeneralInfo product={product} setProduct={setProduct} />

      {/* Description - Produktbeskrivning */}
      <Description product={product} setProduct={setProduct} />

      {/* Images - Bildhantering */}
      <Images
        product={product}
        setProduct={setProduct}
        // Om Images-komponenten behöver callbacks för specifika bildhändelser
        // onSingleImageUpload={handleSingleImageUpload}
        // onGalleryImageAdd={handleGalleryImageAdd}
        // onGalleryImageRemove={handleGalleryImageRemove}
      />

      {/* VariationsDropdown - Variationer */}
      <VariationsDropdown
        product={product} // Skicka in produkt för att läsa befintliga variationer
        onVariationsUpdate={handleVariationsUpdate} // Callback för när variationer ändras
        onImageLinkAdd={handleImageLinkAdd}         // Callback för att lägga till bildlänk till variation
        onVariationRemove={handleVariationRemove}   // Callback för att ta bort variation
      />

      {/* Meta - Meta-data */}
      <Meta product={product} setProduct={setProduct} />

      <button type="submit" className="submit-button">Uppdatera Produkt</button>
    </form>
  );
};

export default EditProductPage;