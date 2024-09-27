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
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken(); // Få användarens ID-token
      
        const response = await axios.get('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/products', {
          headers: {
            Authorization: `Bearer ${token}`, // Skicka token i header
          },
          params: {
            uid: user.uid, // Valfritt: skicka uid som query parameter
            uidEmail: user.email, // Valfritt: skicka e-post om det behövs
          },
          withCredentials: true // Lägg till detta om servern kräver autentiserade förfrågningar
        });
      
        console.log(response.data);
      } 
      catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('User not logged in');
        return;
      }

      const token = await user.getIdToken(); // Get the user's ID token

      await axios.delete(`http://localhost:8080/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the header
        },
      });

      // Update the product list after deletion
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      setError('Error deleting the product');
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default ProductList;
