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
        const token = await user.getIdToken(); // Get the user's ID token

        const response = await axios.get('http://localhost:4011/products', {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the header
          },
          params: {
            uid: user.uid, // Optional: you can send the uid as a query parameter if needed
            uidEmail: user.email, // Optional: you can send the email if needed
          },
        });

        setProducts(response.data);
      } catch (error) {
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

      await axios.delete(`http://localhost:4011/products/${id}`, {
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
