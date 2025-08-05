import React, { useState } from 'react';
import './AdminWebsitePage.css';
import EditWebsiteImageModal from './EditWebsiteImageModal';

const placeholderImages = new Array(6).fill(null);

const AdminWebsitePage = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Redigera startsidans bilder</h2>
      <div className="gallery-container">
        {placeholderImages.map((_, i) => (
          <div
            key={i}
            className="gallery-item placeholder-box"
            onClick={() => setSelectedIndex(i)}
          >
            <span>Klicka för att redigera</span>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <EditWebsiteImageModal
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
};

export default AdminWebsitePage;
