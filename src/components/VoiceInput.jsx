import React from 'react';

/**
 * Voice Input Component
 * Button to start/stop voice recording
 */
const VoiceInput = ({ isListening, isProcessing, onStart, onStop }) => {
  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="voice-input">
      <button
        className={`voice-button ${isListening ? 'recording' : ''}`}
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
      >
        <span className="voice-icon">
          {isListening ? '⏹️' : '🎤'}
        </span>
        <span className="voice-label">
          {isListening ? 'Stop' : 'Speak'}
        </span>
      </button>
      {isListening && (
        <div className="recording-indicator">
          <span className="recording-dot"></span>
          <span>Recording...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;