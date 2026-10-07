import { useState, useEffect } from 'react';
import { HiOutlineShoppingCart, HiOutlineTrash, HiOutlineHeart } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { user, setUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('/api/users/wishlist');
      setWishlistItems(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { data } = await axios.put('/api/users/wishlist', { productId });
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
      setUser(prev => ({ ...prev, wishlist: data.wishlist }));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-[#002f34]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#002f34]">My Wishlist ❤️</h1>
        <p className="text-gray-500 text-sm mt-1">Keep track of the products you love and want to buy later.</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              
              <Link to={`/product/${item._id}`} className="block relative h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img src={item.images?.[0] || 'https://via.placeholder.com/300x200/f3f4f6/a1a1aa?text=No+Image'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {item.status === 'Sold' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded font-bold text-sm tracking-wider uppercase shadow-lg">Sold Out</span>
                  </div>
                )}
              </Link>
              
              <div className="flex-1 flex flex-col">
                <Link to={`/product/${item._id}`}>
                  <h3 className="font-bold text-[#002f34] mb-1 line-clamp-1 hover:text-[var(--color-primary)]">{item.title}</h3>
                </Link>
                <p className="text-sm font-semibold text-gray-500 mb-2">Seller: {item.seller?.name || 'Unknown'}</p>
                <h4 className="text-lg font-extrabold text-[var(--color-primary)] mb-4">₹ {item.price.toLocaleString()}</h4>
                
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button 
                    onClick={() => removeFromWishlist(item._id)}
                    className="flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                  >
                    <HiOutlineTrash className="text-lg" /> Remove
                  </button>
                  <Link 
                    to={`/product/${item._id}`}
                    className={`flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-white rounded border transition-colors ${item.status === 'Sold' ? 'bg-gray-400 border-gray-400 cursor-not-allowed' : 'bg-[var(--color-primary)] hover:bg-[#001f24] border-[var(--color-primary)]'}`}
                    onClick={(e) => { if(item.status === 'Sold') e.preventDefault(); }}
                  >
                    <HiOutlineShoppingCart className="text-lg" /> Buy Now
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
          <HiOutlineHeart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-[#002f34] mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Explore the marketplace and save items you like!</p>
          <Link to="/category/all products" className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-[#001f24] transition-colors">
            Explore Marketplace
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
