const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get user analytics dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Monthly spending
    const monthlyResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as spending,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income
      FROM transactions 
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `, [req.user.userId]);

    // Category breakdown
    const categoryResult = await pool.query(`
      SELECT 
        CASE 
          WHEN description ILIKE '%coffee%' OR description ILIKE '%restaurant%' THEN 'Food & Dining'
          WHEN description ILIKE '%atm%' THEN 'Cash Withdrawal'
          WHEN description ILIKE '%bus%' OR description ILIKE '%transport%' THEN 'Transport'
          WHEN description ILIKE '%salary%' THEN 'Income'
          ELSE 'Other'
        END as category,
        SUM(ABS(amount)) as total
      FROM transactions 
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY category
    `, [req.user.userId]);

    // Recent transactions
    const recentResult = await pool.query(`
      SELECT * FROM transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [req.user.userId]);

    // Network insights (simulated)
    const networkInsights = [
      {
        insight: "You spend 15% less on transport than similar users in your area",
        type: "positive",
        category: "transport"
      },
      {
        insight: "Your weekend ATM usage is optimal - avoiding peak hours",
        type: "positive",
        category: "timing"
      },
      {
        insight: "Consider using card payments more often to reduce ATM fees",
        type: "suggestion",
        category: "fees"
      }
    ];

    res.json({
      monthlyTrends: monthlyResult.rows,
      categoryBreakdown: categoryResult.rows,
      recentTransactions: recentResult.rows,
      networkInsights,
      summary: {
        totalSpent: monthlyResult.rows.reduce((sum, row) => sum + parseFloat(row.spending || 0), 0),
        totalIncome: monthlyResult.rows.reduce((sum, row) => sum + parseFloat(row.income || 0), 0),
        transactionCount: recentResult.rows.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Analytics service error' });
  }
});

// Get spending predictions
router.get('/predictions', auth, async (req, res) => {
  try {
    // Simple prediction algorithm
    const result = await pool.query(`
      SELECT 
        AVG(daily_spending) as avg_daily_spending
      FROM (
        SELECT DATE(created_at) as day, SUM(ABS(amount)) as daily_spending
        FROM transactions 
        WHERE user_id = $1 AND amount < 0 AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
      ) daily_totals
    `, [req.user.userId]);

    const avgDaily = parseFloat(result.rows[0]?.avg_daily_spending || 0);
    
    res.json({
      nextWeekPrediction: avgDaily * 7,
      nextMonthPrediction: avgDaily * 30,
      recommendations: [
        "Based on your patterns, budget 2000 DA for next week",
        "Consider setting up automatic savings for 500 DA monthly",
        "Your spending is well-controlled compared to network average"
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Prediction service error' });
  }
});

module.exports = router;
