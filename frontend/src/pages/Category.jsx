import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categoriesList = [
  'All Products',
  'Books & Study Tools', 'Electronics & Gadgets', 'Hostel & Appliances', 'Bicycles & Mobility', 'Sports & Leisure'
];

const Category = () => {
  const { categoryName } = useParams();
  const { user, setUser } = useAuth();
  const isAuthenticated = !!user;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [wishlist, setWishlist] = useState(user?.wishlist || []);

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Find original case for API call
  const originalCategory = categoriesList.find(c => c.toLowerCase() === decodeURIComponent(categoryName).toLowerCase()) || decodeURIComponent(categoryName);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products/category/${encodeURIComponent(originalCategory)}?sort=${sort}`);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching category products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    fetchProducts();
  }, [originalCategory, sort]);

  const toggleWishlist = async (e, productId) => {
    e.preventDefault(); // prevent triggering the Link
    if (!isAuthenticated) return alert('Please login to add to wishlist');
    
    try {
      const res = await axios.put('/api/users/wishlist', { productId });
      setWishlist(res.data.wishlist);
      setUser(prev => ({ ...prev, wishlist: res.data.wishlist }));
    } catch (error) {
      console.error('Error updating wishlist', error);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#f2f4f5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2">Home / {originalCategory}</p>
          <div className="flex justify-between items-end">
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">
              {originalCategory}
            </h1>
            
            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--color-primary)] uppercase">Sort By:</span>
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border-b-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold py-1 outline-none cursor-pointer text-sm"
              >
                <option value="newest">Newly Published</option>
                <option value="price_asc">Lowest Price</option>
                <option value="price_desc">Highest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded p-3 shadow-sm animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded mb-4"></div>
                <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
                <div className="w-full h-48 bg-gray-100 relative">
                  <img 
                    src={product.images?.[0] || 'https://placehold.co/400x300?text=No+Image'} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button 
                    onClick={(e) => toggleWishlist(e, product._id)}
                    className={`absolute top-2 right-2 p-1.5 backdrop-blur rounded-full shadow-sm z-10 transition-colors ${wishlist.includes(product._id) ? 'text-red-500 bg-white/90' : 'bg-white hover:text-red-500 hover:bg-gray-50'}`}
                  >
                    <Heart size={18} fill={wishlist.includes(product._id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="font-bold text-[var(--color-primary)] text-xl mb-1">₹ {product.price.toLocaleString()}</h3>
                  <p className="text-gray-600 text-sm truncate mb-1">{product.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{product.condition}</p>
                  
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1 truncate max-w-[70%]">
                      <MapPin size={12} />
                      <span className="truncate">{product.pickupLocation?.city || product.pickupLocation?.college || 'Location unknown'}</span>
                    </div>
                    <span>{timeAgo(product.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded shadow-sm py-20 flex flex-col items-center justify-center text-center px-4">
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7359557-6024626.png" alt="Empty" className="w-48 mb-6 opacity-80" />
            <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">No items found</h3>
            <p className="text-gray-500 max-w-md">We couldn't find any products in the "{originalCategory}" category right now. Check back later!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Category;
