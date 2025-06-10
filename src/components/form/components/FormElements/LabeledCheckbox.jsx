import React from 'react';

const LabeledCheckbox = ({ label, name, checked, onChange }) => (
  <div style={{ display: 'flex', gap: '10px' }}>
    <label>{label}</label>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      style={{ width: '20px', height: '20px' }}
    />
  </div>
);

export default LabeledCheckbox;
