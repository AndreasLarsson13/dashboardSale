import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const SelectableItemList = ({
  headerText,
  fetchDataFunction,
  initialSelectedItems = [],
  onItemsUpdate,
  onItemRemove = () => {},
  itemKeyExtractor = (item) => item._id,
  itemDisplayLabelExtractor = (item) => item.name || item.title || 'Namnlös',
  itemParentLabelExtractor = (item) => item.name_parrent,
  showBrandFilter = false,
  showCategoryFilter = false,
  showOptionCheckbox = false,
  initialOptionCheckboxChecked = false,
  availableBrands = [],
  availableCategories = [],
  renderAdditionalFields = null,
  onImageLinkAdd, // Passed down from EditProductPage for variations
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyOptions, setShowOnlyOptions] = useState(initialOptionCheckboxChecked);

  // 1. Initialisera valda objekt från props
  // Denna useEffect körs när initialSelectedItems eller availableItems ändras.
  // Den ser till att selectedItems state matchar initiala props, och hämtar fullständiga objekt.
  useEffect(() => {
    // --- START: Förbättrad stabilitetskontroll ---
    // Skapa en stabil representation av de initialt valda objekten
    const normalizedInitialItems = (initialSelectedItems.options || initialSelectedItems)
      .map(item => { // Ensure _id or id and any key fields are consistently picked
        return {
          id: item.id || item._id,
          sku: item.sku,
          price: item.price,
          variationImg: item.variationImg,
          name: item.name,
          name_parrent: item.name_parrent,
          title: item.title,
        };
      })
      .sort((a, b) => (a.id || '').localeCompare(b.id || '')); // Sort for consistent stringify order

    // Skapa en stabil representation av de *aktuellt valda* objekten i komponenten
    const normalizedSelectedItems = selectedItems
      .map(item => {
        return {
          id: itemKeyExtractor(item),
          sku: item.sku,
          price: item.price,
          variationImg: item.variationImg,
          name: item.name,
          name_parrent: item.name_parrent,
          title: item.title,
        };
      })
      .sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    // Jämför nu de stringifierade versionerna för en djupare innehållsjämförelse
    const initialItemsString = JSON.stringify(normalizedInitialItems);
    const selectedItemsString = JSON.stringify(normalizedSelectedItems);

    // Om innehållet är detsamma, och det finns redan valda objekt, avbryt för att förhindra onödiga uppdateringar
    if (initialItemsString === selectedItemsString && selectedItems.length > 0) {
      return;
    }
    
    // Om inga initiala objekt finns och inga valda objekt redan, rensa och returnera
    // Detta förhindrar att den kör onödigt om initialSelectedItems är tom och selectedItems redan är tom
    if (initialSelectedItems.length === 0 && selectedItems.length === 0) {
      if (!loading) setSelectedItems([]); // Endast sätt om inte laddar och redan tom
      return;
    }

    // Om initiala objekt finns men availableItems inte är laddat, vänta
    // Detta är viktigt så att vi kan "matcha" de initiala objekten med fullständiga objekt från availableItems
    if (initialSelectedItems.length > 0 && availableItems.length === 0 && loading) {
        return;
    }
    // --- SLUT: Förbättrad stabilitetskontroll ---


    const itemsToResolve = initialSelectedItems.options || initialSelectedItems;

    const resolved = itemsToResolve.map((item) => {
      const match = availableItems.find((opt) => itemKeyExtractor(opt) === (item.id || item._id));
      if (!match) {
        // Om match inte hittas i availableItems (t.ex. p.g.a. filter eller om den inte finns längre i den aktiva listan)
        // Använd itemet självt men säkerställ att _id finns för keyExtractor
        return {
          ...item,
          _id: item.id || item._id, // Ensure _id property is available
        };
      }
      return {
        ...match, // Använd det fullständiga objektet från availableItems
        // Överskrid med befintliga värden om de finns i initialItem (t.ex. anpassad SKU/pris)
        sku: item.sku || match.sku,
        price: item.price || match.price,
        variationImg: item.variationImg || match.variationImg,
      };
    }).filter(Boolean); // Filtrera bort eventuella null-värden om en match inte hittades alls

    setSelectedItems(resolved);

    // Anropa parent's update-funktion med de lösta objekten
    if (typeof onItemsUpdate === 'function') {
      onItemsUpdate(resolved.map((item) => ({
        id: itemKeyExtractor(item),
        sku: item.sku || '',
        price: item.price || {},
        variationImg: item.variationImg || false,
        product: true, // Kan behöva generaliseras eller tas bort om inte alltid relevant
        name: item.name,
        title: item.title,
        name_parrent: item.name_parrent, // Inkludera alltid name_parrent för variationer
      })));
    }
  }, [initialSelectedItems, availableItems, onItemsUpdate, itemKeyExtractor, loading]);


  // 2. Hämta tillgängliga objekt baserat på filter från backend
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.warn('User not authenticated for fetching items.');
          if (isMounted) {
            setError('User not authenticated. Cannot fetch items.');
            setAvailableItems([]);
          }
          return;
        }

        const filters = {
          brand: brandFilter,
          category: categoryFilter,
          search: searchTerm,
          showOnlyOptions: showOptionCheckbox ? showOnlyOptions : undefined, 
        };
        
        const data = await fetchDataFunction(filters, user, controller.signal);

        if (isMounted) {
          setAvailableItems(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(axios.isCancel(err) ? 'Avbröts' : err.message || 'Kunde inte hämta objekt');
          console.error('Fel vid hämtning av objekt:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [brandFilter, categoryFilter, searchTerm, showOnlyOptions, fetchDataFunction, showOptionCheckbox]);

  // Hantera val/avval av ett objekt
  const handleItemSelect = (item) => {
    const isAlreadySelected = selectedItems.some((o) => itemKeyExtractor(o) === itemKeyExtractor(item));
    let newSelected;

    if (isAlreadySelected) {
      newSelected = selectedItems.filter((o) => itemKeyExtractor(o) !== itemKeyExtractor(item));
      onItemRemove?.(itemKeyExtractor(item));
    } else {
      newSelected = [...selectedItems, item];
    }

    setSelectedItems(newSelected);
    // Skicka tillbaka den uppdaterade listan till parent i önskat format
    onItemsUpdate?.(newSelected.map((o) => ({
      id: itemKeyExtractor(o),
      sku: o.sku || '',
      price: o.price || {},
      variationImg: o.variationImg || false,
      product: true,
      name: o.name,
      title: o.title,
      name_parrent: o.name_parrent, // Inkludera name_parrent här också
    })));
  };

  // Hantera input ändringar (SKU, Price) för valda objekt
  const handleInputChange = (itemId, field, value) => {
    const updatedSelectedItems = selectedItems.map(item => {
        if (itemKeyExtractor(item) === itemId) {
            return {
                ...item,
                [field]: field === 'price' 
                    ? { SEK: { value: Number(value), dateChanged: new Date().toISOString().split('T')[0], originalCurrency: true }}
                    : value
            };
        }
        return item;
    });
    setSelectedItems(updatedSelectedItems);
    onItemsUpdate?.(updatedSelectedItems.map((o) => ({
      id: itemKeyExtractor(o),
      sku: o.sku || '',
      price: o.price || {},
      variationImg: o.variationImg || false,
      product: true,
      name: o.name,
      title: o.title,
      name_parrent: o.name_parrent, // Inkludera name_parrent här också
    })));
  };


  // De o-valda objekten som matchar filter och sökterm
  const unselectedAndFilteredItems = availableItems.filter(item => 
    !selectedItems.some(sel => itemKeyExtractor(sel) === itemKeyExtractor(item))
  );

  const areItemsValid = selectedItems.length > 0;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 10, marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 10,
          cursor: 'pointer',
          background: '#f1f1f1',
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold',
          userSelect: 'none'
        }}
        onClick={() => setIsDropdownOpen((open) => !open)}
      >
        <span style={{ marginRight: 10 }}>
          {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
        <span>{headerText}</span>
        <span style={{ marginLeft: 'auto', color: areItemsValid ? 'green' : 'red' }}>
          {areItemsValid ? <FaCheckCircle /> : <FaExclamationCircle />}
        </span>
      </div>

      {error && <div style={{ color: 'red', marginTop: 10 }}>Fel: {error}</div>}
      {loading && <div style={{ color: '#555', marginTop: 10 }}>Laddar {headerText.toLowerCase()}...</div>}

      {isDropdownOpen && (
        <div style={{ marginTop: 10 }}>
          {/* Valda Objekt (Alltid synliga) */}
          {selectedItems.length > 0 && (
            <div style={{ marginBottom: 10, border: '1px solid #ccc', borderRadius: 4, padding: 8, background: '#f9f9f9' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 5 }}>Valda {headerText.toLowerCase()}:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedItems.map((item) => (
                  <div
                    key={itemKeyExtractor(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      border: '1px solid #a6e0ff',
                      borderRadius: 4,
                      backgroundColor: '#e6f7ff',
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleItemSelect(item)}
                  >
                    <span style={{ marginRight: 5 }}>
                        {itemParentLabelExtractor(item) && `${itemParentLabelExtractor(item)} / `}
                        {itemDisplayLabelExtractor(item)}
                    </span>
                    <FaTimesCircle style={{ color: 'red', fontSize: 12 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sökfält och filter */}
          <div style={{ marginBottom: 10, display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder={`Sök ${headerText.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
            {showOptionCheckbox && (
                <label style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', padding: 6, borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={showOnlyOptions}
                        onChange={(e) => setShowOnlyOptions(e.target.checked)}
                        style={{ marginRight: 5 }}
                    />
                    Visa bara tillbehör
                </label>
            )}
            {showBrandFilter && (
                <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                >
                    <option value="">Alla Märken</option>
                    {availableBrands.map((brand) => (
                        <option key={brand._id} value={brand.slug}> 
                            {brand.name}
                        </option>
                    ))}
                </select>
            )}
            {showCategoryFilter && (
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                >
                    <option value="">Alla Kategorier</option>
                    {availableCategories.map((category) => (
                        <option key={category._id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
            )}
          </div>

          {/* Lista med o-valda och filtrerade objekt (scrollbar & grid) */}
          <div 
            style={{ 
              maxHeight: 300, 
              overflowY: 'auto', 
              border: '1px solid #ccc', 
              borderRadius: 4,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 8,
              padding: 8,
              '@media (max-width: 768px)': { 
                gridTemplateColumns: '1fr', 
              }
            }}
          >
            {unselectedAndFilteredItems.length === 0 && !loading && (
                <div style={{ padding: 10, textAlign: 'center', color: '#666', gridColumn: '1 / -1' }}>
                    Inga matchande {headerText.toLowerCase()} hittades.
                </div>
            )}
            
            {unselectedAndFilteredItems.map((item) => (
              <div
                key={itemKeyExtractor(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 8,
                  border: '1px solid #eee',
                  borderRadius: 4,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
                onClick={() => handleItemSelect(item)}
              >
                <input
                  type="checkbox"
                  checked={false}
                  readOnly
                  style={{ marginRight: 10 }}
                />
                <div style={{ flexGrow: 1 }}>
                  <div>
                    {itemParentLabelExtractor(item) && `**${itemParentLabelExtractor(item)}** / `}
                    {itemDisplayLabelExtractor(item)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>ID: {itemKeyExtractor(item)}</div>
                  {/* Rendar extra fält för o-valda objekt om funktionen är definierad */}
                  {renderAdditionalFields && renderAdditionalFields(item, handleInputChange, onImageLinkAdd)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectableItemList;