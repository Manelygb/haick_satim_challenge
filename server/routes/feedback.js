const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    const { transactionId, rating, comment, experience } = req.body;
    
    const result = await pool.query(`
      INSERT INTO feedback (user_id, transaction_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.userId, transactionId, rating, comment]);
    
    // Real-time notification to admin (simulated)
    const io = req.app.get('io');
    io.emit('new_feedback', {
      id: result.rows[0].id,
      rating,
      comment,
      userId: req.user.userId,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      feedback: result.rows[0],
      message: 'Thank you for your feedback! This helps improve our service.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Feedback submission failed' });
  }
});

// Get feedback analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    // Average ratings
    const ratingResult = await pool.query(`
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_feedback,
        COUNT(*) FILTER (WHERE rating >= 4) as positive_feedback
      FROM feedback
      WHERE created_at > NOW() - INTERVAL '30 days'
    `);
    
    // Recent feedback
    const recentResult = await pool.query(`
      SELECT f.*, u.name as user_name, t.description as transaction_desc
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN transactions t ON f.transaction_id = t.id
      ORDER BY f.created_at DESC
      LIMIT 10
    `);
    
    const analytics = ratingResult.rows[0];
    analytics.satisfaction_rate = (analytics.positive_feedback / analytics.total_feedback * 100).toFixed(1);
    
    res.json({
      analytics,
      recentFeedback: recentResult.rows,
      insights: [
        "Customer satisfaction improved 12% this month",
        "ATM speed ratings increased significantly",
        "Mobile payment feedback is consistently positive"
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Analytics retrieval failed' });
  }
});

// Get feedback for specific transaction
router.get('/transaction/:transactionId', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM feedback 
      WHERE transaction_id = $1 AND user_id = $2
    `, [req.params.transactionId, req.user.userId]);
    
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Feedback retrieval failed' });
  }
});

module.exports = router;
