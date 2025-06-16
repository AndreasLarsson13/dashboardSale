// components/VariationSelector.js
import React from 'react';

const variationOptions = {
  färg: { se: 'färg', fi: 'väri', en: 'color' },
  storlek: { se: 'storlek', fi: 'koko', en: 'size' },
  material: { se: 'material', fi: 'materiaali', en: 'material' },
  variationer: { se: 'variationer', fi: 'vaihtoehdot', en: 'variations' },
  version: { se: 'version', fi: 'versio', en: 'version' },
  detaljer: { se: 'detaljer', fi: 'tiedot', en: 'details' }
};

const VariationSelector = ({ accessory, onChange, message }) => {
  return (
    <div>
      <h2>Lägg till variation</h2>
      {message && <p>{message}</p>}

      <div style={{ display: 'flex', gap: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
            <label htmlFor="type">Välj tillbehör (Gruppnamn för kunden):</label>
            <select
              name="type"
              id="type"
              value={accessory.type}
              onChange={onChange}
              required
              style={{ flexGrow: 1 }}
            >
              <option value="">Typ av variation (Namn på gruppering)</option>
              <option value="färg">Färg</option>
              <option value="storlek">Storlek</option>
              <option value="material">Material</option>
              <option value="variationer">Variation</option>
              <option value="version">Version</option>
              <option value="detaljer">Eget gruppnamn</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariationSelector;
