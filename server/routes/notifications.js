const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [req.user.userId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Notification service error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await pool.query(`
      UPDATE notifications 
      SET read = true 
      WHERE id = $1 AND user_id = $2
    `, [req.params.id, req.user.userId]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Notification service error' });
  }
});

// Create proactive notifications (internal use)
async function createProactiveNotifications() {
  try {
    // Check for low balance users
    const lowBalanceUsers = await pool.query(`
      SELECT id, name, balance FROM users WHERE balance < 1000
    `);
    
    for (const user of lowBalanceUsers.rows) {
      await pool.query(`
        INSERT INTO notifications (user_id, type, title, message)
        VALUES ($1, 'low_balance', 'Low Balance Alert', 'Your balance is ${user.balance} DA. Consider topping up.')
        ON CONFLICT DO NOTHING
      `, [user.id]);
    }
    
    // Weekly spending summary
    const activeUsers = await pool.query('SELECT DISTINCT user_id FROM transactions WHERE created_at > NOW() - INTERVAL \'7 days\'');
    
    for (const userRow of activeUsers.rows) {
      const spendingResult = await pool.query(`
        SELECT SUM(ABS(amount)) as weekly_spending
        FROM transactions 
        WHERE user_id = $1 AND amount < 0 AND created_at > NOW() - INTERVAL '7 days'
      `, [userRow.user_id]);
      
      const weeklySpending = spendingResult.rows[0]?.weekly_spending || 0;
      
      await pool.query(`
        INSERT INTO notifications (user_id, type, title, message)
        VALUES ($1, 'weekly_summary', 'Weekly Spending Summary', 'You spent ${weeklySpending} DA this week. 15% less than network average!')
      `, [userRow.user_id]);
    }
  } catch (error) {
    console.error('Error creating proactive notifications:', error);
  }
}

// Generate proactive notifications
router.post('/generate', auth, async (req, res) => {
  try {
    await createProactiveNotifications();
    res.json({ success: true, message: 'Proactive notifications generated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate notifications' });
  }
});

// Check for real-time alerts
router.get('/realtime-check', auth, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const balance = parseFloat(user.rows[0]?.balance || 0);
    
    const alerts = [];
    
    if (balance < 500) {
      alerts.push({
        type: 'urgent',
        title: 'Critical Balance Warning',
        message: 'Your balance is very low. Immediate action recommended.',
        suggestions: ['Find nearest ATM', 'Contact bank', 'Transfer funds']
      });
    } else if (balance < 1000) {
      alerts.push({
        type: 'warning',
        title: 'Low Balance Alert',
        message: 'Consider topping up your account soon.',
        suggestions: ['Schedule deposit', 'Set up auto-transfer']
      });
    }
    
    // Simulate network-based alerts
    const networkAlerts = [
      {
        type: 'info',
        title: 'ATM Maintenance Alert',
        message: 'ATM at University is under maintenance. Use Place 1er Mai instead.',
        suggestions: ['Find alternative ATM', 'Use card payment']
      }
    ];
    
    res.json([...alerts, ...networkAlerts]);
  } catch (error) {
    res.status(500).json({ error: 'Real-time check failed' });
  }
});

module.exports = router;
