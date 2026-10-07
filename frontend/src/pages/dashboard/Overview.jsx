import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, ChevronDown, Filter, MessageSquare, User, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineShare, HiOutlineEye, HiOutlineHeart } from 'react-icons/hi';
import { FaRegCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Overview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState('Ads');
  const [activeSubTab, setActiveSubTab] = useState('Active');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Any category');
  const [sortBy, setSortBy] = useState('Newest');

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
        toast.success('Ad deleted successfully');
      } catch (error) {
        toast.error('Failed to delete ad');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`/api/products/${id}/status`, { status: newStatus });
      setProducts(products.map(p => p._id === id ? { ...p, status: newStatus } : p));
      toast.success(`Ad marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const mainTabs = [
    { id: 'Ads', label: 'Ads', icon: null },
    { id: 'Messages', label: 'Messages', icon: <MessageSquare size={16} />, path: '/dashboard/messages' },
    { id: 'Payments', label: 'Payments', icon: <CreditCard size={16} />, path: '#' },
    { id: 'Profile', label: 'Profile', icon: <User size={16} />, path: '/dashboard/profile' },
    { id: 'PersonalData', label: 'Personal data', icon: <SettingsIcon size={16} />, path: '/dashboard/settings' },
  ];

  const subTabs = [
    { id: 'Active', label: 'Active', count: products.filter(p => p.status === 'available' || !p.status).length },
    { id: 'Pending', label: 'Pending', count: 0 },
    { id: 'ToPay', label: 'To pay', count: 0 },
    { id: 'Finished', label: 'Finished', count: products.filter(p => p.status === 'sold').length },
  ];

  const filteredProducts = products.filter(p => {
    // 1. Sub-tab filter
    const status = p.status || 'available';
    if (activeSubTab === 'Active' && status !== 'available') return false;
    if (activeSubTab === 'Finished' && status !== 'sold') return false;
    if (activeSubTab === 'Pending' || activeSubTab === 'ToPay') return false;

    // 2. Category filter
    if (filterCategory !== 'Any category' && p.category !== filterCategory) return false;

    // 3. Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p._id.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 bg-white min-h-[80vh] shadow-sm border border-gray-200">
      
      {/* Top Header */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-extrabold text-[#002f34]">Your ads</h1>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-gray-200 px-6 overflow-x-auto">
        <ul className="flex items-center gap-8 whitespace-nowrap">
          {mainTabs.map(tab => (
            <li key={tab.id}>
              <button 
                onClick={() => {
                  if (tab.path && tab.path !== '#') {
                    navigate(tab.path);
                  } else {
                    setActiveMainTab(tab.id);
                  }
                }}
                className={`pb-4 flex items-center gap-2 font-bold text-sm transition-colors border-b-4 ${
                  activeMainTab === tab.id 
                    ? 'border-[#002f34] text-[#002f34]' 
                    : 'border-transparent text-gray-500 hover:text-[#002f34]'
                }`}
              >
                {tab.icon && tab.icon}
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Blue Banner */}
      <div className="bg-[#e8f4f8] m-6 p-4 rounded text-sm text-[#002f34] flex items-center border border-blue-100">
        <span className="font-medium">
          Manage all your listings from here. Reach out to buyers quickly and securely!
        </span>
      </div>

      {/* Sub Tabs */}
      <div className="px-6 border-b border-gray-200">
        <ul className="flex items-center gap-6">
          {subTabs.map(tab => (
            <li key={tab.id}>
              <button 
                onClick={() => setActiveSubTab(tab.id)}
                className={`pb-4 font-bold text-sm transition-colors border-b-[3px] ${
                  activeSubTab === tab.id 
                    ? 'border-[#002f34] text-[#002f34]' 
                    : 'border-transparent text-gray-500 hover:text-[#002f34]'
                }`}
              >
                {tab.label} {tab.count > 0 && <span className="text-gray-400 font-normal ml-1">({tab.count})</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Filters & Search */}
      <div className="px-6 py-4 flex flex-col md:flex-row gap-4 items-center border-b border-gray-100 bg-gray-50/50">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded text-[#002f34] font-bold text-sm hover:border-[#002f34] transition-colors w-full md:w-auto">
          <Filter size={16} /> Add filter
        </button>
        
        <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded pl-10 pr-4 py-2 text-sm focus:border-[#002f34] outline-none"
            />
          </div>
          <div className="w-full md:w-48 relative">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-sm appearance-none focus:border-[#002f34] outline-none"
            >
              <option>Any category</option>
              <option>Books & Study Tools</option>
              <option>Electronics & Gadgets</option>
              <option>Hostel & Appliances</option>
              <option>Bicycles & Mobility</option>
              <option>Sports & Leisure</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} pointerEvents="none" />
          </div>
          <div className="w-full md:w-48 relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-sm appearance-none focus:border-[#002f34] outline-none"
            >
              <option>Sort by</option>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} pointerEvents="none" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002f34]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State Illustration */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-48 h-48 mb-6 relative">
              {/* Custom SVG combining OLX style elements (bike, house, geometry) */}
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Yellow House */}
                <polygon points="100,50 140,80 140,120 100,120 60,120 60,80" fill="#fce041" />
                <polygon points="100,50 140,80 60,80" fill="#2a3f54" opacity="0.1" />
                <rect x="90" y="90" width="20" height="30" fill="#fff" />
                
                {/* Cyan Polygon */}
                <polygon points="140,100 170,120 160,160 130,140" fill="#00d5ff" />
                
                {/* Red Circle */}
                <circle cx="80" cy="160" r="20" fill="#ff7e7e" />
                
                {/* Bicycle */}
                <circle cx="80" cy="140" r="16" fill="none" stroke="#002f34" strokeWidth="6" />
                <circle cx="130" cy="140" r="16" fill="none" stroke="#002f34" strokeWidth="6" />
                <line x1="80" y1="140" x2="110" y2="140" stroke="#002f34" strokeWidth="6" />
                <line x1="95" y1="140" x2="90" y2="110" stroke="#002f34" strokeWidth="6" />
                <line x1="110" y1="140" x2="120" y2="110" stroke="#002f34" strokeWidth="6" />
                <line x1="120" y1="110" x2="90" y2="110" stroke="#002f34" strokeWidth="6" />
                <line x1="120" y1="110" x2="130" y2="140" stroke="#002f34" strokeWidth="6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#002f34] mb-2">No matching ads found</h2>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
            <button onClick={() => { setSearchQuery(''); setFilterCategory('Any category'); setSortBy('Newest'); }} className="bg-[#002f34] text-white font-bold py-3 px-8 rounded hover:bg-[#001f24] transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          /* Active Listings List View */
          <div className="flex flex-col gap-4">
            {filteredProducts.map(item => (
              <div key={item._id} className="border border-gray-200 rounded p-4 flex flex-col md:flex-row gap-6 hover:shadow-sm transition-shadow">
                {/* Image */}
                <div className="w-full md:w-48 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                  <img src={item.images && item.images.length > 0 ? (item.images[0].url || item.images[0]) : 'https://via.placeholder.com/200'} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-yellow-400 text-[#002f34] text-[10px] font-bold px-2 py-1 rounded uppercase">
                    {item.status || 'Active'}
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-[#002f34] line-clamp-1">{item.title}</h3>
                    <h3 className="text-xl font-extrabold text-[var(--color-primary)] whitespace-nowrap ml-4">₹ {item.price}</h3>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {item.description}
                  </div>
                  
                  <div className="mt-auto flex flex-wrap gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <span>Listed: {new Date(item.createdAt).toLocaleDateString()}</span>
                    <span>Views: 0</span>
                    <span>Likes: 0</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-center md:border-l md:border-gray-100 md:pl-6 md:min-w-[150px]">
                  <Link to={`/dashboard/product/${item._id}`} className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors w-full">
                    <HiOutlineEye size={16} /> View
                  </Link>
                  {item.status !== 'sold' && (
                    <button 
                      onClick={() => handleStatusChange(item._id, 'sold')}
                      className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors w-full"
                    >
                      <FaRegCheckCircle size={16} /> Mark Sold
                    </button>
                  )}
                  {item.status === 'sold' && (
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors w-full"
                    >
                      <HiOutlineTrash size={16} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
