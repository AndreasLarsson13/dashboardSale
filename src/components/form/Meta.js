import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaRegCircle, FaCheck, FaTrash } from 'react-icons/fa';

const Meta = ({ product, setProduct }) => {
  const [isExtraInfoOpen, setIsExtraInfoOpen] = useState(false);
  const [isTechnicalDataOpen, setIsTechnicalDataOpen] = useState(false);
  const [isPdfDataOpen, setIsPdfDataOpen] = useState(false);

  const predefinedTechnicalFields = [
    { value: 'height', label: 'Höjd (mm)' },
    { value: 'weight', label: 'Nettovikt (g)' },
    { value: 'width', label: 'Bredd (mm)' },
    { value: 'depth', label: 'Djup (mm)' },
    { value: 'vedlängd', label: 'Maximal vedlängd (cm)' },
    { value: 'effekt', label: 'Effekt (W)' },
    { value: 'color', label: 'Färg' },
    { value: 'uppvärmningsyta', label: 'Maximal uppvärmningsyta (m²)' },
    { value: 'skorstensanslutning', label: 'Skorstensanslutning' },
    { value: 'skorstensanslutningValue', label: 'Upptill, Bak' },
    { value: 'verkningsgrad', label: 'Verkningsgrad (%)' },
    { value: 'gasconsumption', label: 'Gaskonsumtion' },
    { value: 'preheatingtime', label: 'Förvärmningstid' },
    { value: 'floor', label: 'Bakyta' },
    { value: 'custom', label: 'Anpassad' }, // Custom option
  ];

  const colorOptions = [
    { label: "Vit", value: "white" },
    { label: "Röd", value: "red" },
    { label: "Grön", value: "green" },
    { label: "Blå", value: "blue" },
    { label: "Gul", value: "yellow" },
    { label: "Lila", value: "purple" },
    { label: "Cyan", value: "cyan" },
    { label: "Magenta", value: "magenta" },
    { label: "Orange", value: "orange" },
    { label: "Brun", value: "brown" },
    { label: "Rosa", value: "pink" },
    { label: "Matt Svart", value: "matte black" },
    { label: "Krom", value: "chrome" },
    { label: "Mässing", value: "brass" },
    { label: "Koppar", value: "copper" },
    { label: "Brons", value: "bronze" },
    { label: "Svart Krom", value: "black chrome" },
    { label: "Honungsguld", value: "honey gold" },
    { label: "Borstad Svart Krom", value: "brushed black chrome" },
    { label: "Borstad Honungsguld", value: "brushed honey gold" },
    { label: "Borstad Nickel", value: "brushed nickel" },
    { label: "Ascot Grå", value: "ascot grey" },
    { label: "Grafit", value: "graphite" },
    { label: "Svart", value: "black" }
  ];

  const [technicalData, setTechnicalData] = useState(() =>
    product.meta.find(meta => meta.title === 'TecnicalData')?.tecnical || []
  );
  const [pdfData, setPdfData] = useState(() =>
    product.meta.find(meta => meta.title === 'PDF')?.PDF || []
  );

  useEffect(() => {
    setTechnicalData(product.meta.find(meta => meta.title === 'TecnicalData')?.tecnical || []);
    setPdfData(product.meta.find(meta => meta.title === 'PDF')?.PDF || []);
  }, [product.meta]);

  const handleTechnicalDataChange = (index, field, value) => {
    const updatedData = [...technicalData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setTechnicalData(updatedData);
    setProduct(prev => ({
      ...prev,
      meta: [
        ...prev.meta.filter(meta => meta.title !== 'TecnicalData'),
        { title: 'TecnicalData', tecnical: updatedData }
      ]
    }));
  };

  const handleRemoveTechnicalData = (index) => {
    const updatedData = technicalData.filter((_, i) => i !== index);
    setTechnicalData(updatedData);
    setProduct(prev => ({
      ...prev,
      meta: [
        ...prev.meta.filter(meta => meta.title !== 'TecnicalData'),
        { title: 'TecnicalData', tecnical: updatedData }
      ]
    }));
  };

  const handleAddTechnicalData = () => {
    setTechnicalData([...technicalData, { title: '', data: [] }]);
  };

  const handlePdfDataChange = (e, index, field) => {
    const updatedData = [...pdfData];
    updatedData[index] = { ...updatedData[index], [field]: e.target.value };
    setPdfData(updatedData);
    setProduct(prev => ({
      ...prev,
      meta: [
        ...prev.meta.filter(meta => meta.title !== 'PDF'),
        { title: 'PDF', PDF: updatedData }
      ]
    }));
  };

  const handleRemovePdfData = (index) => {
    const updatedData = pdfData.filter((_, i) => i !== index);
    setPdfData(updatedData);
    setProduct(prev => ({
      ...prev,
      meta: [
        ...prev.meta.filter(meta => meta.title !== 'PDF'),
        { title: 'PDF', PDF: updatedData }
      ]
    }));
  };

  const handleAddPdfData = () => {
    setPdfData([...pdfData, { title: '', url: '' }]);
  };

  const handleColorChange = (index, selectedColor) => {
    const updatedData = [...technicalData];
    const currentColors = updatedData[index]?.data || [];
    const colorIndex = currentColors.indexOf(selectedColor);

    if (colorIndex > -1) {
      currentColors.splice(colorIndex, 1);
    } else {
      currentColors.push(selectedColor);
    }

    updatedData[index] = { ...updatedData[index], data: currentColors };
    setTechnicalData(updatedData);
    setProduct(prev => ({
      ...prev,
      meta: [
        ...prev.meta.filter(meta => meta.title !== 'TecnicalData'),
        { title: 'TecnicalData', tecnical: updatedData }
      ]
    }));
  };

  const isTechnicalDataCompleted =
    technicalData.length > 0 && technicalData.every(item => item.title && item.data.length > 0);
  const isPdfDataCompleted = pdfData.length > 0 && pdfData.every(item => item.title && item.url);

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
            {/* Technical Data Section */}
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
                    <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: "10px"}}>
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                      <label>Titel:</label>
                      <select
                        value={item.title}
                        onChange={(e) => handleTechnicalDataChange(index, 'title', e.target.value)}
                      >
                        <option value="">Välj teknisk data</option>
                        {predefinedTechnicalFields.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
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

                      {item.title === 'color' ? (
                        <>
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
                                  background: item.data.includes(color.value) ? color.value : '#f1f1f1',
                                  color: item.data.includes(color.value) ? '#fff' : '#000',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {item.data.includes(color.value) && <FaCheck />}
                                {color.label}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                          <label>Data:</label>
                          <input
                            type="text"
                            value={item.data}
                            onChange={(e) => handleTechnicalDataChange(index, 'data', e.target.value)}
                            placeholder="Enter data"
                          />
                        </div>
                      )}
                      <button type="button" onClick={() => handleRemoveTechnicalData(index)} style={{marginLeft: '10px', background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>
                        <FaTrash /> Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddTechnicalData} style={{maxWidth: '150px'}}>
                    Lägg till data
                  </button>
                </div>
                
              )}
            </div>

            {/* PDF Data Section */}
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
                    <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: "10px"}}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label>Titel:</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handlePdfDataChange(e, index, 'title')}
                        placeholder="Enter title"
                      />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label>URL:</label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => handlePdfDataChange(e, index, 'url')}
                        placeholder="Enter URL"
                      />
                      </div>
                      <button type="button" onClick={() => handleRemovePdfData(index)} style={{marginLeft: '10px', background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>
                        <FaTrash /> Remove
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
