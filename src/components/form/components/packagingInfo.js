// src/components/form/components/packagingInfo.jsx (Anpassa sökvägen till din fil!)

import React from 'react';

// Denna komponent tar emot 'packaging' objektet och en generell 'onChange' funktion
function PackagingInfo({ packaging, onChange }) {
  // Om packaging är null eller undefined, använd ett tomt objekt som fallback.
  // Detta förhindrar fel om product.packaging inte finns initialt.
  const currentPackaging = packaging || {};

  // Definiera fälten för packningsinformationen
  const fields = [
    { label: 'Vikt (g):', name: 'weightPack' },
    { label: 'Längd (mm):', name: 'lengthPack' },
    { label: 'Bredd (mm):', name: 'widthPack' },
    { label: 'Höjd (mm):', name: 'heightPack' },
  ];

  return (
    <div style={{ padding: '10px', backgroundColor: '#f9f9f9', marginTop: '20px', borderRadius: '5px' }}>
      <h3>Packningsinformation</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', // Anpassar sig bättre till olika skärmstorlekar
        gap: '10px 20px',
        alignItems: 'center',
        flexWrap: 'wrap', // Säkerställer att de radbryter om utrymmet är för litet
      }}>
        {fields.map((field) => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '4px' }}>{field.label}</label>
            <input
              type="number"
              name={field.name}
              onChange={onChange} // Skickar händelsen till förälderns handleInputChange
              required
              // Använd nullish coalescing operator (??) för att visa tom sträng om värdet är null eller undefined.
              // Om värdet är 0, kommer det att visas som 0, vilket är korrekt för numeriska inputfält.
              value={currentPackaging[field.name] ?? 0}
              min="0" // Säkerställ att min-värdet är satt för nummerfält
              style={{
                padding: '6px 8px',
                fontSize: '16px',
                textAlign: 'right',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100%', // Fyller upp kolumnen
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PackagingInfo;