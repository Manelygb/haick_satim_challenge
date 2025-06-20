import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Dashboard({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  const categoryData = {
    labels: analytics?.categoryBreakdown?.map(item => item.category) || [],
    datasets: [{
      data: analytics?.categoryBreakdown?.map(item => item.total) || [],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    }]
  };

  const monthlyData = {
    labels: analytics?.monthlyTrends?.map(item => 
      new Date(item.month).toLocaleDateString('en', { month: 'short', year: 'numeric' })
    ) || [],
    datasets: [{
      label: 'Spending',
      data: analytics?.monthlyTrends?.map(item => item.spending) || [],
      backgroundColor: '#3b82f6',
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Bank: {user.bank_id} • Balance: {user.balance} DA
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">This Month</h3>
          <p className="text-3xl font-bold text-satim-blue">
            {analytics?.summary?.totalSpent?.toFixed(0) || 0} DA
          </p>
          <p className="text-sm text-gray-500">Total Spent</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Transactions</h3>
          <p className="text-3xl font-bold text-satim-green">
            {analytics?.recentTransactions?.length || 0}
          </p>
          <p className="text-sm text-gray-500">This Month</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Savings Rate</h3>
          <p className="text-3xl font-bold text-purple-600">85%</p>
          <p className="text-sm text-gray-500">Above Network Average</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {analytics?.categoryBreakdown?.length > 0 ? (
            <Doughnut data={categoryData} />
          ) : (
            <p className="text-gray-500">No category data available</p>
          )}
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
          {analytics?.monthlyTrends?.length > 0 ? (
            <Bar data={monthlyData} />
          ) : (
            <p className="text-gray-500">No trend data available</p>
          )}
        </div>
      </div>

      {/* Network Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🌐 Network Intelligence Insights</h3>
        <div className="space-y-3">
          {analytics?.networkInsights?.map((insight, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              insight.type === 'positive' ? 'bg-green-50 border-l-4 border-green-400' :
              insight.type === 'suggestion' ? 'bg-blue-50 border-l-4 border-blue-400' :
              'bg-yellow-50 border-l-4 border-yellow-400'
            }`}>
              <p className="text-sm">{insight.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {analytics?.recentTransactions?.map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`font-semibold ${
                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount} DA
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
