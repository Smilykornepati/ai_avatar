import React, { useState, useEffect, useRef } from 'react';
import { Heart, Phone, Clock, MapPin, Stethoscope, Users, Award, Calendar, Shield, Activity } from 'lucide-react';

export default function HospitalLanding() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVolumeWarning, setShowVolumeWarning] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);

  const welcomeMessage = "Hello! Welcome to HealthCare Plus Hospital. I'm here to assist you. We provide world-class medical care with compassion and excellence. Feel free to explore our services, or call us anytime at 1-555-123-4567 for appointments.";

  const speak = () => {
    if (hasSpoken) return;
    
    setHasSpoken(true);
    setIsSpeaking(true);

    try {
      // Cancel any existing speech
      window.speechSynthesis.cancel();

      // Create utterance
      utteranceRef.current = new SpeechSynthesisUtterance(welcomeMessage);
      utteranceRef.current.rate = 0.9;
      utteranceRef.current.pitch = 1.1;
      utteranceRef.current.volume = 1;

      // Get voices
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(v => v.lang.startsWith('en-')) || voices[0];
        utteranceRef.current.voice = englishVoice;
      }

      utteranceRef.current.onstart = () => {
        console.log('Speech started');
        setIsSpeaking(true);
      };

      utteranceRef.current.onend = () => {
        console.log('Speech ended');
        setIsSpeaking(false);
      };

      utteranceRef.current.onerror = (e) => {
        console.error('Speech error:', e);
        setIsSpeaking(false);
        // Show modal only if it's a permission issue
        if (e.error === 'not-allowed') {
          setShowVolumeWarning(true);
        }
      };

      // Speak
      window.speechSynthesis.speak(utteranceRef.current);
      console.log('Speech triggered');
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
    }
  };

  // Auto-trigger on user interaction (any click, scroll, or key press)
  useEffect(() => {
    const triggerSpeech = () => {
      if (!hasSpoken) {
        console.log('User interaction detected, triggering speech...');
        setTimeout(speak, 50);
      }
    };

    // DON'T try immediate speech - browsers block it
    // Instead, wait for first user interaction
    const events = ['click', 'scroll', 'touchstart', 'keydown', 'mousemove'];
    
    // Set up listeners
    const listeners = events.map(event => {
      const handler = () => {
        triggerSpeech();
        // Remove all listeners after first trigger
        events.forEach(e => document.removeEventListener(e, handler));
      };
      document.addEventListener(event, handler, { passive: true });
      return { event, handler };
    });

    // Load voices in background
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    console.log('Waiting for user interaction to start speech...');

    return () => {
      listeners.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler);
      });
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleVolumeWarningClose = () => {
    setShowVolumeWarning(false);
    speak();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Volume Warning Modal */}
      {showVolumeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-3">🔊 Audio Blocked</h3>
            <p className="text-gray-700 mb-4">
              Your browser blocked the audio. Please click the button below to enable the welcome message.
            </p>
            <button
              onClick={handleVolumeWarningClose}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Enable Audio & Continue
            </button>
          </div>
        </div>
      )}

      {/* Floating Avatar - Right Side */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className={`relative ${isSpeaking ? 'animate-pulse' : ''}`}>
          {/* Glow Effect */}
          {isSpeaking && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
          )}
          
          {/* Avatar Circle */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
            {/* Face */}
            <div className="w-20 h-20 bg-white rounded-full relative">
              {/* Eyes */}
              <div className="absolute top-6 left-4 flex space-x-4">
                <div className={`w-2 h-2 bg-gray-800 rounded-full ${isSpeaking ? 'animate-bounce' : ''}`}></div>
                <div className={`w-2 h-2 bg-gray-800 rounded-full ${isSpeaking ? 'animate-bounce' : ''}`}></div>
              </div>
              {/* Mouth */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                {isSpeaking ? (
                  <div className="w-6 h-4 border-3 border-gray-800 rounded-full"></div>
                ) : (
                  <div className="w-6 h-0.5 bg-gray-800 rounded-full"></div>
                )}
              </div>
            </div>
            {/* Medical Cross */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-4 h-1 bg-white absolute"></div>
              <div className="w-1 h-4 bg-white absolute"></div>
            </div>
          </div>

          {/* Sound Wave Indicator */}
          {isSpeaking && (
            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
              <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-8 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" fill="currentColor" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">HealthCare Plus</span>
                <p className="text-xs text-gray-500">Excellence in Healthcare</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition font-medium">Services</a>
              <a href="#departments" className="text-gray-700 hover:text-blue-600 transition font-medium">Departments</a>
              <a href="#doctors" className="text-gray-700 hover:text-blue-600 transition font-medium">Doctors</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition font-medium">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="w-5 h-5 text-blue-600" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">Emergency</p>
                <p className="text-xs text-gray-600">1-555-123-4567</p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium ml-4">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                ⭐ Rated #1 Hospital in the Region
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Compassionate Care, Advanced Medicine
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience healthcare excellence with our team of world-class specialists, 
                state-of-the-art technology, and patient-centered approach. Your health and 
                comfort are our top priorities.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl">
                  Schedule Appointment
                </button>
                <button className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 transition font-semibold text-lg">
                  Virtual Consultation
                </button>
              </div>
              <div className="flex items-center space-x-8 pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">24/7 Emergency</p>
                    <p className="text-xs text-gray-600">Always Available</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Certified Care</p>
                    <p className="text-xs text-gray-600">Accredited Facility</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=700&h=500&fit=crop" 
                  alt="Medical Team" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">50,000+</p>
                    <p className="text-sm text-gray-600">Happy Patients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Medical Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare solutions delivered by expert specialists with cutting-edge technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">General Medicine</h3>
              <p className="text-gray-700">Primary care and preventive health services for all ages</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cardiology</h3>
              <p className="text-gray-700">Advanced heart care with expert cardiologists</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Neurology</h3>
              <p className="text-gray-700">Specialized brain and nervous system treatment</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pediatrics</h3>
              <p className="text-gray-700">Gentle, compassionate care for children</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-5xl font-bold mb-2">250+</p>
              <p className="text-blue-100">Expert Doctors</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">50K+</p>
              <p className="text-blue-100">Patients Served</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">35+</p>
              <p className="text-blue-100">Specialties</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">24/7</p>
              <p className="text-blue-100">Emergency Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Specialized Departments</h2>
            <p className="text-lg text-gray-600">World-class facilities across multiple specialties</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Emergency Care</h3>
              <p className="text-gray-600 mb-4">Round-the-clock emergency services with rapid response team</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700">Learn More →</button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Surgical Services</h3>
              <p className="text-gray-600 mb-4">Advanced surgical procedures with minimally invasive techniques</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700">Learn More →</button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Diagnostic Center</h3>
              <p className="text-gray-600 mb-4">State-of-the-art imaging and laboratory services</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700">Learn More →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Visit Us Today</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our friendly staff is ready to assist you with appointments, inquiries, or emergency care.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Address</p>
                    <p className="text-gray-600">123 Medical Plaza, Healthcare District<br/>Metro City, HC 12345</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Phone</p>
                    <p className="text-gray-600">Emergency: 1-555-123-4567<br/>Appointments: 1-555-123-4568</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Hours</p>
                    <p className="text-gray-600">Emergency: 24/7<br/>Outpatient: Mon-Sat 8AM-8PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Request a Callback</h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea 
                  placeholder="How can we help you?" 
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-8 h-8 text-blue-400" fill="currentColor" />
                <span className="text-xl font-bold">HealthCare Plus</span>
              </div>
              <p className="text-gray-400 text-sm">
                Committed to providing exceptional healthcare services with compassion and excellence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Our Doctors</a></li>
                <li><a href="#" className="hover:text-white">Departments</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Emergency Care</a></li>
                <li><a href="#" className="hover:text-white">Surgery</a></li>
                <li><a href="#" className="hover:text-white">Diagnostics</a></li>
                <li><a href="#" className="hover:text-white">Pharmacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>123 Medical Plaza</li>
                <li>Metro City, HC 12345</li>
                <li>Phone: 1-555-123-4567</li>
                <li>Email: info@healthcareplus.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 HealthCare Plus Hospital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}