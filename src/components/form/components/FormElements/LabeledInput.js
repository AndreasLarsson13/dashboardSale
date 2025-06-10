/* import React from 'react';

export default function LabeledInput({ label, name, value, onChange, required = false, width = '226px', type = 'text' }) {
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
      <label>{label}:</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{ width }}
      />
    </div>
  );
}
 */

import React from 'react';

export default function LabeledInput({
  label,
  name,
  value,
  onChange,
  required = false,
  width = '226px',
  type = 'text',
  min, // Lägg till 'min' som en prop
}) {
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
      <label htmlFor={name}>{label}:</label> {/* Lade till htmlFor för bättre tillgänglighet */}
      <input
        type={type}
        name={name}
        id={name} // Sätt id för att koppla till label
        value={value} // Se till att value alltid är satt, även för nummerfält
        onChange={onChange}
        required={required}
        style={{
          width,
          fontSize: '19px',
          height: '28px',
          textAlign: type === 'number' ? 'right' : 'left', // Dynamisk textjustering
        }}
        min={min} // Skicka vidare min-propen
      />
    </div>
  );
}