import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaRegHeart } from 'react-icons/fa';
import { Heart, Filter, MapPin, Clock, Eye, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, setUser } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [priceRange, setPriceRange] = useState(50000);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(user?.wishlist || []);

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

  // Sync category from URL on mount and when it changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory('All Products');
    }
  }, [location.search]);

  // Update URL when category changes via sidebar
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const queryParams = new URLSearchParams(location.search);
    if (cat === 'All Products') {
      queryParams.delete('category');
    } else {
      queryParams.set('category', cat);
    }
    navigate({ search: queryParams.toString() }, { replace: true });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products?category=${encodeURIComponent(selectedCategory)}`);
        setFetchedProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

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

  const toggleCondition = (cond) => {
    setSelectedConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  // Filter products locally based on sidebars
  const filteredProducts = fetchedProducts.filter(p => {
    // 1. Price check
    if (p.price > priceRange) return false;
    
    // 2. Condition check
    if (selectedConditions.length > 0 && !selectedConditions.includes(p.condition)) return false;
    
    return true;
  });

  return (
    <div className="w-full bg-[var(--color-bg-main)] min-h-screen pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 h-full">
          
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex justify-between items-center bg-white p-4 rounded border border-gray-200">
            <h2 className="font-bold text-[var(--color-text-main)]">Filters</h2>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 bg-gray-50 rounded border border-gray-200">
              <Filter size={18} className="text-[var(--color-text-main)]" />
            </button>
          </div>

          {/* LEFT SIDEBAR: Filters */}
          <aside className={`w-full md:w-64 lg:w-72 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden'} md:block space-y-6`}>
            
            {/* Categories */}
            <div className="bg-white rounded border border-gray-200 p-5">
              <h3 className="font-bold text-[var(--color-text-main)] mb-4 uppercase tracking-wider text-sm flex items-center gap-2 border-b border-gray-200 pb-2">
                Categories
              </h3>
              <ul className="space-y-3">
                {['All Products', 'Books & Study Tools', 'Electronics & Gadgets', 'Hostel & Appliances', 'Bicycles & Mobility', 'Sports & Leisure'].map(cat => (
                  <li key={cat}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => handleCategoryChange(cat)}
                        className="w-4 h-4 rounded-full border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                      />
                      <span className={`text-sm transition-colors ${selectedCategory === cat ? 'text-[var(--color-primary)] font-bold' : 'text-gray-500 group-hover:text-gray-900'}`}>{cat}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Slider */}
            <div className="bg-white rounded border border-gray-200 p-5">
              <h3 className="font-bold text-[var(--color-text-main)] mb-4 uppercase tracking-wider text-sm border-b border-gray-200 pb-2">
                Price Range
              </h3>
              <div className="mb-4">
                <span className="text-[var(--color-primary)] font-bold text-lg">₹ 0 - ₹ {priceRange}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100000" 
                step="500"
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>₹0</span>
                <span>₹1,00,000+</span>
              </div>
            </div>

            {/* Condition Filter */}
            <div className="bg-white rounded border border-gray-200 p-5">
              <h3 className="font-bold text-[var(--color-text-main)] mb-4 uppercase tracking-wider text-sm border-b border-gray-200 pb-2">
                Condition
              </h3>
              <ul className="space-y-3">
                {['Like New', 'Good', 'Fair', 'Needs Repair'].map(cond => (
                  <li key={cond}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedConditions.includes(cond)}
                        onChange={() => toggleCondition(cond)}
                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                      />
                      <span className="text-sm text-gray-500 group-hover:text-gray-900">{cond}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
          </aside>

          {/* RIGHT SIDE: Products Grid */}
          <main className="flex-1">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-primary)]">
                  {selectedCategory === 'All Products' ? 'Fresh Recommendations' : selectedCategory}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Showing {filteredProducts.length} items</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product._id} className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col group cursor-pointer" onClick={() => {
                    if (isAuthenticated) navigate(`/dashboard/product/${product._id}`);
                    else navigate('/login');
                  }}>
                    
                    {/* Image Box */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      <img 
                        src={product.images?.[0] || 'https://via.placeholder.com/300'} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Wishlist Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product._id);
                        }}
                        className={`absolute top-3 right-3 p-2 backdrop-blur rounded-full transition-all shadow-sm ${wishlist.includes(product._id) ? 'text-red-500 bg-white/90' : 'text-gray-500 bg-white/80 hover:text-red-500 hover:bg-white'}`}
                      >
                        <Heart size={18} fill={wishlist.includes(product._id) ? 'currentColor' : 'none'} />
                      </button>
                      
                      {/* Condition Badge */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur rounded text-xs font-bold text-gray-800 border border-gray-200">
                        {product.condition}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl font-extrabold text-[var(--color-primary)]">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
                        {product.title}
                      </h3>

                      {/* Location & Time Posted */}
                      <div className="mt-auto space-y-2 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin size={14} className="text-[var(--color-primary)]" />
                          <span className="truncate">
                            {[product.pickupLocation?.city, product.pickupLocation?.state].filter(Boolean).join(', ') || 'Location unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={14} className="text-[var(--color-primary)]" />
                          <span className="truncate">{timeAgo(product.createdAt)}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Filter size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No items found</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  We couldn't find any items matching your current filters. Try adjusting your price range or categories.
                </p>
                <button 
                  onClick={() => {
                    setSelectedCategory('All Products');
                    setPriceRange(50000);
                    setSelectedConditions([]);
                  }}
                  className="mt-6 text-[var(--color-primary)] font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
