import React from 'react';

/**
 * Welcome Modal Component
 * Full-screen overlay that appears on initial load
 */
const WelcomeModal = ({ onStart }) => {
  return (
    <div 
      className="welcome-modal"
      onClick={onStart}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onStart()}
    >
      <div className="welcome-content">
        <div className="welcome-icon">👋</div>
        <h1>Tap anywhere to start the AI assistant</h1>
      </div>
    </div>
  );
};

export default WelcomeModal;