import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, BookOpen, Package, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${id}`);
        setProfile(res.data.user);
        setProducts(res.data.products);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${profile?.name}'s Profile on CampusMart`,
      text: `Check out ${profile?.name}'s profile and items for sale!`,
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
      toast.success('Profile link copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><h2 className="text-2xl font-bold text-gray-500">User not found</h2></div>;
  }

  return (
    <div className="max-w-5xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-32 bg-[var(--color-primary)] relative">
          <button 
            onClick={handleShare}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors flex items-center gap-2"
          >
            <Share2 size={18} />
            <span className="text-sm font-medium pr-1">Share</span>
          </button>
        </div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative shrink-0">
              <img src={profile.avatar || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
              <p className="text-gray-500 font-medium">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {profile.bio && (
              <div className="col-span-full">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{profile.bio}</p>
              </div>
            )}
            
            <div className="flex items-start gap-3 text-gray-600">
              <BookOpen className="text-[var(--color-primary)] mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Academic Details</p>
                <p>{profile.college || 'N/A'}</p>
                <p>{profile.branch ? `${profile.branch}, ${profile.semester} Semester` : ''}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="text-[var(--color-primary)] mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Location</p>
                <p>{profile.city && profile.state ? `${profile.city}, ${profile.state}` : (profile.city || profile.state || 'N/A')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Listings */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="text-[var(--color-primary)]" />
          Active Listings ({products.length})
        </h2>
        
        {products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-lg">No active listings at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <Link to={`/dashboard/product/${product._id}`} key={product._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img src={product.images[0]?.url || 'https://via.placeholder.com/300'} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 flex-1">{product.title}</h3>
                    <span className="font-bold text-[var(--color-primary)] whitespace-nowrap ml-2">₹{product.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-3">{product.description}</p>
                  <p className="text-xs text-gray-400 mt-auto">{new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
