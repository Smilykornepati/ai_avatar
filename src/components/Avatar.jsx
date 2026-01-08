import React from 'react';

/**
 * Avatar Component
 * Displays animated avatar with different states (idle, speaking, listening)
 */
const Avatar = ({ isSpeaking, isListening }) => {
  const getAvatarClass = () => {
    if (isSpeaking) return 'avatar speaking';
    if (isListening) return 'avatar listening';
    return 'avatar';
  };

  const getStatusText = () => {
    if (isSpeaking) return 'Speaking...';
    if (isListening) return 'Listening...';
    return 'Ready';
  };

  return (
    <div className="avatar-container">
      <div className={getAvatarClass()}>
        <div className="avatar-circle">
          <div className="avatar-icon">
            {isListening ? '🎤' : '🤖'}
          </div>
        </div>
        {isSpeaking && (
          <>
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
          </>
        )}
      </div>
      <div className="avatar-status">{getStatusText()}</div>
    </div>
  );
};

export default Avatar;