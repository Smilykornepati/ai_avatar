import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationState, setConversationState] = useState('greeting');
  const [appointmentData, setAppointmentData] = useState({});
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    // Initial greeting
    setTimeout(() => {
      const greeting = "Hello! Welcome to HealthCare Clinic. I'm Sarah, your virtual receptionist. How may I help you today?";
      addMessage('receptionist', greeting);
      speak(greeting);
    }, 1000);

    return () => {
      synthRef.current.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text, timestamp: new Date() }]);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = (text = inputText) => {
    if (!text.trim()) return;

    addMessage('user', text);
    setInputText('');
    
    // Process the message
    setTimeout(() => {
      processUserInput(text.toLowerCase());
    }, 500);
  };

  const processUserInput = (input) => {
    let response = '';

    if (conversationState === 'greeting') {
      if (input.includes('appointment') || input.includes('book') || input.includes('schedule')) {
        response = "Great! I'd be happy to help you book an appointment. May I have your full name, please?";
        setConversationState('asking_name');
      } else if (input.includes('hours') || input.includes('time') || input.includes('open')) {
        response = "We're open Monday to Friday, 9 AM to 5 PM, and Saturday 9 AM to 1 PM. Would you like to book an appointment?";
      } else if (input.includes('location') || input.includes('address') || input.includes('where')) {
        response = "We're located at 123 Medical Plaza, Downtown. Would you like to book an appointment?";
      } else if (input.includes('doctor') || input.includes('physicians')) {
        response = "We have Dr. Smith (General Physician), Dr. Johnson (Cardiologist), Dr. Williams (Pediatrician), and Dr. Brown (Dermatologist). Would you like to book an appointment with any of them?";
      } else {
        response = "I can help you book an appointment, provide information about our doctors, office hours, or location. What would you like to know?";
      }
    } else if (conversationState === 'asking_name') {
      setAppointmentData(prev => ({ ...prev, name: input }));
      response = `Thank you, ${input}. What's the best phone number to reach you?`;
      setConversationState('asking_phone');
    } else if (conversationState === 'asking_phone') {
      setAppointmentData(prev => ({ ...prev, phone: input }));
      response = "Perfect! And your email address?";
      setConversationState('asking_email');
    } else if (conversationState === 'asking_email') {
      setAppointmentData(prev => ({ ...prev, email: input }));
      response = "Great! Which doctor would you like to see? We have Dr. Smith, Dr. Johnson, Dr. Williams, or Dr. Brown.";
      setConversationState('asking_doctor');
    } else if (conversationState === 'asking_doctor') {
      setAppointmentData(prev => ({ ...prev, doctor: input }));
      response = "Excellent choice! What date works best for you? Please say or type the date in format like 'January 15th' or '2026-01-15'.";
      setConversationState('asking_date');
    } else if (conversationState === 'asking_date') {
      setAppointmentData(prev => ({ ...prev, date: input }));
      response = "Perfect! What time would you prefer? Morning, afternoon, or a specific time like 10 AM?";
      setConversationState('asking_time');
    } else if (conversationState === 'asking_time') {
      setAppointmentData(prev => ({ ...prev, time: input }));
      response = `Wonderful! I've booked your appointment with ${appointmentData.doctor} on ${appointmentData.date} at ${input}. You'll receive a confirmation email at ${appointmentData.email}. Is there anything else I can help you with?`;
      setConversationState('completed');
    } else if (conversationState === 'completed') {
      if (input.includes('no') || input.includes('that\'s all') || input.includes('nothing')) {
        response = "Great! Have a wonderful day and we'll see you at your appointment!";
        setTimeout(() => {
          setConversationState('greeting');
          setAppointmentData({});
        }, 3000);
      } else if (input.includes('yes') || input.includes('another')) {
        response = "Of course! What else can I help you with?";
        setConversationState('greeting');
      } else {
        response = "I'm here to help! What do you need?";
        setConversationState('greeting');
      }
    }

    addMessage('receptionist', response);
    speak(response);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="receptionist-avatar">
          <div className={`avatar-circle ${isSpeaking ? 'speaking' : ''}`}>
            <div className="face">
              <div className="eyes">
                <div className="eye"></div>
                <div className="eye"></div>
              </div>
              <div className="mouth"></div>
            </div>
          </div>
          {isSpeaking && (
            <div className="speaking-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
        <div className="receptionist-info">
          <h2>Sarah</h2>
          <p>Virtual Receptionist</p>
          <div className="status">
            <span className="status-dot"></span>
            Online
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">
                {msg.sender === 'receptionist' && (
                  <div className="avatar-small">S</div>
                )}
                <div className="message-bubble">
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="avatar-small user-avatar">You</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="text-input"
          />
          <button 
            onClick={() => handleSendMessage()}
            className="send-button"
            disabled={!inputText.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10L18 2L12 18L10 11L2 10Z" />
            </svg>
          </button>
          <button 
            onClick={isListening ? stopListening : startListening}
            className={`mic-button ${isListening ? 'listening' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 13C11.66 13 13 11.66 13 10V4C13 2.34 11.66 1 10 1C8.34 1 7 2.34 7 4V10C7 11.66 8.34 13 10 13Z"/>
              <path d="M15 10C15 13.31 12.31 16 9 16C5.69 16 3 13.31 3 10H1C1 13.87 3.88 17.11 7.62 17.84V20H12.38V17.84C16.12 17.11 19 13.87 19 10H15Z"/>
            </svg>
          </button>
        </div>
        {isListening && (
          <div className="listening-indicator">
            <span className="pulse"></span>
            Listening...
          </div>
        )}
      </div>
    </div>
  );
}

export default App;