import React from 'react';

/**
 * Volume Warning Banner Component
 * Only shown when volume might be low
 */
const VolumeWarning = ({ onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="volume-warning">
      <div className="volume-warning-content">
        <span className="volume-icon">🔊</span>
        <span className="volume-text">
          Please check your device volume if you cannot hear the assistant
        </span>
        <button 
          className="volume-close"
          onClick={onClose}
          aria-label="Close volume warning"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default VolumeWarning;