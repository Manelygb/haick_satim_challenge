import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VirtualCard() {
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState('');
  const [requireVerification, setRequireVerification] = useState(false);
  const [expiryCountdown, setExpiryCountdown] = useState(null);

  useEffect(() => {
    let timer;
    if (card && card.expiresAt) {
      const updateCountdown = () => {
        const expires = new Date(card.expiresAt);
        const now = new Date();
        const diff = Math.max(0, Math.floor((expires - now) / 1000));
        setExpiryCountdown(diff);
        if (diff <= 0) setCard(null);
      };
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    }
    return () => clearInterval(timer);
  }, [card]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/analytics/virtual-card', {
        purpose,
        amountLimit: amount,
        verificationCode: verification || undefined
      });
      setCard(res.data);
      setRequireVerification(false);
      setVerification('');
    } catch (err) {
      if (err.response?.data?.requireVerification) {
        setRequireVerification(true);
        setError('Verification required. Please enter the code sent to your email (demo: 123456).');
      } else {
        setError(err.response?.data?.error || 'Failed to create virtual card');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = () => {
    setCard(null);
    setExpiryCountdown(null);
  };

  return (
    <div className="max-w-xl mx-auto card">
      <h2 className="text-2xl font-bold mb-6">💳 Virtual Card</h2>
      <p className="mb-4 text-gray-600">Generate a secure, one-time-use virtual card for emergency, risky, or online payments. The card expires after one use or a short time window. Extra verification is required for your security.</p>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {card ? (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-100 to-blue-300 p-6 rounded-xl shadow-lg flex flex-col items-center mb-2 relative">
            <div className="text-lg font-mono tracking-widest text-gray-800 mb-2">
              {card.cardNumber ? card.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ') : '**** **** **** ****'}
            </div>
            <div className="flex justify-between w-full text-sm text-gray-700 mb-2">
              <span>Expires: {card.expiresAt ? new Date(card.expiresAt).toLocaleTimeString() : '--'}</span>
              <span>Limit: {card.amountLimit} DA</span>
            </div>
            <div className="text-xs text-gray-600">Status: <span className={card.status === 'active' ? 'text-green-600' : 'text-gray-500'}>{card.status}</span></div>
            {expiryCountdown !== null && (
              <div className="mt-2 text-xs text-red-600">Expires in: {expiryCountdown}s</div>
            )}
            <button onClick={handleExpire} className="btn-secondary mt-4">Expire Now</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="mb-6 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Purpose</label>
            <input
              type="text"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="e.g. Emergency, risky payment, forgot card"
              className="mb-2 px-3 py-2 border rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Amount Limit (DA)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min={100}
              max={100000}
              className="mb-2 px-3 py-2 border rounded w-full"
              required
            />
          </div>
          {requireVerification && (
            <div>
              <label className="block mb-2 text-sm font-medium">Verification Code</label>
              <input
                type="text"
                value={verification}
                onChange={e => setVerification(e.target.value)}
                placeholder="Enter code (demo: 123456)"
                className="mb-2 px-3 py-2 border rounded w-full"
                required
              />
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Generating...' : 'Generate Virtual Card'}</button>
        </form>
      )}
    </div>
  );
}

export default VirtualCard;
