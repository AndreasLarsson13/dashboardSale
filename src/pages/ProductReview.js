import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './ProductReview.css'; // Import the CSS for styling

const ReviewProductsPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [differences, setDifferences] = useState({});
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

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
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setError('Error checking admin status');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingProducts();
    }
  }, [isAdmin]);

  const fetchPendingProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/pendingProducts');
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
      const response = await fetch('http://localhost:8080/compareProduct', {
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
      const response = await fetch('http://localhost:8080/addproducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        alert('Produkten är godkännd och tillagd');
        setProducts(products.filter((p) => p._id !== product._id));
      } else {
        console.error('Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (productId) => {
    setShowRejectPopup(true);
    setSelectedProductId(productId);
  };

  const submitReject = async () => {
    const confirmReject = window.confirm('Är du säker att du vill?');
    if (!confirmReject) return;

    try {
      const response = await fetch(`http://localhost:8080/rejectproduct/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: rejectComment, id: selectedProductId, status: "rejected" }),
      });

      if (response.ok) {
        alert('Product rejected and comment added!');
        setProducts(products.filter((p) => p._id !== selectedProductId));
      } else {
        console.error('Failed to reject product');
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
    }

    setShowRejectPopup(false);
    setRejectComment('');
    setSelectedProductId(null);
  };

  const closePopup = () => {
    setShowRejectPopup(false);
    setRejectComment('');
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
                <p><strong>Varumärke:</strong> {product.brand}</p>
                <p><strong>Pris:</strong> {product.price} €</p>
                <p><strong>Försäljningspris:</strong> {product.sale_price} €</p>
                <p><strong>SKU:</strong> {product.sku}</p>
                <p><strong>Antal:</strong> {product.quantity}</p>
                <p><strong>Status:</strong> {product.status}</p>
                <span>
  <strong>Beskrivning:</strong> 
  <span dangerouslySetInnerHTML={{ __html: product.description?.se || 'No description available' }} />
</span>                <p><strong>Packstorlek:</strong> {product.lengthPack} x {product.widthPack} x {product.heightPack} mm</p>

                {differences[product._id] && (
                  <div className="product-differences">
                    <h4>Skillnader:</h4>
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
                  {isComparing ? 'Jämför...' : 'Jämför med tidigare'}
                </button>
                <button className="approve-button" onClick={() => handleApprove(product)} disabled={isApproving}>
                  {isApproving ? 'Godkänns...' : 'Godkänn'}
                </button>
                <button className="reject-button" onClick={() => handleReject(product._id)}>Neka produkt</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Inga produkter till gransking</p>
      )}

      {showRejectPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Kommentera avslag på produkten</h3>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Skriv kommentaren här"
              rows="5"
            />
            <div className="popup-actions">
              <button className="cancel-button" onClick={closePopup}>Avbryt</button>
              <button className="submit-button" onClick={submitReject}>Skicka</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewProductsPage;
