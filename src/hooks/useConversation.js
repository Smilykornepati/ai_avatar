import { useState, useCallback, useRef } from 'react';
import openaiService from '../services/openaiService';
import speechService from '../services/speechService';

/**
 * Custom hook to manage receptionist conversation state and interactions
 */
const useConversation = () => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const hasGreeted = useRef(false);

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    // Add user message to conversation
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Get AI response from OpenAI
      const conversationHistory = [...messages, newUserMessage];
      const aiResponse = await openaiService.sendMessage(conversationHistory);

      // Add AI response to conversation
      const newAiMessage = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, newAiMessage]);

      // IMPORTANT: Speak the AI response immediately
      setIsProcessing(false); // Set processing to false before speaking
      await speakMessage(aiResponse);

    } catch (err) {
      console.error('Error in conversation:', err);
      setError(err.message || 'Failed to get response');
      
      // Add error message to conversation
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
      
      // Speak error message
      await speakMessage('Sorry, I encountered an error. Please try again.');
    }
  }, [messages, isProcessing]);

  /**
   * Speak a message using text-to-speech
   */
  const speakMessage = useCallback(async (text) => {
    try {
      console.log('Speaking:', text); // Debug log
      setIsSpeaking(true);
      
      await speechService.speak(
        text,
        () => {
          console.log('Speech started'); // Debug log
          setIsSpeaking(true);
        },
        () => {
          console.log('Speech ended'); // Debug log
          setIsSpeaking(false);
        }
      );
    } catch (err) {
      console.error('Speech error:', err);
      setIsSpeaking(false);
      setError('Speech synthesis failed. Please check your browser settings.');
    }
  }, []);

  /**
   * Start voice input
   */
  const startVoiceInput = useCallback(() => {
    if (isListening || isProcessing) return;

    // Stop any ongoing speech before listening
    speechService.stopSpeaking();
    setIsSpeaking(false);

    speechService.startListening(
      (transcript) => {
        console.log('Recognized:', transcript); // Debug log
        // When speech is recognized, send it as a message
        sendMessage(transcript);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setError('Voice input failed. Please try again or use text input.');
        setIsListening(false);
      },
      () => {
        console.log('Listening started'); // Debug log
        setIsListening(true);
      },
      () => {
        console.log('Listening stopped'); // Debug log
        setIsListening(false);
      }
    );
  }, [isListening, isProcessing, sendMessage]);

  /**
   * Stop voice input
   */
  const stopVoiceInput = useCallback(() => {
    speechService.stopListening();
    setIsListening(false);
  }, []);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  /**
   * Initial receptionist greeting
   */
  const greet = useCallback(async () => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const greetingText = process.env.REACT_APP_GREETING_MESSAGE || 
      "Hello! Welcome to our office. I'm your AI receptionist. May I know who you'd like to meet today?";
    
    console.log('Greeting:', greetingText); // Debug log
    
    const greetingMessage = { role: 'assistant', content: greetingText };
    setMessages([greetingMessage]);
    
    // Wait a moment to ensure audio context is ready
    setTimeout(async () => {
      await speakMessage(greetingText);
    }, 200);
  }, [speakMessage]);

  return {
    messages,
    isProcessing,
    isSpeaking,
    isListening,
    error,
    sendMessage,
    startVoiceInput,
    stopVoiceInput,
    stopSpeaking,
    greet
  };
};

export default useConversation;