import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductItem = ({ product, onDelete }) => {
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  const handleDelete = () => {
    onDelete(product._id);
  };

  const handleEdit = () => {
    navigate(`/edit-variations/${product._id}`); // Navigera till redigeringssidan
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const truncateHtml = (htmlString, maxLength) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
  };

  const toggleModal = () => {
    setShowModal(!showModal); // Toggles modal visibility
  };

  function formatPrice(price) {
    if (price < 100) {
      return price.toFixed(2); // Keep two decimals
    }
    return price.toString(); // Return the price as-is if 100 or more
  }

  return (
    <div
      className="product-card"
      style={{
        backgroundColor: product.status === "pending" ? "rgb(255 252 162)" :
        product.status === "rejected" ? "rgb(255 162 162)" :
        "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "20px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s ease-in-out",
        maxWidth: "1400px",
        width: "95%",
        margin: "auto",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ color: "#333", marginBottom: "10px" }}>
         {product.name_parrent} - {product.name} - {product.status === "confirmed" 
            ? "Godkänd" 
            : product.status === "rejected" 
            ? "Avvisad" 
            : "Väntar på granskning"}
        </h2>
        
        {/* Utropstecken-ikon för att visa modal */}
        {product.reviewComment && product.status !== "confirmed" ? <span
          style={{ cursor: "pointer", color: "#ff9900", fontSize: "24px", marginRight: "15px" }}
          onClick={toggleModal}
        >
          &#x2757;
        </span> : ""}
      
        <p><strong style={{ color: "#333", fontSize: "18px" }}>{formatPrice(parseInt(product.price.value))} - Valuta : {product.currency}</strong></p>
      </div>

      <p
        style={{ color: "#555", fontSize: "14px", marginBottom: "15px", cursor: "pointer" }}
        onClick={toggleDescription}
      >
        {showFullDescription ? (
          <span dangerouslySetInnerHTML={{ __html: product.description.se }} />
        ) : (
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
         className="reject-button"
        >
          Ta bort
        </button>

        {/* Lägg till redigeringsknappen */}
        <button
          onClick={handleEdit}
          className='approve-button'
          /* style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "8px 12px",
            cursor: "pointer",
          }} */
        >
          Editera
        </button>
      </div>

      {/* Modal för att visa review comment */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}
        >
          <h3>Kommentar</h3>
          <p>{product.reviewComment ? product.reviewComment : "Ingen kommentar tillgänglig"}</p>
          <button
            onClick={toggleModal}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "8px 12px",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            Stäng
          </button>
        </div>
      )}

      {/* Overlay för modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={toggleModal} // Close modal when clicking on the overlay
        />
      )}
    </div>
  );
};

export default ProductItem;
