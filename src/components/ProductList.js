import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth'; // Import Firebase auth
import ProductItem from './ProductItem';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
  
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
  
      try {
        // Get Firebase ID token
        const token = await user.getIdToken();
  
        // Make the GET request to fetch products http://localhost:8088   https://serverkundportal-dot-natbutiken.lm.r.appspot.com
        const response = await axios.get('http://localhost:8088/products', {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          },
          params: {
            uid: user.uid, // Optional: Pass user UID as query parameter
            uidEmail: user.email, // Optional: Pass user email as query parameter
          },
        });
  
        // Update products state
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error.response || error.message);
        setError(error.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);
  

  const handleDelete = async (id) => {
     const confirmed = window.confirm('Är du säker på att du vill ta bort produkten?');

  if (!confirmed) return;
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('User not logged in');
        return;
      }

      const token = await user.getIdToken(); // Get the user's ID token

      await axios.delete(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the header
        },
      });

      // Update the product list after deletion
      setProducts(products.filter((product) => product._id !== id));
       alert('Produkten togs bort!');
  
    } catch (error) {
      setError('Error deleting the product');
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="product-list">
      {products && products.map((product) => (
        <ProductItem key={product.id} product={product} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default ProductList;
