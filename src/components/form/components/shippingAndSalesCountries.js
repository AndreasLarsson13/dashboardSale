import React from 'react';
import LabeledSelect from './FormElements/LabeledSelect';
import LabeledInput from './FormElements/LabeledInput';

const deliveryTypeLabels = {
  home: 'Hemleverans',
  warehouse: 'Lagerleverans',
};

const ShippingAndSalesCountries = ({
  currencyOptions,
  shippingCurrency,
  handleShippingCurrencyChange,
  countryOptions,
  sellInCountries,
  handleCountryCheckboxChange,
  handleShippingCostChange,
  handleDeliveryTimeChange,
  deliveryTimeOptions,
}) => {
  return (
    <div style={{ padding: '10px', marginTop: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
      <h2>Försäljnings- och fraktländer</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: '15px' }}>
        <LabeledSelect
          label="Fraktvaluta"
          name="shippingCurrency"
          value={shippingCurrency}
          onChange={handleShippingCurrencyChange}
          options={currencyOptions}
          optionLabels={Object.fromEntries(currencyOptions.map((opt) => [opt, opt]))}
        />
      </div>

      {countryOptions.map((countryCode) => (
        <div key={countryCode} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>
              <input
                type="checkbox"
                value={countryCode}
                checked={!!sellInCountries[countryCode]}
                onChange={handleCountryCheckboxChange}
                style={{ marginRight: '10px' }}
              />
              {countryCode} - {countryCode === 'SV' ? 'Sverige' : countryCode === 'FI' ? 'Finland' : 'Åland'}
            </label>
          </div>

          {sellInCountries[countryCode] && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.keys(deliveryTypeLabels).map(deliveryType => (
                <div key={deliveryType} style={{ borderLeft: '3px solid #007bff', paddingLeft: '10px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '1em', fontWeight: 'normal' }}>{deliveryTypeLabels[deliveryType]}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                    <LabeledInput
                      label="Fraktkostnad"
                      name={`shippingCost-${countryCode}-${deliveryType}`}
value={sellInCountries[countryCode][deliveryType]?.shippingCost || 0}
                      onChange={(e) => handleShippingCostChange(e, countryCode, deliveryType)}
                      type="number"
                      min="0"
                    />

                    <LabeledSelect
                      label="Leveranstid"
                      name={`deliveryTime-${countryCode}-${deliveryType}`}
                      value={sellInCountries[countryCode][deliveryType]?.deliveryTime ?? ''}
                      onChange={(e) => handleDeliveryTimeChange(e, countryCode, deliveryType)}
                      options={deliveryTimeOptions.map(opt => opt.value)}
                      optionLabels={Object.fromEntries(
                        deliveryTimeOptions.map(opt => [opt.value, opt.label.se])
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShippingAndSalesCountries;
