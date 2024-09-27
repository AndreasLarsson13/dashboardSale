import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './ProductReview.css'; // Importera CSS för styling

const ReviewProductsPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isApproving, setIsApproving] = useState(false); // För att hantera godkännande-laddning
  const [isComparing, setIsComparing] = useState(false); // För att hantera jämförelse-laddning
  const [differences, setDifferences] = useState({}); // För att lagra skillnaderna
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    const checkAdmin = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          if (idTokenResult.claims.admin) {
            setIsAdmin(true);
          } else {
            navigate('/'); // Om inte admin, navigera till startsidan
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setError('Error checking admin status');
        }
      } else {
        navigate('/login'); // Om användaren inte är inloggad, navigera till inloggningssidan
      }
      setLoading(false); // Laddningen är klar efter admin-kontroll
    };

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingProducts(); // Hämta produkter endast om användaren är admin
    }
  }, [isAdmin]);

  const fetchPendingProducts = async () => {
    try {
      const response = await fetch('http://localhost:4011/pendingProducts');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Failed to fetch products.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products.');
    }
  };

  const compareProduct = async (product) => {
    setIsComparing(true);
    try {
      const response = await fetch('http://localhost:4011/compareProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const data = await response.json();
        setDifferences((prevDifferences) => ({
          ...prevDifferences,
          [product._id]: data.differences,
        }));
      } else {
        console.error('Failed to compare products');
      }
    } catch (error) {
      console.error('Error comparing product:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const handleApprove = async (product) => {
    const confirmApprove = window.confirm('Are you sure you want to approve this product?');
    if (!confirmApprove) return;

    setIsApproving(true);
    try {
      const response = await fetch('http://localhost:4011/addproducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product), // Skicka produkten till backend
      });

      if (response.ok) {
        alert('Product approved and added!');
        setProducts(products.filter((p) => p._id !== product._id)); // Ta bort den från listan
      } else {
        console.error('Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = (productId) => {
    const confirmReject = window.confirm('Are you sure you want to reject this product?');
    if (!confirmReject) return;

    setProducts(products.filter((p) => p._id !== productId)); // Ta bort från listan vid avslag
    alert('Product rejected');
  };

  const getComparisonField = (field, originalValue, newValue) => {
    return (
      <p key={field}>
        <strong>{field}:</strong>{' '}
        <span style={{ textDecoration: 'line-through', color: 'red' }}>
          {originalValue}
        </span>
        {' → '}
        <span>{newValue}</span>
      </p>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="review-products-page">
      <h2>Produkter till granskning</h2>
      {products.length > 0 ? (
        <div className="product-list">
          {products.map((product) => (
            <div className="product-horizontal-card" key={product._id}>
              <div className="product-horizontal-image">
                <img src={product.image.thumbnail || '/placeholder.jpg'} alt={product.name} />
              </div>
              <div className="product-horizontal-info">
                <h3>{product.name}</h3>
                <p><strong>Brand:</strong> {product.brand}</p>
                <p><strong>Price:</strong> {product.price} €</p>
                <p><strong>Sale Price:</strong> {product.sale_price} €</p>
                <p><strong>SKU:</strong> {product.sku}</p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <p><strong>Status:</strong> {product.status}</p>
                <p><strong>Description:</strong> {product.description?.se || 'No description available'}</p>
                <p><strong>Dimensions:</strong> {product.lengthPack} x {product.widthPack} x {product.heightPack} mm</p>

                {/* Visa skillnader om de finns */}
                {differences[product._id] && (
                  <div className="product-differences">
                    <h4>Differences:</h4>
                    {Object.keys(differences[product._id]).map((field) =>
                      getComparisonField(
                        field,
                        differences[product._id][field].oldValue,
                        differences[product._id][field].newValue
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="product-horizontal-actions">
                <button className="compare-button" onClick={() => compareProduct(product)} disabled={isComparing}>
                  {isComparing ? 'Comparing...' : 'Compare'}
                </button>
                <button className="approve-button" onClick={() => handleApprove(product)} disabled={isApproving}>
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
                <button className="reject-button" onClick={() => handleReject(product._id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Inga produkter till gransking</p>
      )}
    </div>
  );
};

export default ReviewProductsPage;
