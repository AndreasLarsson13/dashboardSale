// src/components/PriceCalculatorModal.js
import React, { useState, useEffect } from 'react';

const PriceCalculatorModal = ({ isOpen, onClose, product, setProduct, currentCurrency }) => {
    // Stat för input-fälten i modalen
    const [priceIncVatInput, setPriceIncVatInput] = useState('');
    const [vatRateInput, setVatRateInput] = useState(25); // Standard moms på 25%
    const [calculatedPriceExVat, setCalculatedPriceExVat] = useState('');
    const [calculatedVatAmount, setCalculatedVatAmount] = useState('');

    const [percentageDeductionInput, setPercentageDeductionInput] = useState('');
    const [originalBuyingPrice, setOriginalBuyingPrice] = useState(product.buying_price?.value || '');
    const [calculatedBuyingPrice, setCalculatedBuyingPrice] = useState('');

    // Återställ state när modalen öppnas/stängs
    useEffect(() => {
        if (isOpen) {
            setPriceIncVatInput('');
            setVatRateInput(25);
            setCalculatedPriceExVat('');
            setCalculatedVatAmount('');
            setPercentageDeductionInput('');
            setOriginalBuyingPrice(product.buying_price?.value || '');
            setCalculatedBuyingPrice('');
        }
    }, [isOpen, product.buying_price?.value]);

    // Beräkna exklusive moms när input ändras
    const calculateExVat = () => {
        const incVat = parseFloat(priceIncVatInput);
        const vatRate = parseFloat(vatRateInput);

        if (isNaN(incVat) || isNaN(vatRate) || vatRate < 0) {
            setCalculatedPriceExVat('');
            setCalculatedVatAmount('');
            return;
        }

        const priceExVat = incVat / (1 + vatRate / 100);
        const vatAmount = incVat - priceExVat;
        setCalculatedPriceExVat(priceExVat.toFixed(2));
        setCalculatedVatAmount(vatAmount.toFixed(2));
    };

    // Beräkna inköpspris med procentavdrag
    const calculateDeductedBuyingPrice = () => {
        const originalPrice = parseFloat(originalBuyingPrice);
        const deductionPercent = parseFloat(percentageDeductionInput);

        if (isNaN(originalPrice) || isNaN(deductionPercent) || deductionPercent < 0 || deductionPercent > 100) {
            setCalculatedBuyingPrice('');
            return;
        }
        const deductedPrice = originalPrice * (1 - deductionPercent / 100);
        setCalculatedBuyingPrice(deductedPrice.toFixed(2));
    };

    // Använd beräknat pris
    const applyPriceToProductPrice = (e) => {
        e.preventDefault()
        if (calculatedPriceExVat !== '') {
            setProduct(prev => ({
                ...prev,
                price: {
                    ...prev.price,
                    value: parseFloat(calculatedPriceExVat),
                    currency: currentCurrency,
                },
            }));
            // onClose(); // <-- REMOVED THIS LINE
        }
    };

    const applyPriceToBuyingPrice = (e) => {
        e.preventDefault()
        if (calculatedBuyingPrice !== '') {
            setProduct(prev => ({
                ...prev,
                buying_price: {
                    ...prev.buying_price,
                    value: parseFloat(calculatedBuyingPrice),
                    currency: currentCurrency,
                },
            }));
            // onClose(); // <-- REMOVED THIS LINE
        }
    };


    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                width: 'clamp(300px, 80vw, 600px)',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
            }}>
                <h3 style={{ margin: '0 0 15px', fontSize: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    Priskalkylator
                </h3>

                {/* Momsberäkning */}
                <div>
                    <h4 style={{ margin: '0 0 10px', color: '#333' }}>Beräkna pris exklusive moms</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Pris inkl. moms ({currentCurrency}):</label>
                            <input
                                type="number"
                                value={priceIncVatInput}
                                onChange={(e) => setPriceIncVatInput(e.target.value)}
                                onKeyUp={calculateExVat}
                                placeholder="T.ex. 125"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Momssats (%):</label>
                            <input
                                type="number"
                                value={vatRateInput}
                                onChange={(e) => setVatRateInput(e.target.value)}
                                onKeyUp={calculateExVat}
                                placeholder="T.ex. 25"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                    {calculatedPriceExVat && (
                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #eee' }}>
                            <p style={{ margin: '5px 0' }}>Pris exkl. moms: <strong>{calculatedPriceExVat} {currentCurrency}</strong></p>
                            <p style={{ margin: '5px 0' }}>Momsbelopp: <strong>{calculatedVatAmount} {currentCurrency}</strong></p>
                            <button
                                onClick={applyPriceToProductPrice}
                                style={{
                                    marginTop: '15px',
                                    padding: '10px 15px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '1em',
                                }}
                            >
                                Använd som Kundpris
                            </button>
                        </div>
                    )}
                </div>

                {/* Procentavdrag för inköpspris */}
                <div>
                    <h4 style={{ margin: '0 0 10px', color: '#333' }}>Beräkna inköpspris med procentavdrag</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Inköpspris (nuvarande):</label>
                            <input
                                type="number"
                                value={originalBuyingPrice}
                                onChange={(e) => {
                                    setOriginalBuyingPrice(e.target.value);
                                    setCalculatedBuyingPrice('');
                                }}
                                onKeyUp={calculateDeductedBuyingPrice}
                                placeholder="T.ex. 80"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Procentavdrag (%):</label>
                            <input
                                type="number"
                                value={percentageDeductionInput}
                                onChange={(e) => setPercentageDeductionInput(e.target.value)}
                                onKeyUp={calculateDeductedBuyingPrice}
                                placeholder="T.ex. 10"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                    {calculatedBuyingPrice && (
                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #eee' }}>
                            <p style={{ margin: '5px 0' }}>Beräknat inköpspris: <strong>{calculatedBuyingPrice} {currentCurrency}</strong></p>
                            <button
                                onClick={applyPriceToBuyingPrice}
                                style={{
                                    marginTop: '15px',
                                    padding: '10px 15px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '1em',
                                }}
                            >
                                Använd som Inköpspris
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                    }}
                >
                    Stäng
                </button>
            </div>
        </div>
    );
};

export default PriceCalculatorModal;