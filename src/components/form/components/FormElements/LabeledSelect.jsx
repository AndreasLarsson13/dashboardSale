// LabeledSelect.jsx
import React from 'react';

function LabeledSelect({
  label,
  name,
  value,
  onChange,
  options, // Detta kommer att vara en array med alternativ
  optionLabels, // Detta kommer att vara ett objekt för att mappa koder till etiketter
  required = false,
  width = '226px',
}) {
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
      <label htmlFor={name}>{label}:</label>
      <select
        name={name}
        id={name} // Koppla id till label
        value={value}
        onChange={onChange}
        required={required}
        style={{ width, fontSize: '19px', height: '28px' }} // Standardiserar storlek likt LabeledInput
      >
        {options.map((optionValue) => (
          <option key={optionValue} value={optionValue}>
            {optionLabels[optionValue] || optionValue} {/* Använd etikett eller fallback till värde */}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LabeledSelect;