const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Simple AI responses based on keywords
const getAssistantResponse = (message, userContext) => {
  const msg = message.toLowerCase();
  const responses = {
    balance: {
      ar: `رصيدك الحالي هو ${userContext.balance} دج. هل تريد معرفة المزيد؟`,
      en: `Your current balance is ${userContext.balance} DA. Need anything else?`,
      suggestions: ['View transactions', 'Find ATM', 'Transfer money']
    },
    withdraw: {
      ar: 'بناءً على بيانات الشبكة، أقرب صراف آلي في مكان 1 ماي لديه أقل وقت انتظار الآن',
      en: 'Based on network data, ATM at Place 1er Mai has shortest wait time now',
      suggestions: ['Find nearest ATM', 'Check withdrawal limits', 'Schedule withdrawal']
    },
    payment: {
      ar: 'يمكنك الدفع بالبطاقة أو الهاتف المحمول. أي طريقة تفضل؟',
      en: 'You can pay by card or mobile. Which do you prefer?',
      suggestions: ['Card payment guide', 'Mobile payment setup', 'Payment history']
    },
    help: {
      ar: 'أنا هنا لمساعدتك! يمكنني مساعدتك في المدفوعات والسحوبات والاستعلامات',
      en: 'I\'m here to help! I can assist with payments, withdrawals, and account inquiries',
      suggestions: ['Check balance', 'Find ATM', 'Transaction guide', 'Contact support']
    }
  };

  if (msg.includes('balance') || msg.includes('رصيد')) {
    return responses.balance;
  } else if (msg.includes('withdraw') || msg.includes('سحب') || msg.includes('نقود')) {
    return responses.withdraw;
  } else if (msg.includes('pay') || msg.includes('دفع')) {
    return responses.payment;
  } else {
    return responses.help;
  }
};

// Chat with assistant
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    
    // Get user context
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = userResult.rows[0];
    
    const response = getAssistantResponse(message, user);
    
    res.json({
      response: response[language] || response.en,
      suggestions: response.suggestions,
      confidence: 0.95,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Assistant service error' });
  }
});

// Get transaction predictions
router.get('/predictions', auth, async (req, res) => {
  try {
    // Simple prediction based on transaction history
    const result = await pool.query(`
      SELECT type, AVG(amount) as avg_amount, COUNT(*) as frequency
      FROM transactions 
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY type
    `, [req.user.userId]);
    
    const predictions = result.rows.map(row => ({
      type: row.type,
      suggestedAmount: Math.round(row.avg_amount),
      frequency: row.frequency,
      prediction: `Based on your history, you typically ${row.type} ${Math.round(row.avg_amount)} DA`
    }));
    
    res.json({ predictions });
  } catch (error) {
    res.status(500).json({ error: 'Prediction service error' });
  }
});

module.exports = router;
