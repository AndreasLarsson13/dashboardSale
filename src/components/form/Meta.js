import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaRegCircle, FaCheck, FaTrash } from 'react-icons/fa';

const allLanguages = ['se', 'en', 'fi'];
const languageLabels = {
    se: 'Svenska',
    en: 'Engelska',
    fi: 'Finska'
};

const Meta = ({ product, setProduct, mode = 'edit' }) => {
    const [isExtraInfoOpen, setIsExtraInfoOpen] = useState(false);
    const [isTechnicalDataOpen, setIsTechnicalDataOpen] = useState(false);
    const [isPdfDataOpen, setIsPdfDataOpen] = useState(false);

    const materialOptions = useMemo(() => [
        { label: "Stål", value: "steel" }, { label: "Rostfritt stål", value: "stainless steel" },
        { label: "Järn", value: "iron" }, { label: "Gjutjärn", value: "cast iron" },
        { label: "Aluminium", value: "aluminum" }, { label: "Koppar", value: "copper" },
        { label: "Mässing", value: "brass" }, { label: "Brons", value: "bronze" },
        { label: "Zink", value: "zinc" }, { label: "Plast", value: "plastic" },
        { label: "Keramik", value: "ceramic" }, { label: "Glas", value: "glass" },
        { label: "Trä", value: "wood" }, { label: "Komposit", value: "composite" },
        { label: "Betong", value: "concrete" }, { label: "Titan", value: "titanium" },
        { label: "Matt Svart", value: "matte black" }, { label: "Krom", value: "chrome" },
        { label: "Mässing", value: "brass" }, { label: "Koppar", value: "copper" },
        { label: "Brons", "value": "bronze" }, { label: "Svart Krom", value: "black chrome" },
        { label: "Honungsguld", value: "honey gold" }, { label: "Borstad Svart Krom", value: "brushed black chrome" },
        { label: "Borstad Honungsguld", value: "brushed honey gold" }, { label: "Borstad Nickel", value: "brushed nickel" },
        { label: "Ascot Grå", value: "ascot grey" }, { label: "Grafit", value: "graphite" },
    ], []);

    const predefinedTechnicalFields = useMemo(() => [
        { key: 'height', value: { se: 'Höjd (mm)', en: 'Height (mm)', fi: 'Korkeus (mm)' } },
        { key: 'weight', value: { se: 'Nettovikt (kg)', en: 'Net weight (kg)', fi: 'Nettopaino (kg)' } },
        { key: 'width', value: { se: 'Bredd (mm)', en: 'Width (mm)', fi: 'Leveys (mm)' } },
        { key: 'depth', value: { se: 'Djup (mm)', en: 'Depth (mm)', fi: 'Syvyys (mm)' } },
        { key: 'vedlängd', value: { se: 'Maximal vedlängd (cm)', en: 'Max log length (cm)', fi: 'Suurin puun pituus (cm)' } },
        { key: 'effekt', value: { se: 'Effekt (W)', en: 'Power (W)', fi: 'Teho (W)' } },
        { key: 'color', value: { se: 'Färg', en: 'Color', fi: 'Väri' } },
        { key: 'material', value: { se: 'Material', en: 'Material', fi: 'Materiaali' } },
        { key: 'uppvärmningsyta', value: { se: 'Maximal uppvärmningsyta (m²)', en: 'Max heating area (m²)', fi: 'Suurin lämmitettävä pinta-ala (m²)' } },
        { key: 'skorstensanslutning', value: { se: 'Skorstensanslutning', en: 'Chimney connection', fi: 'Savupiipun liitäntä' } },
        { key: 'skorstensanslutningValue', value: { se: 'Upptill, Bak', en: 'Top, Back', fi: 'Ylhäällä, Takana' } },
        { key: 'verkningsgrad', value: { se: 'Verkningsgrad (%)', en: 'Efficiency (%)', fi: 'Hyötysuhde (%)' } },
        { key: 'gasconsumption', value: { se: 'Gaskonsumtion', en: 'Gas consumption', fi: 'Kaasunkulutus' } },
        { key: 'preheatingtime', value: { se: 'Förvärmningstid', en: 'Preheating time', fi: 'Esilämmitysaika' } },
        { key: 'floor', value: { se: 'Bakyta', en: 'Back surface', fi: 'Takapinta' } },
        { key: 'kyleffekt', value: { se: 'Kyleffekt', en: 'Cooling power', fi: 'Jäähdytysteho' } },
{ key: 'varmeeffekt', value: { se: 'Värmeeffekt', en: 'Heating power', fi: 'Lämmitysteho' } },
        { key: 'custom', value: { se: 'Anpassad', en: 'Custom', fi: 'Mukautettu' } },
{ key: 'bastuvolym', value: { se: 'Bastuvolym', en: 'Sauna volume', fi: 'Saunan tilavuus' } },
{ key: 'stenmassa', value: { se: 'Stenmassa (MAX)', en: 'Stone mass (MAX)', fi: 'Kivimassa (MAX)' } },
{ key: 'diameter', value: { se: 'Diameter', en: 'Diameter', fi: 'Halkaisija' } },

    ], []);

    const colorOptions = useMemo(() => [
        { label: "Vit", value: "white" }, { label: "Röd", value: "red" },
        { label: "Grön", value: "green" }, { label: "Blå", value: "blue" },
        { label: "Gul", value: "yellow" }, { label: "Lila", value: "purple" },
        { label: "Cyan", value: "cyan" }, { label: "Magenta", value: "magenta" },
        { label: "Orange", value: "orange" }, { label: "Brun", value: "brown" },
        { label: "Rosa", value: "pink" }, { label: "Svart", value: "black" }
    ], []);

    // getPredefinedKey is simplified, it simply returns the key if available
    // or the custom string title.
    const getPredefinedKey = useCallback((itemTitle, itemIdForFilter) => {
        // Prioritize itemIdForFilter if it's a string key, as per the new simplified structure
        if (typeof itemIdForFilter === 'string') {
            return itemIdForFilter;
        }
        // If itemTitle is already a string (could be a custom title or old format 'key')
        if (typeof itemTitle === 'string') {
            return itemTitle;
        }
        // Fallback for older multi-language title objects, try to find the key
        if (typeof itemTitle === 'object' && itemTitle.se) {
            const foundByLocalizedTitle = predefinedTechnicalFields.find(field =>
                field.value.se === itemTitle.se &&
                field.value.en === itemTitle.en &&
                field.value.fi === itemTitle.fi
            );
            if (foundByLocalizedTitle) {
                return foundByLocalizedTitle.key;
            }
        }
        return '';
    }, [predefinedTechnicalFields]);


    const [technicalData, setTechnicalData] = useState(() => {
        const loadedData = product.meta.find(meta => meta.title === 'TecnicalData')?.tecnical || [];
        return loadedData.map(item => ({
            ...item,
            // When loading, set 'title' to the string key (idForFilter) or the custom string directly
            title: getPredefinedKey(item.title, item.idForFilter),
            // If the loaded item's title is not a predefined key, it's a custom title. Store it for display.
            customTitle: (typeof item.title === 'string' && !predefinedTechnicalFields.some(f => f.key === item.title)) ? item.title : undefined
        }));
    });

    const [pdfData, setPdfData] = useState(() => {
        const loadedData = product.meta.find(meta => meta.title === 'PDF')?.PDF || [];
        // PDF titles are handled based on mode for display/editing
        return loadedData.map(item => {
            if (mode === 'edit' && typeof item.title === 'object') {
                return { ...item, title: { ...item.title } }; // Keep as object for edit mode
            } else if (typeof item.title === 'object') {
                return { ...item, title: item.title[allLanguages[0]] || '' }; // Flatten to string for add mode display
            }
            return { ...item, title: item.title || '' }; // Already string or empty
        });
    });

    useEffect(() => {
        const newTechnicalData = product.meta.find(meta => meta.title === 'TecnicalData')?.tecnical || [];
        setTechnicalData(newTechnicalData.map(item => ({
            ...item,
            title: getPredefinedKey(item.title, item.idForFilter),
            customTitle: (typeof item.title === 'string' && !predefinedTechnicalFields.some(f => f.key === item.title)) ? item.title : undefined
        })));

        const newPdfData = product.meta.find(meta => meta.title === 'PDF')?.PDF || [];
        setPdfData(newPdfData.map(item => {
            if (mode === 'edit' && typeof item.title === 'object') {
                return { ...item, title: { ...item.title } };
            } else if (typeof item.title === 'object') {
                return { ...item, title: item.title[allLanguages[0]] || '' };
            }
            return { ...item, title: item.title || '' };
        }));
    }, [product.meta, getPredefinedKey, predefinedTechnicalFields, mode]);


    const handleTechnicalDataChange = useCallback((index, field, value) => {
        const updatedData = [...technicalData];
        updatedData[index] = { ...updatedData[index], [field]: value };
        setTechnicalData(updatedData);

        const dataToSave = updatedData.map(item => {
            const savedItem = { ...item };

            // If the title is 'custom', use the customTitle field as the actual title
            if (savedItem.title === 'custom') {
                savedItem.title = savedItem.customTitle || '';
            }
            // In all cases for technical data, remove customTitle and idForFilter as per new structure
            delete savedItem.customTitle;
            delete savedItem.idForFilter;

            return savedItem;
        });

        setProduct(prev => {
            const updatedMeta = prev.meta.filter(meta => meta.title !== 'TecnicalData');
            if (dataToSave.length > 0) {
                return {
                    ...prev,
                    meta: [...updatedMeta, { title: 'TecnicalData', tecnical: dataToSave }]
                };
            }
            return {
                ...prev,
                meta: updatedMeta // Remove TecnicalData object if the array is empty
            };
        });
    }, [technicalData, setProduct]);


    const handleRemoveTechnicalData = useCallback((index) => {
        const updatedData = technicalData.filter((_, i) => i !== index);
        setTechnicalData(updatedData);

        const dataToSave = updatedData.map(item => {
            const savedItem = { ...item };

            if (savedItem.title === 'custom') {
                savedItem.title = savedItem.customTitle || '';
            }
            delete savedItem.customTitle;
            delete savedItem.idForFilter;

            return savedItem;
        });

        setProduct(prev => {
            const updatedMeta = prev.meta.filter(meta => meta.title !== 'TecnicalData');
            if (dataToSave.length > 0) {
                return {
                    ...prev,
                    meta: [...updatedMeta, { title: 'TecnicalData', tecnical: dataToSave }]
                };
            }
            return {
                ...prev,
                meta: updatedMeta // Remove TecnicalData object if the array is empty
            };
        });
    }, [technicalData, setProduct]);


    const handleAddTechnicalData = useCallback(() => {
        setTechnicalData(prev => [...prev, { title: '', data: '' }]);
    }, []);

    const handlePdfDataChange = useCallback((index, field, value, lang = null) => {
        const updatedData = [...pdfData];
        let currentItem = { ...updatedData[index] };

        if (field === 'title') {
            if (mode === 'edit') {
                // In edit mode, update the specific language property of the title object
                currentItem.title = {
                    ...(currentItem.title || {}), // Ensure it's an object, even if starting from string
                    [lang]: value
                };
            } else {
                // In add mode, title is a single string
                currentItem.title = value;
            }
        } else {
            currentItem[field] = value;
        }

        updatedData[index] = currentItem;
        setPdfData(updatedData);

        // Prepare data for saving
        const dataToSave = updatedData.map(item => {
            const savedItem = { ...item };
            if (mode === 'add' && typeof savedItem.title === 'string') {
                // When adding, save as a simple string title
                savedItem.title = savedItem.title;
            } else if (mode === 'edit' && typeof savedItem.title === 'object') {
                // When editing, save as a multi-language object
                savedItem.title = savedItem.title;
            } else if (typeof savedItem.title === 'string' && savedItem.title !== '') {
                // Fallback for consistency: if it's a non-empty string and not in edit mode
                // (e.g., loaded an old string title in view mode), keep it as a string.
                // If it was loaded as a string in 'edit' mode, it will become an object upon first change.
                savedItem.title = savedItem.title;
            }
            // If title is an empty string, or undefined for some reason, don't change it.
            return savedItem;
        });

        setProduct(prev => {
            const updatedMeta = prev.meta.filter(meta => meta.title !== 'PDF');
            if (dataToSave.length > 0) {
                return {
                    ...prev,
                    meta: [...updatedMeta, { title: 'PDF', PDF: dataToSave }]
                };
            }
            return {
                ...prev,
                meta: updatedMeta // Remove PDF object if the array is empty
            };
        });
    }, [pdfData, mode, setProduct]);


    const handleRemovePdfData = useCallback((index) => {
        const updatedData = pdfData.filter((_, i) => i !== index);
        setPdfData(updatedData);

        // Mirror the saving logic from handlePdfDataChange
        const dataToSave = updatedData.map(item => {
            const savedItem = { ...item };
            if (mode === 'add' && typeof savedItem.title === 'string') {
                savedItem.title = savedItem.title;
            } else if (mode === 'edit' && typeof savedItem.title === 'object') {
                savedItem.title = savedItem.title;
            } else if (typeof savedItem.title === 'string' && savedItem.title !== '') {
                savedItem.title = savedItem.title;
            }
            return savedItem;
        });

        setProduct(prev => {
            const updatedMeta = prev.meta.filter(meta => meta.title !== 'PDF');
            if (dataToSave.length > 0) {
                return {
                    ...prev,
                    meta: [...updatedMeta, { title: 'PDF', PDF: dataToSave }]
                };
            }
            return {
                ...prev,
                meta: updatedMeta // Remove PDF object if the array is empty
            };
        });
    }, [pdfData, setProduct, mode]);


    const handleAddPdfData = useCallback(() => {
        // When adding, initialize title as an empty string.
        // It will be converted to a multi-language object if switched to 'edit' mode later.
        setPdfData(prev => [...prev, { title: '', url: '' }]);
    }, []);


    const handleColorChange = useCallback((index, selectedColor) => {
        const updatedData = [...technicalData];
        const currentColors = updatedData[index]?.data || [];
        const newColors = currentColors.includes(selectedColor)
            ? currentColors.filter(c => c !== selectedColor)
            : [...currentColors, selectedColor];

        updatedData[index] = { ...updatedData[index], data: newColors };
        setTechnicalData(updatedData);

        const dataToSave = updatedData.map(item => {
            const savedItem = { ...item };
            if (savedItem.title === 'custom') {
                savedItem.title = savedItem.customTitle || '';
            }
            delete savedItem.customTitle;
            delete savedItem.idForFilter;
            return savedItem;
        });

        setProduct(prev => {
            const updatedMeta = prev.meta.filter(meta => meta.title !== 'TecnicalData');
            if (dataToSave.length > 0) {
                return {
                    ...prev,
                    meta: [...updatedMeta, { title: 'TecnicalData', tecnical: dataToSave }]
                };
            }
            return {
                ...prev,
                meta: updatedMeta
            };
        });
    }, [technicalData, setProduct]);


    const handleMaterialChange = useCallback((index, selectedMaterial) => {
        const updatedData = [...technicalData];
        const currentMaterials = updatedData[index]?.data || [];
        const newMaterials = currentMaterials.includes(selectedMaterial)
            ? currentMaterials.filter(m => m !== selectedMaterial)
            : [...currentMaterials, selectedMaterial];

        updatedData[index] = { ...updatedData[index], data: newMaterials };
        setTechnicalData(updatedData);

        const dataToSave = updatedData.map(item => {
            const savedItem = { ...item };
            if (savedItem.title === 'custom') {
                savedItem.title = savedItem.customTitle || '';
            }
            delete savedItem.customTitle;
            delete savedItem.idForFilter;
            return savedItem;
        });

        setProduct(prev => {
            const updatedMeta = prev.meta.filter(meta => meta.title !== 'TecnicalData');
            if (dataToSave.length > 0) {
                return {
                    ...prev,
                    meta: [...updatedMeta, { title: 'TecnicalData', tecnical: dataToSave }]
                };
            }
            return {
                ...prev,
                meta: updatedMeta
            };
        });
    }, [technicalData, setProduct]);

    const isTechnicalDataCompleted =
        technicalData.length > 0 && technicalData.every(item => item.title && (Array.isArray(item.data) ? item.data.length > 0 : String(item.data || '').length > 0));
    const isPdfDataCompleted = pdfData.length > 0 && pdfData.every(item => {
        // PDF completion check now respects the mode for title type
        const titleCheck = mode === 'edit'
            ? typeof item.title === 'object' && allLanguages.every(lang => item.title?.[lang] && item.title[lang].trim() !== '')
            : (typeof item.title === 'string' && item.title.trim() !== '');
        return titleCheck && item.url && item.url.trim() !== '';
    });

    const completedSectionsCount = [isTechnicalDataCompleted, isPdfDataCompleted].filter(Boolean).length;

    return (
        <div>
            <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        cursor: 'pointer',
                        background: '#f1f1f1',
                        borderBottom: '1px solid #ddd',
                        fontWeight: 'bold'
                    }}
                    onClick={() => setIsExtraInfoOpen(prev => !prev)}
                >
                    <span style={{ marginRight: '10px' }}>
                        {isExtraInfoOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                    <span>Extra Produkt Info</span>
                    <span
                        style={{
                            marginLeft: 'auto',
                            color: completedSectionsCount > 0 ? 'green' : 'black',
                            display: 'flex'
                        }}
                    >
                        {completedSectionsCount >= 1 && <FaCheckCircle />}
                        {completedSectionsCount >= 2 && <FaCheckCircle style={{ marginLeft: '5px' }} />}
                        {completedSectionsCount === 0 && <FaRegCircle />}
                    </span>
                </div>

                {isExtraInfoOpen && (
                    <div style={{ padding: '10px' }}>
                     
                        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    background: '#f1f1f1',
                                    borderBottom: '1px solid #ddd',
                                    fontWeight: 'bold'
                                }}
                                onClick={() => setIsTechnicalDataOpen(prev => !prev)}
                            >
                                <span style={{ marginRight: '10px' }}>
                                    {isTechnicalDataOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </span>
                                <span>Teknisk data</span>
                                <span style={{ marginLeft: 'auto', color: isTechnicalDataCompleted ? 'green' : 'black' }}>
                                    {isTechnicalDataCompleted ? <FaCheckCircle /> : <FaRegCircle />}
                                </span>
                            </div>
                            {isTechnicalDataOpen && (
                                <div style={{ padding: '10px', display: "flex", flexDirection: 'column', gap: "10px" }}>
                                    {technicalData.map((item, index) => (
                                        <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: "10px", alignItems: 'flex-end'}}>
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <label>Titel:</label>
                                            <select
                                                value={item.title}
                                                onChange={(e) => handleTechnicalDataChange(index, 'title', e.target.value)}
                                            >
                                                <option value="">Välj teknisk data</option>
                                                {predefinedTechnicalFields.map((field) => (
                                                    <option key={field.key} value={field.key}>
                                                        {field.value.se} {/* Display the Swedish label for readability */}
                                                    </option>
                                                ))}
                                                <option value="custom">Anpassad</option>
                                            </select>
                                            </div>
                                            {item.title === 'custom' && (
                                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <label>Anpassad titel:</label>
                                                    <input
                                                        type="text"
                                                        value={item.customTitle || ''}
                                                        onChange={(e) => handleTechnicalDataChange(index, 'customTitle', e.target.value)}
                                                        placeholder="Skriv egen titel"
                                                    />
                                                </div>
                                            )}
                                            {item.title === 'material' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <h4>Välj material:</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                                                        {materialOptions.map((material) => (
                                                            <label key={material.value} style={{ cursor: 'pointer' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.data?.includes(material.value)}
                                                                    onChange={() => handleMaterialChange(index, material.value)}
                                                                />
                                                                {material.label}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) :
                                            item.title === 'color' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <label>Färg:</label>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                                        {colorOptions.map((color) => (
                                                            <div
                                                                key={color.value}
                                                                onClick={() => handleColorChange(index, color.value)}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    padding: '10px',
                                                                    margin: '2px',
                                                                    border: '1px solid #ccc',
                                                                    borderRadius: '5px',
                                                                    background: item.data?.includes(color.value) ? color.value : '#f1f1f1',
                                                                    color: item.data?.includes(color.value) && (color.value === 'black' || color.value === 'blue' || color.value === 'purple' || color.value === 'brown') ? '#fff' : '#000', // Adjust text color for dark backgrounds
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                {item.data?.includes(color.value) && <FaCheck style={{ marginRight: '5px' }} />}
                                                                {color.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                                    <label>Data:</label>
                                                    <input
                                                        type="text"
                                                        value={item.data || ''}
                                                        onChange={(e) => handleTechnicalDataChange(index, 'data', e.target.value)}
                                                        placeholder="Ange data"
                                                    />
                                                </div>
                                            )}
                                            <button type="button" onClick={() => handleRemoveTechnicalData(index)} style={{marginLeft: '10px', background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>
                                                <FaTrash /> Ta bort
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddTechnicalData} style={{maxWidth: '150px'}}>
                                        Lägg till data
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    background: '#f1f1f1',
                                    borderBottom: '1px solid #ddd',
                                    fontWeight: 'bold'
                                }}
                                onClick={() => setIsPdfDataOpen(prev => !prev)}
                            >
                                <span style={{ marginRight: '10px' }}>
                                    {isPdfDataOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </span>
                                <span>PDF Data</span>
                                <span style={{ marginLeft: 'auto', color: isPdfDataCompleted ? 'green' : 'black' }}>
                                    {isPdfDataCompleted ? <FaCheckCircle /> : <FaRegCircle />}
                                </span>
                            </div>
                            {isPdfDataOpen && (
                                <div style={{ padding: '10px' }}>
                                    {pdfData.map((item, index) => (
                                        <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: "10px", alignItems: 'flex-end'}}>
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <label>Titel:</label>
                                                {mode === 'edit' ? (
                                                    // EDIT MODE: Display and handle multi-language titles
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        {allLanguages.map(lang => (
                                                            <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <span style={{ fontWeight: 'bold', fontSize: '0.8em', minWidth: '25px', textAlign: 'right' }}>{lang.toUpperCase()}:</span>
                                                                <input
                                                                    type="text"
                                                                    value={item.title?.[lang] || ''}
                                                                    onChange={(e) => handlePdfDataChange(index, 'title', e.target.value, lang)}
                                                                    placeholder={`${languageLabels[lang]} titel`}
                                                                    style={{ flex: 1, padding: '5px' }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    // ADD MODE: Display and handle a single string title
                                                    <input
                                                        type="text"
                                                        value={typeof item.title === 'string' ? item.title : ''}
                                                        onChange={(e) => handlePdfDataChange(index, 'title', e.target.value)}
                                                        placeholder={`Titel (${languageLabels[allLanguages[0]]})`}
                                                        style={{ width: '100%', padding: '5px' }}
                                                    />
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <label>URL:</label>
                                                <input
                                                    type="text"
                                                    value={item.url || ''}
                                                    onChange={(e) => handlePdfDataChange(index, 'url', e.target.value)}
                                                    placeholder="Ange URL"
                                                />
                                            </div>
                                            <button type="button" onClick={() => handleRemovePdfData(index)} style={{marginLeft: '10px', background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>
                                                <FaTrash /> Ta bort
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddPdfData}>
                                        Lägg till PDF Data
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Meta;