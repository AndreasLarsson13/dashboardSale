import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddProductPage from './pages/AddProductPage';
import ProductListPage from './components/ProductList';
import EditProductPage from './pages/editProductPage';
import AddBrand from './pages/AddBrand';
import BrandList from './pages/ListBrand';
import ReviewProductsPage from './pages/ProductReview'; // Import Review Products Page
import Layout from './layout';
import LoginPage from './pages/login'; // Import the login page
import PrivateRoute from './components/privateRoute'; // Import PrivateRoute
import AdminRoute from './components/adminRoute'; // Import AdminRoute (new route for admins)
import AddOptions from './pages/AddOptions'; // Import AdminRoute (new route for admins)
import ListOptions from './pages/listOptions'; // Import AdminRoute (new route for admins)


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} /> {/* Login route */}
          <Route path="/" element={<PrivateRoute element={<ProductListPage />} />} /> {/* Protected route */}
          <Route path="/add-product" element={<PrivateRoute element={<AddProductPage />} />} /> {/* Protected route */}
          <Route path="/edit-product/:id" element={<PrivateRoute element={<EditProductPage />} />} /> {/* Protected route */}
          <Route path="/add-brand" element={<PrivateRoute element={<AddBrand />} />} /> {/* Protected route */}
          <Route path="/list-brand" element={<PrivateRoute element={<BrandList />} />} /> {/* Protected route */}
          {/* Admin-only route */}
          <Route path="/review-products" element={<AdminRoute element={<ReviewProductsPage />} />} /> {/* Protected route for admins */}

          <Route path="/add-option" element={<PrivateRoute element={<AddOptions />} />} /> {/* Protected route */}
          <Route path="/list-option" element={<PrivateRoute element={<ListOptions />} />} /> {/* Protected route */}

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
