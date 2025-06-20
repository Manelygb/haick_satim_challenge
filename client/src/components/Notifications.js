import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Notifications({ socket }) {
  const [notifications, setNotifications] = useState([]);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    checkRealtimeAlerts();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      return () => socket.off('new_notification');
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRealtimeAlerts = async () => {
    try {
      const response = await axios.get('/api/notifications/realtime-check');
      setRealtimeAlerts(response.data);
    } catch (error) {
      console.error('Failed to check realtime alerts:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">🔔 Notifications</h2>
        
        {/* Real-time Alerts */}
        {realtimeAlerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">⚠️ Current Alerts</h3>
            <div className="space-y-3">
              {realtimeAlerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'urgent' ? 'bg-red-50 border-red-400' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <h4 className="font-semibold">{alert.title}</h4>
                  <p className="text-sm mt-1">{alert.message}</p>
                  {alert.suggestions && (
                    <div className="mt-2 space-x-2">
                      {alert.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="text-xs bg-white px-2 py-1 rounded border"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Notifications */}
        <div>
          <h3 className="text-lg font-semibold mb-3">📋 Recent Notifications</h3>
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded border ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
