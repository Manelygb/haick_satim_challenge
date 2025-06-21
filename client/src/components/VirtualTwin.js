import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function VirtualTwin({ socket }) {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Hello! I\'m your SATIM Virtual Twin. I can help you with payments, withdrawals, balance inquiries, and more. How can I assist you today?',
      suggestions: ['Check balance', 'Find ATM', 'Payment guide', 'Help']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = { type: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/assistant/chat', {
        message,
        language: 'en'
      });

      const assistantMessage = {
        type: 'assistant',
        content: response.data.response,
        suggestions: response.data.suggestions,
        confidence: response.data.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'assistant',
        content: 'Sorry, I\'m having trouble right now. Please try again later.',
        suggestions: ['Try again', 'Contact support']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">🤖 Virtual Twin</h2>
        
        <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-satim-blue text-white'
                  : 'bg-white border'
              }`}>
                <p className="text-sm">{message.content}</p>
                {message.confidence && (
                  <p className="text-xs opacity-75 mt-1">
                    Confidence: {(message.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
              
              {message.suggestions && (
                <div className="mt-2 space-x-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="text-left mb-4">
              <div className="inline-block bg-white border px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message... (Try: 'check balance' or 'find ATM')"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-satim-blue focus:border-satim-blue"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary disabled:opacity-50"
          >
            Send
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Try asking:</strong></p>
          <div className="mt-2 space-x-2">
            {['Check my balance', 'Find nearest ATM', 'Help with payments', 'Transaction history'].map((example, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(example)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualTwin;
