import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Filter, ChevronDown, MapPin, GraduationCap, Star, Loader2, Eye, MessageCircle, Clock } from 'lucide-react';
import axios from 'axios';

const Marketplace = () => {
  const { user, setUser } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [priceRange, setPriceRange] = useState(50000);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All Cities');  
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
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto h-full pb-12">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)]">
        <h2 className="font-bold text-[var(--color-text-main)]">Filters</h2>
        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 bg-[var(--color-bg-hover)] rounded border border-[var(--color-border)]">
          <Filter size={18} className="text-[var(--color-text-main)]" />
        </button>
      </div>

      {/* LEFT SIDEBAR: Filters */}
      <aside className={`w-full md:w-64 lg:w-72 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden'} md:block space-y-6`}>
        
        {/* Categories */}
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
          <h3 className="font-bold text-[var(--color-text-main)] mb-4 uppercase tracking-wider text-sm flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
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
                    className="w-4 h-4 rounded-full border-[var(--color-border)] bg-[var(--color-bg-main)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-bg-card)]" 
                  />
                  <span className={`text-sm transition-colors ${selectedCategory === cat ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]'}`}>{cat}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Slider */}
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
          <h3 className="font-bold text-[var(--color-text-main)] mb-4 uppercase tracking-wider text-sm border-b border-[var(--color-border)] pb-2">
            Price Range
          </h3>
          <div className="mb-4">
            <span className="text-[var(--color-primary)] font-bold text-lg">₹ 0 - ₹ {priceRange}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="50000" 
            step="500"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-[var(--color-primary)] bg-[var(--color-bg-main)] h-2 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-2">
            <span>₹ 0</span>
            <span>₹ 50k+</span>
          </div>
        </div>

        {/* Condition */}
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
          <h3 className="font-bold text-[var(--color-text-main)] mb-4 uppercase tracking-wider text-sm border-b border-[var(--color-border)] pb-2">
            Condition
          </h3>
          <ul className="space-y-3">
            {['Brand New', 'Like New', 'Good', 'Fair', 'Needs Repair'].map(cond => (
              <li key={cond}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedConditions.includes(cond)}
                    onChange={() => toggleCondition(cond)}
                    className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg-main)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-bg-card)]" 
                  />
                  <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors">{cond}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Location & College */}
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
          <h3 className="font-bold text-[var(--color-text-main)] mb-4 uppercase tracking-wider text-sm border-b border-[var(--color-border)] pb-2">
            Location
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">City</label>
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-main)] focus:border-[var(--color-primary)] outline-none"
              >
                <option value="All Cities">All Cities</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>
          </div>
        </div>

      </aside>

      {/* RIGHT SIDE: Product Grid */}
      <section className="flex-1">
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)] mb-6">
          <p className="text-[var(--color-text-muted)] text-sm mb-2 sm:mb-0">
            Showing <span className="font-bold text-[var(--color-text-main)]">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Sort by:</span>
            <select className="bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text-main)] focus:border-[var(--color-primary)] outline-none">
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        {/* 4-Column Grid on Desktop */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-2">No products found</h3>
            <p className="text-[var(--color-text-muted)]">Try adjusting your filters or category selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden flex flex-col group hover:border-[var(--color-primary)] transition-colors">
                
                {/* Image Box */}
                <div className="relative h-48 bg-[var(--color-bg-main)] overflow-hidden">
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x300'} 
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
                    {product.title}
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
                      Login to Interact
                    </Link>
                  )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-main)] transition-colors">Previous</button>
            <button className="px-4 py-2 border border-[var(--color-primary)] bg-[var(--color-primary)] rounded-lg text-sm font-bold text-white">1</button>
            <button className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-main)] transition-colors">2</button>
            <button className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-main)] transition-colors">3</button>
            <button className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-main)] transition-colors">Next</button>
          </nav>
        </div>

      </section>
    </div>
  );
};

export default Marketplace;
