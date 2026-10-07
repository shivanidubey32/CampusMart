import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineShare, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { Loader2, Phone, MessageCircle, ChevronRight, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showNumber, setShowNumber] = useState(false);
  const [wishlist, setWishlist] = useState(user?.wishlist || []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        
        // Fetch similar products
        if (data.category) {
          const similarRes = await axios.get(`/api/products/similar/${encodeURIComponent(data.category)}?exclude=${id}`);
          setSimilarProducts(similarRes.data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[70vh]">
        <Loader2 className="animate-spin text-[#002f34]" size={40} />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-24 font-bold text-xl text-[#002f34]">Product not found</div>;
  }

  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.url ? img.url : img)
    : ['https://via.placeholder.com/800x600/f3f4f6/a1a1aa?text=No+Image'];

  const handleChat = () => {
    if (!user) {
      toast.error('Please login to chat');
      navigate('/login');
      return;
    }
    if (user._id === product.seller._id) {
      toast.error('You cannot chat with yourself');
      return;
    }
    navigate('/dashboard/messages', { state: { receiverId: product.seller._id, productId: product._id } });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this ${product.title} on CampusMart AI!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save items');
      navigate('/login');
      return;
    }
    try {
      const { data } = await axios.put('/api/users/wishlist', { productId: product._id });
      setWishlist(data.wishlist);
      setUser(prev => ({ ...prev, wishlist: data.wishlist }));
      if (data.wishlist.includes(product._id)) {
        toast.success('Saved to wishlist');
      } else {
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const memberSince = (dateString) => {
    if (!dateString) return 'Member';
    const date = new Date(dateString);
    return `Member since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 min-h-screen">
      
      {/* Breadcrumbs */}
      <div className="text-xs text-gray-500 flex items-center gap-2 mb-4 pb-2">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <Link to="/dashboard/marketplace" className="hover:underline">Marketplace</Link>
        <ChevronRight size={14} />
        <span className="text-[#002f34]">{product.category}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Column: Images, Details, Description */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          
          {/* Image Gallery (OLX Style - Black Background) */}
          <div className="bg-black rounded border border-gray-200 overflow-hidden relative group h-[450px] flex items-center justify-center">
            <img 
              src={images[activeImage]} 
              alt="Product" 
              className="max-w-full max-h-full object-contain" 
            />
            
            {images.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => setActiveImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                >
                  <HiOutlineChevronLeft className="text-2xl" />
                </button>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => setActiveImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                >
                  <HiOutlineChevronRight className="text-2xl" />
                </button>
              </>
            )}

            {/* Thumbnail dots/images at bottom */}
            {images.length > 1 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                 {images.map((_, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveImage(idx)}
                     className={`w-16 h-12 rounded border-2 overflow-hidden ${activeImage === idx ? 'border-white opacity-100' : 'border-transparent opacity-50'}`}
                   >
                     <img src={images[idx]} className="w-full h-full object-cover" />
                   </button>
                 ))}
               </div>
            )}
          </div>

          {/* Details Section */}
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-[#002f34] mb-6">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex justify-between md:justify-start md:gap-16 border-b border-gray-100 pb-2 md:border-none md:pb-0">
                <span className="text-gray-500 w-24">Brand</span>
                <span className="font-bold text-[#002f34]">{product.brand || 'N/A'}</span>
              </div>
              <div className="flex justify-between md:justify-start md:gap-16 border-b border-gray-100 pb-2 md:border-none md:pb-0">
                <span className="text-gray-500 w-24">Condition</span>
                <span className="font-bold text-[#002f34]">{product.condition}</span>
              </div>
              <div className="flex justify-between md:justify-start md:gap-16 border-b border-gray-100 pb-2 md:border-none md:pb-0">
                <span className="text-gray-500 w-24">Category</span>
                <span className="font-bold text-[#002f34]">{product.category}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm mb-8 lg:mb-0">
            <h2 className="text-xl font-bold text-[#002f34] mb-4">Description</h2>
            <div className="text-[#002f34] text-sm whitespace-pre-wrap leading-relaxed">
              {product.description}
            </div>
          </div>
          
        </div>

        {/* Right Column: Price & Actions, Seller Info, Location */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          
          {/* Price & Title Card */}
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-4xl font-extrabold text-[#002f34] tracking-tight">₹ {product.price}</h1>
              <div className="flex items-center gap-4 text-[#002f34]">
                <button onClick={handleShare} className="hover:text-blue-600 transition-colors">
                  <HiOutlineShare size={24} />
                </button>
                <button onClick={toggleWishlist} className="hover:text-red-500 transition-colors">
                  {wishlist.includes(product._id) ? <FaHeart size={22} className="text-red-500" /> : <HiOutlineHeart size={24} />}
                </button>
              </div>
            </div>
            
            <p className="text-base text-gray-600 mb-6 line-clamp-2">
              {product.title}
            </p>
            
            <div className="flex justify-between items-center text-xs text-gray-500 font-semibold mt-auto pt-4">
              <span className="truncate max-w-[70%]">{product.pickupLocation?.college || 'Unknown Location'}, {product.pickupLocation?.hostel}</span>
              <span>{timeAgo(product.createdAt)}</span>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm flex flex-col items-center">
            <div className="flex justify-between w-full items-start mb-6">
              <div className="flex items-center gap-3 w-full">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img src={product.seller?.avatar || 'https://via.placeholder.com/150'} alt={product.seller?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">Posted By</p>
                  <h3 className="font-bold text-[#002f34] text-lg leading-tight flex items-center justify-between w-full">
                    {product.seller?.name || 'Seller'}
                    <ChevronRight size={20} className="text-gray-400 cursor-pointer hover:text-[#002f34]" onClick={() => navigate(`/user/${product.seller?._id}`)} />
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{memberSince(product.seller?.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleChat}
              className="w-full bg-white border-2 border-[#002f34] text-[#002f34] hover:border-4 font-bold py-3 rounded transition-all flex justify-center items-center gap-2 mb-4"
            >
              <MessageCircle size={20} />
              Chat with seller
            </button>
            
            {product.sellerPhone || product.seller?.phone ? (
              <div className="w-full flex items-center justify-center">
                {showNumber ? (
                  <a href={`tel:${product.sellerPhone || product.seller.phone}`} className="flex items-center gap-2 text-[#002f34] font-bold text-lg hover:underline">
                    <Phone size={20} /> {product.sellerPhone || product.seller.phone}
                  </a>
                ) : (
                  <button 
                    onClick={() => setShowNumber(true)}
                    className="flex items-center gap-2 text-blue-600 font-bold hover:underline"
                  >
                    <Phone size={18} /> ** *** **** <span className="text-sm font-normal underline ml-1">Show number</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* Location Card */}
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
            <h3 className="font-bold text-[#002f34] text-lg mb-4">Posted in</h3>
            <div className="text-sm text-gray-600 flex items-start gap-2 mb-4">
              <MapPin size={18} className="text-[#002f34] mt-0.5 flex-shrink-0" />
              <span>
                {[
                  product.pickupLocation?.address,
                  product.pickupLocation?.college,
                  product.pickupLocation?.hostel,
                  product.pickupLocation?.city,
                  product.pickupLocation?.state
                ].filter(Boolean).join(', ') || 'Location unknown'}
              </span>
            </div>
            
            {/* Google Map Embedded */}
            <div className="w-full h-48 bg-gray-200 rounded overflow-hidden relative flex items-center justify-center group">
              {product.pickupLocation?.latitude && product.pickupLocation?.longitude ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${product.pickupLocation.latitude},${product.pickupLocation.longitude}&z=14&output=embed`}
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  <img src="https://via.placeholder.com/400x200?text=No+Coordinates+Provided" alt="Map" className="w-full h-full object-cover opacity-60" />
                  <MapPin size={32} className="text-gray-500 absolute" />
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#002f34] mb-6 border-b border-gray-200 pb-2">Similar Ads</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarProducts.map(sim => (
              <Link to={`/product/${sim._id}`} key={sim._id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
                <div className="w-full h-48 bg-gray-100 relative">
                  <img 
                    src={sim.images?.[0] || 'https://placehold.co/400x300?text=No+Image'} 
                    alt={sim.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="font-bold text-[#002f34] text-xl mb-1">₹ {sim.price.toLocaleString()}</h3>
                  <p className="text-gray-600 text-sm truncate mb-1">{sim.title}</p>
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate">{sim.pickupLocation?.city || sim.pickupLocation?.college || 'Unknown'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
