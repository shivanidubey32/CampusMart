import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Mail, Phone, Loader2, Edit, Camera } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const { data } = await axios.get('/api/products/my-products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyProducts();
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      // Keep existing name/state/city/phone to pass validation if needed
      formData.append('name', user.name || '');
      formData.append('state', user.state || '');
      formData.append('city', user.city || '');
      formData.append('phone', user.phone || '');

      const res = await axios.put('/api/users/profile', formData);
      setUser({ ...user, ...res.data });
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/user/${user._id}`;
    const shareData = {
      title: `${user.name}'s Profile on CampusMart`,
      text: `Check out my profile and items for sale!`,
      url: url
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Public profile link copied to clipboard!');
    }
  };

  if (!user) return null;

  // Format joined date
  let joinedText = "Member since ";
  const createdAt = new Date(user.createdAt || Date.now());
  const now = new Date();
  const diffTime = Math.abs(now - createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    joinedText += "Today";
  } else if (diffDays === 2) {
    joinedText += "Yesterday";
  } else {
    joinedText += createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full bg-white md:bg-transparent">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar - Profile Details */}
        <aside className="w-full md:w-80 flex-shrink-0 bg-white p-6 rounded shadow-sm border border-gray-200">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4 border-2 border-white shadow-sm flex items-center justify-center relative">
                {uploadingAvatar ? (
                  <Loader2 className="animate-spin text-[#002f34]" size={32} />
                ) : user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  disabled={uploadingAvatar}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                />
              </div>
            </div>
            
            {/* Name */}
            <h1 className="text-2xl font-bold text-[#002f34] mb-2">{user.name}</h1>
            
            {/* Joined Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 justify-center md:justify-start">
              <Calendar size={16} />
              <span>{joinedText}</span>
            </div>

            {/* Followers */}
            <div className="flex items-center gap-4 text-sm font-bold text-[#002f34] mb-6 justify-center md:justify-start w-full border-b border-gray-100 pb-6">
              <span>0 <span className="font-normal text-gray-500">Followers</span></span>
              <span>0 <span className="font-normal text-gray-500">Following</span></span>
            </div>

            {/* Logged in with */}
            <div className="w-full text-left mb-6">
              <p className="text-xs font-bold text-[#002f34] mb-2">User logged in with</p>
              <div className="flex gap-2 text-gray-600">
                {user.email && <Mail size={20} />}
                {user.phone && <Phone size={20} />}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-4">
              <Link 
                to="/dashboard/settings" 
                className="w-full py-3 bg-[#002f34] hover:bg-[#001f24] text-white font-bold rounded text-center transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit Profile
              </Link>
              <button 
                onClick={handleShareProfile}
                className="w-full py-2 text-sm font-bold text-[#002f34] hover:underline transition-all"
              >
                Share Profile
              </button>
            </div>

          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 bg-white rounded shadow-sm border border-gray-200 min-h-[500px]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-[#002f34]" size={40} />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center pt-24">
              {/* Empty State Illustration */}
              <div className="w-64 h-48 mb-8 relative">
                {/* Abstract SVG replacing the image */}
                <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M50 100 L100 50 L150 100 L150 140 L50 140 Z" fill="#F0F2F5" />
                  <path d="M100 50 L150 100 L170 80 L120 30 Z" fill="#002f34" opacity="0.1" />
                  <circle cx="70" cy="120" r="15" fill="#002f34" />
                  <circle cx="130" cy="120" r="15" fill="#002f34" />
                  <path d="M70 120 L100 90 L130 120" stroke="#00a49f" strokeWidth="4" fill="none" />
                  <rect x="90" y="40" w="20" h="20" fill="#ffce32" transform="rotate(45 100 50)" />
                  <polygon points="120,40 140,80 100,80" fill="#3a77ff" />
                  <circle cx="150" cy="60" r="12" fill="#ff7e7e" />
                </svg>
              </div>
              
              <h2 className="text-[20px] font-bold text-[#002f34] mb-2">You haven't listed anything yet</h2>
              <p className="text-[#002f34] text-sm mb-8 opacity-80">Let go of what you don't use anymore</p>
              
              <Link 
                to="/dashboard/sell" 
                className="py-3 px-8 bg-[#002f34] hover:bg-[#001f24] text-white font-bold rounded shadow-md transition-colors"
              >
                Start selling
              </Link>
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#002f34] mb-6 border-b border-gray-100 pb-4">My Ads</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((item) => (
                  <Link key={item._id} to={`/dashboard/product/${item._id}`} className="bg-white border border-gray-200 rounded p-2 hover:shadow-md transition-shadow cursor-pointer group flex flex-col">
                    <div className="h-36 bg-gray-100 relative mb-2 rounded flex items-center justify-center overflow-hidden">
                      <img src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/400x300'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-yellow-400 rounded text-[10px] font-bold text-[#002f34]">
                        {item.status || 'ACTIVE'}
                      </div>
                    </div>
                    <div className="px-1 pb-1 flex-grow flex flex-col">
                      <h3 className="text-lg font-bold text-[#002f34] mb-1 leading-tight">₹ {item.price}</h3>
                      <p className="text-[#002f34] text-[13px] mb-3 line-clamp-2">{item.title}</p>
                      <div className="mt-auto flex justify-between items-center text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        <span className="truncate mr-2">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Profile;
