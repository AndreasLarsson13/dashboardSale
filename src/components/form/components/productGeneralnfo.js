import React, { useState } from 'react';
import LabeledInput from './FormElements/LabeledInput';
import LabeledSelect from './FormElements/LabeledSelect';
import LabeledCheckbox from './FormElements/LabeledCheckbox';

const ProductForm = ({ brands, currencyOptions }) => {
  const [product, setProduct] = useState({
    name: '',
    sku: '',
    quantity: 0,
    price: 0,
    brand: '',
    currency: '',
    isProductOption: false,
    hideProductFromView: false,
    supplierArticleNumber: '',
    buying_price: 0,
    sale_price: 0,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCurrencyChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      currency: e.target.value,
    }));
  };

  return (
    <form>
      <LabeledInput label="Namn:" name="name" onChange={handleInputChange} value={product.name} required />
      <LabeledSelect
        label="Orginal valuta på produkt:"
        name="currency"
        value={product.currency}
        onChange={handleCurrencyChange}
        options={currencyOptions}
        required
      />
      <LabeledInput
        label="Antal produkter i lager:"
        name="quantity"
        type="number"
        onChange={handleInputChange}
        value={product.quantity}
        min={0}
        required
      />
      <LabeledSelect
        label="Varumärke:"
        name="brand"
        value={product.brand}
        onChange={handleInputChange}
        options={brands.map(b => ({ value: b.slug, label: b.name }))}
        required
      />
      <LabeledInput
        label="Pris:"
        name="price"
        type="number"
        onChange={handleInputChange}
        value={product.price}
        min={0}
        required
      />
      <LabeledCheckbox
        label="Är detta ett tillbehör?:"
        name="isProductOption"
        checked={product.isProductOption}
        onChange={handleInputChange}
      />
      {/* Fortsätt med resten på samma sätt */}
    </form>
  );
};

export default ProductForm;
