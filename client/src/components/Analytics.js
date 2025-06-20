import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Analytics() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get('/api/analytics/predictions');
      setPredictions(response.data);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">📈 Advanced Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Next Week Prediction</h3>
            <p className="text-3xl font-bold text-blue-600">
              {predictions?.nextWeekPrediction?.toFixed(0) || 0} DA
            </p>
            <p className="text-sm text-blue-600 mt-2">Estimated spending</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Monthly Forecast</h3>
            <p className="text-3xl font-bold text-green-600">
              {predictions?.nextMonthPrediction?.toFixed(0) || 0} DA
            </p>
            <p className="text-sm text-green-600 mt-2">Projected spending</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🎯 Personalized Recommendations</h3>
        <div className="space-y-3">
          {predictions?.recommendations?.map((recommendation, index) => (
            <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <p className="text-blue-800">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🌐 Network Intelligence Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800">Cross-Bank Insights</h4>
            <p className="text-sm text-purple-600 mt-2">
              Compare your spending patterns with similar users across the SATIM network
            </p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-800">Cultural Banking AI</h4>
            <p className="text-sm text-indigo-600 mt-2">
              AI trained on Algerian financial behaviors and cultural patterns
            </p>
          </div>
          
          <div className="bg-teal-50 p-4 rounded-lg">
            <h4 className="font-semibold text-teal-800">Predictive Optimization</h4>
            <p className="text-sm text-teal-600 mt-2">
              Smart recommendations based on network-wide transaction patterns
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">📊 Key Performance Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-satim-blue">92%</p>
            <p className="text-sm text-gray-600">Prediction Accuracy</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-satim-green">15%</p>
            <p className="text-sm text-gray-600">Cost Savings</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">85%</p>
            <p className="text-sm text-gray-600">User Satisfaction</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">45s</p>
            <p className="text-sm text-gray-600">Avg Response Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
