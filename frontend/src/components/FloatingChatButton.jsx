import { MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingChatButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the button if not logged in
  if (!user) return null;

  // Don't show the button if we are already on the messages page
  if (location.pathname === '/dashboard/messages') return null;

  return (
    <button
      onClick={() => navigate('/dashboard/messages')}
      className="fixed bottom-6 right-6 z-50 bg-[var(--color-primary)] hover:bg-[#001f24] text-white p-4 rounded-full shadow-lg shadow-gray-400 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
      title="Open Messages"
    >
      <MessageCircle size={28} />
      
      {/* Optional: Add a pulse indicator for unread messages if you fetch them globally */}
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
    </button>
  );
};

export default FloatingChatButton;
