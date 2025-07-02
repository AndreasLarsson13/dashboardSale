import React, { useState, useEffect } from 'react';

export default function LabeledInput({
  label,
  name,
  value,
  onChange,
  required = false,
  width = '226px',
  type = 'text',
  min, // Pass through 'min'
  max, // Add 'max' as a prop (useful for percentages, etc.)
  readOnly, // Add 'readOnly' as a prop
  inputStyle, // Add 'inputStyle' to allow custom styles on the input element
  ...props // Capture any other props
}) {
  // Use a local state to manage the string displayed in the input field.
  // This allows us to format with a comma for display while storing a number with a dot internally.
  const [displayValue, setDisplayValue] = useState('');

  // Update displayValue whenever the 'value' prop changes.
  // This ensures the input reflects the parent component's state correctly,
  // and formats numbers with a comma for the user.
  useEffect(() => {
    if (type === 'number') {
      // If the value is a number, format it with a comma for display.
      // Handle null/undefined values by showing an empty string.
      if (value !== undefined && value !== null && !isNaN(value)) {
        // Convert to string, replace dot with comma for display
        setDisplayValue(String(value).replace(/\./g, ','));
      } else {
        setDisplayValue('');
      }
    } else {
      // For non-number types, use the value directly.
      setDisplayValue(value || '');
    }
  }, [value, type]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    let processedValue = rawValue;

    if (type === 'number') {
      // Replace all commas with dots for internal numeric parsing.
      processedValue = rawValue.replace(/,/g, '.');

      // Update the local display state immediately to show what the user typed (including commas).
      setDisplayValue(rawValue);

      // Parse the processed value to a float. If it's not a valid number (e.g., just '-', or empty),
      // pass an empty string or 0 to the parent's onChange depending on desired behavior.
      // Here, we'll pass a parsed number or null if it's completely empty/invalid,
      // letting the parent decide how to handle it.
      const parsedNum = parseFloat(processedValue);

      // Call the parent's onChange with a synthetic event object.
      // Ensure the value passed to the parent is a proper number or null/undefined if empty/invalid.
      onChange({
        target: {
          name: name,
          value: isNaN(parsedNum) || rawValue.trim() === '-' ? null : parsedNum, // Pass null for invalid numbers or just '-'
          type: 'number', // Keep original type for parent's logic if it relies on it
        },
      });
    } else {
      // For non-number types, just pass the original event to the parent.
      setDisplayValue(rawValue);
      onChange(e);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
      <label htmlFor={name} style={{ flexShrink: 0 }}>{label}:</label> {/* Added flexShrink to label */}
      <input
        type={type === 'number' ? 'text' : type} // Use 'text' for number inputs to allow custom comma handling
        name={name}
        id={name} // Set id to link to label for accessibility
        value={displayValue} // Bind to local state for comma handling
        onChange={handleChange} // Use our custom handler
        required={required}
        readOnly={readOnly} // Pass readOnly prop
        min={min} // Pass min prop
        max={max} // Pass max prop
        step={type === 'number' ? "any" : undefined} // Allow decimals if type is number
        style={{
          width,
          fontSize: '19px',
          height: '28px',
          padding: '4px 8px', // Added padding for better appearance
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box', // Include padding in width calculation
          textAlign: type === 'number' ? 'right' : 'left', // Dynamisk textjustering
          ...(readOnly && { backgroundColor: '#f0f0f0', cursor: 'not-allowed' }), // Style read-only
          ...inputStyle // Apply custom input styles if provided
        }}
        {...props} // Pass any other HTML input attributes
      />
    </div>
  );
}