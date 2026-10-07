import { useState, useEffect } from 'react';
import { 
  HiOutlineBell, 
  HiOutlineChatAlt2, 
  HiOutlineCurrencyRupee, 
  HiCheck, 
  HiStar,
  HiOutlineInformationCircle
} from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { setUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getIconAndColor = (type) => {
    switch(type) {
      case 'request_accepted':
        return { icon: HiCheck, color: 'bg-green-100 text-green-600' };
      case 'new_message':
        return { icon: HiOutlineChatAlt2, color: 'bg-blue-100 text-blue-600' };
      case 'product_sold':
        return { icon: HiOutlineCurrencyRupee, color: 'bg-purple-100 text-purple-600' };
      case 'review_received':
        return { icon: HiStar, color: 'bg-yellow-100 text-yellow-600' };
      case 'new_request':
        return { icon: HiOutlineBell, color: 'bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]' };
      default:
        return { icon: HiOutlineInformationCircle, color: 'bg-gray-100 text-gray-600' };
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes || 1} min ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-[#002f34]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4 sm:px-0">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#002f34]">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated on your account activity.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-bold text-[var(--color-primary)] hover:text-cyan-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <HiOutlineBell className="text-6xl text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-[#002f34] mb-2">You're all caught up!</h3>
            <p className="text-gray-500">You don't have any notifications right now.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const { icon: Icon, color } = getIconAndColor(notif.type);
              return (
                <li 
                  key={notif._id} 
                  onClick={() => markAsRead(notif._id, notif.isRead)}
                  className={`p-6 flex gap-4 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm ${!notif.isRead ? 'font-extrabold text-[#002f34]' : 'font-bold text-gray-800'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className={`text-sm ${!notif.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="flex-shrink-0 self-center">
                      <div className="w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full"></div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
