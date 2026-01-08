/**
 * Speech Service
 * Handles text-to-speech and speech-to-text using Web Speech API
 */

class SpeechService {
    constructor() {
      this.synthesis = window.speechSynthesis;
      this.recognition = null;
      this.isSupported = 'speechSynthesis' in window;
      this.currentUtterance = null;
      
      // Check for speech recognition support
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  
    /**
     * Speak text using Web Speech API
     * @param {string} text - Text to speak
     * @param {function} onStart - Callback when speech starts
     * @param {function} onEnd - Callback when speech ends
     * @returns {Promise<void>}
     */
    speak(text, onStart, onEnd) {
      return new Promise((resolve, reject) => {
        if (!this.isSupported) {
          console.error('Speech synthesis not supported');
          reject(new Error('Speech synthesis not supported'));
          return;
        }
  
        // Cancel any ongoing speech
        this.synthesis.cancel();
  
        // Small delay to ensure cancel completes
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          this.currentUtterance = utterance;
          
          // Configure voice settings
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          utterance.lang = 'en-US';
  
          // Get available voices and use a better one if available
          const voices = this.synthesis.getVoices();
          const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Female')
          ) || voices.find(voice => voice.lang.startsWith('en'));
          
          if (englishVoice) {
            utterance.voice = englishVoice;
          }
  
          utterance.onstart = () => {
            console.log('✓ Speech started');
            if (onStart) onStart();
          };
  
          utterance.onend = () => {
            console.log('✓ Speech ended');
            this.currentUtterance = null;
            if (onEnd) onEnd();
            resolve();
          };
  
          utterance.onerror = (error) => {
            console.error('Speech error:', error);
            this.currentUtterance = null;
            if (onEnd) onEnd();
            
            // Don't reject on certain errors that don't actually break speech
            if (error.error === 'interrupted' || error.error === 'canceled') {
              resolve();
            } else {
              reject(error);
            }
          };
  
          // Speak the utterance
          console.log('Speaking:', text);
          this.synthesis.speak(utterance);
          
          // Fallback check if onstart doesn't fire
          setTimeout(() => {
            if (this.currentUtterance && !this.synthesis.speaking) {
              console.warn('Speech may have failed to start, retrying...');
              this.synthesis.cancel();
              this.synthesis.speak(utterance);
            }
          }, 100);
          
        }, 50);
      });
    }
  
    /**
     * Stop current speech
     */
    stopSpeaking() {
      if (this.synthesis) {
        console.log('Stopping speech...');
        this.synthesis.cancel();
        this.currentUtterance = null;
      }
    }
  
    /**
     * Start listening for speech input
     * @param {function} onResult - Callback with recognized text
     * @param {function} onError - Callback on error
     * @param {function} onStart - Callback when listening starts
     * @param {function} onEnd - Callback when listening ends
     */
    startListening(onResult, onError, onStart, onEnd) {
      if (!this.recognition) {
        console.error('Speech recognition not supported');
        onError(new Error('Speech recognition not supported'));
        return;
      }
  
      this.recognition.onstart = () => {
        console.log('✓ Listening started');
        if (onStart) onStart();
      };
  
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('✓ Recognized:', transcript);
        if (onResult) onResult(transcript);
      };
  
      this.recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        if (onError) onError(event.error);
      };
  
      this.recognition.onend = () => {
        console.log('✓ Listening ended');
        if (onEnd) onEnd();
      };
  
      try {
        console.log('Starting speech recognition...');
        this.recognition.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        if (onError) onError(error);
      }
    }
  
    /**
     * Stop listening for speech input
     */
    stopListening() {
      if (this.recognition) {
        console.log('Stopping speech recognition...');
        try {
          this.recognition.stop();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
    }
  
    /**
     * Check if speech services are supported
     */
    isSpeechSupported() {
      return this.isSupported && this.recognition !== null;
    }
  }
  
  export default new SpeechService();