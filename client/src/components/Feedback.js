import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Feedback() {
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
    transactionId: null
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/feedback/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch feedback analytics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/feedback', {
        ...feedback,
        experience: 'demo_experience'
      });
      setSubmitted(true);
      setFeedback({ rating: 5, comment: '', transactionId: null });
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFeedback({
      ...feedback,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">💬 Feedback Center</h2>
        
        {/* Feedback Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Share Your Experience</h3>
          
          {submitted && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">✅ Thank you for your feedback! This helps improve our service.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Your Experience
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    className={`text-2xl ${
                      star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {feedback.rating === 5 ? 'Excellent!' :
                 feedback.rating === 4 ? 'Very Good' :
                 feedback.rating === 3 ? 'Good' :
                 feedback.rating === 2 ? 'Fair' : 'Needs Improvement'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                name="comment"
                value={feedback.comment}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-satim-blue focus:border-satim-blue"
                placeholder="Tell us about your experience with the SATIM platform..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* Analytics Dashboard */}
        {analytics && (
          <div>
            <h3 className="text-lg font-semibold mb-4">📊 Feedback Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-blue-800 font-semibold">Average Rating</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.analytics?.average_rating?.toFixed(1) || 'N/A'}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-green-800 font-semibold">Satisfaction Rate</h4>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.analytics?.satisfaction_rate || 'N/A'}%
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-purple-800 font-semibold">Total Feedback</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.analytics?.total_feedback || 0}
                </p>
              </div>
            </div>

            {/* Insights */}
            <div>
              <h4 className="font-semibold mb-3">💡 Key Insights</h4>
              <div className="space-y-2">
                {analytics.insights?.map((insight, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Feedback */}
            {analytics.recentFeedback?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Recent Feedback</h4>
                <div className="space-y-2">
                  {analytics.recentFeedback.slice(0, 3).map((fb) => (
                    <div key={fb.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-400">
                              {'⭐'.repeat(fb.rating)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {fb.user_name}
                            </span>
                          </div>
                          {fb.comment && (
                            <p className="text-sm mt-1">{fb.comment}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;
