import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Heart, MapPin, MessageCircle, Eye, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SearchResults = () => {
  const { user, setUser } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(user?.wishlist || []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setQuery(q);

    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products/search?q=${encodeURIComponent(q)}`);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) return alert('Please login to add to wishlist');
    
    try {
      const res = await axios.put('/api/users/wishlist', { productId });
      setWishlist(res.data.wishlist);
      setUser(prev => ({ ...prev, wishlist: res.data.wishlist }));
    } catch (error) {
      console.error('Error updating wishlist', error);
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

  const highlightMatch = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <strong key={i} className="text-[var(--color-primary)] bg-yellow-100 px-0.5 rounded">{part}</strong> : part
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary)] mb-2">
          {query ? `Search Results for "${query}"` : 'All Products'}
        </h1>
        <p className="text-[var(--color-text-muted)] font-medium">
          Found {products.length} {products.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 space-y-4">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
          <p className="text-[var(--color-text-muted)] font-bold">Searching campus...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
              
              {/* Image Box */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/300'} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Wishlist Button */}
                <button 
                  onClick={() => toggleWishlist(product._id)}
                  className={`absolute top-3 right-3 p-2 backdrop-blur rounded-full transition-all shadow-sm ${wishlist.includes(product._id) ? 'text-red-500 bg-white/90' : 'text-[var(--color-text-muted)] bg-[var(--color-bg-card)]/80 hover:text-red-500 hover:bg-white'}`}
                >
                  <Heart size={18} fill={wishlist.includes(product._id) ? 'currentColor' : 'none'} />
                </button>
                
                {/* Condition Badge */}
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-[var(--color-bg-card)]/90 backdrop-blur rounded text-xs font-bold text-[var(--color-text-main)] border border-[var(--color-border)]">
                  {product.condition}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-[var(--color-text-main)] text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
                  {highlightMatch(product.title, query)}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-extrabold text-[var(--color-primary)]">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-[var(--color-text-muted)] line-through">₹{product.originalPrice}</span>
                  )}
                </div>

                {/* Location & Time Posted */}
                <div className="mt-auto space-y-2 border-t border-[var(--color-border)] pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <MapPin size={14} className="text-[var(--color-primary)]" />
                    <span className="truncate">
                      {[product.pickupLocation?.city, product.pickupLocation?.state].filter(Boolean).join(', ') || 'Location unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <Clock size={14} className="text-[var(--color-primary)]" />
                    <span className="truncate">{timeAgo(product.createdAt)}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to={`/dashboard/messages?user=${product.seller?._id}`} 
                      className="w-full flex items-center justify-center gap-1 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-gray-50 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <MessageCircle size={16} /> Chat
                    </Link>
                    <Link 
                      to={`/dashboard/product/${product._id}`} 
                      className="w-full flex items-center justify-center gap-1 bg-[var(--color-primary)] hover:bg-[#001f24] text-white py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <Eye size={16} /> View
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="col-span-2 w-full text-center bg-[var(--color-primary)] hover:opacity-90 text-white py-2 rounded-lg text-sm font-bold transition-opacity"
                  >
                    Login to View
                  </Link>
                )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <SearchIcon />
          <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">No products found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We couldn't find any matches for "{query}". Try checking your spelling or using more general terms.
          </p>
          <button 
            onClick={() => {
              setQuery('');
              navigate('/search');
            }}
            className="mt-6 bg-[var(--color-primary)] text-white px-6 py-2.5 rounded hover:bg-[#001f24] font-bold"
          >
            Clear Search
          </button>
        </div>
      )}

    </div>
  );
};

const SearchIcon = () => (
  <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default SearchResults;
