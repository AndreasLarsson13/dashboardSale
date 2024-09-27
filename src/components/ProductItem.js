import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ProductItem = ({ product, onDelete }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [showFullDescription, setShowFullDescription] = useState(false); // State to toggle description

  const handleDelete = () => {
    onDelete(product._id); // Call the onDelete function with the product id
  };

  const handleEdit = () => {
    navigate(`/edit-product/${product._id}`); // Navigate to the edit-product page with the product id
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription); // Toggle description on click
  };

  // Function to truncate plain text from HTML content
  const truncateHtml = (htmlString, maxLength) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
  };

  return (
    <div
      className="product-card"
      style={{
        backgroundColor: product.status === "pending" ? "#ffe6e6" : "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "20px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s ease-in-out",
        maxWidth: "1400px",
        width: "95%",
        margin: "auto"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <h2 style={{ color: "#333", marginBottom: "10px" }}>
          {product.name} - {product.status === "accepted" ? "Godkänd" : "Väntar på granskning"}
        </h2>
        <p><strong style={{ color: "#333", fontSize: "18px" }}>€{product.price}</strong></p>
      </div>

      <p
        style={{ color: "#555", fontSize: "14px", marginBottom: "15px", cursor: "pointer" }}
        onClick={toggleDescription}
      >
        {showFullDescription ? (
          // Render full HTML description if toggled
          <span dangerouslySetInnerHTML={{ __html: product.description.se }} />
        ) : (
          // Render truncated HTML description
          <span
            dangerouslySetInnerHTML={{
              __html: truncateHtml(product.description.se, 200),
            }}
          />
        )}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handleDelete}
          style={{
            backgroundColor: "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Ta bort
        </button>
         {/* <button
          onClick={handleEdit}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Edit
        </button> */} 
      </div>
    </div>
  );
};

export default ProductItem;
