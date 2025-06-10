// components/FormElements/ShippingAndSalesCountries.jsx
import React from 'react';

const ShippingAndSalesCountries = ({
  currencyOptions,
  shippingCurrency,
  handleShippingCurrencyChange,
  countryOptions,
  sellInCountries, // Detta är det objekt som kommer från GeneralInfo
  handleCountryCheckboxChange,
  handleShippingCostChange,
  handleDeliveryTimeChange,
}) => {
  return (
    <div style={{ padding: '10px', backgroundColor: '#eaeaea' }}>
      {/* Valuta för frakt */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Valuta för frakt:</label>
        <select
          value={shippingCurrency} // Använder värdet från props
          onChange={handleShippingCurrencyChange}
          style={{ width: '226px', fontSize: '19px', height: '28px' }}
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      {/* Vilka länder får den säljas */}
      <div>
        <label style={{ display: 'block', marginBottom: '10px' }}>Vilka länder får den säljas?</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {countryOptions.map((country) => {
            // Kontrollerar om landet finns som en nyckel i sellInCountries-objektet
            const isSelected = sellInCountries.hasOwnProperty(country);
            return (
              <div key={country} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    value={country}
                    checked={isSelected} // 'checked' styrs av om landet finns i sellInCountries-objektet
                    onChange={handleCountryCheckboxChange}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <strong>{country}</strong>
                </label>
                {isSelected && (
                  <div style={{ marginLeft: '25px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <div style={{display: 'flex', gap: '20px'}}><input
                      type="number"
                      placeholder={`Fraktpris för ${country}`}
                      // Hämtar värdet från sellInCountries[country].shippingCost
                      // Använder optional chaining (?.) för att undvika fel om sellInCountries[country] är undefined
                      // Använder || '' för att visa tom sträng om värdet är null, undefined eller 0 (beroende på preferens)
                      value={sellInCountries[country]?.shippingCost ?? ''} 
                      onChange={(e) => handleShippingCostChange(e, country)}
                      style={{ padding: '5px', fontSize: '16px' }}
                    /><span>Valuta : {sellInCountries[country]?.currency}</span></div>
                    <input
                      type="number"
                      placeholder={`Leveranstid (dagar) för ${country}`}
                      // Hämtar värdet från sellInCountries[country].deliveryTime
                      value={sellInCountries[country]?.deliveryTime ?? ''}
                      onChange={(e) => handleDeliveryTimeChange(e, country)}
                      style={{ width: 'calc(100% - 10px)', padding: '5px', fontSize: '16px' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShippingAndSalesCountries;