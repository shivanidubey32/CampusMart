import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiSearch, HiOutlineHeart, HiOutlineLocationMarker, HiChevronDown, HiOutlineBell, HiOutlineChat } from 'react-icons/hi';
import { BiUserCircle } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    "Books & Study Tools", "Electronics & Gadgets", "Hostel & Appliances", "Bicycles & Mobility", "Sports & Leisure"
  ];

  return (
    <div className="fixed w-full z-50 flex flex-col bg-[#f7f8f9] shadow-sm">
      {/* Top Navbar */}
      <nav className="bg-[#f7f8f9] border-b border-gray-200 py-2">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="CampusMart AI Logo" className="h-10 w-auto object-contain rounded-xl shadow-sm" />
                <span className="text-3xl font-black tracking-tighter text-[#8B4513] drop-shadow-sm">
                  CampusMart <span className="font-light italic text-[#A0522D] drop-shadow-none">AI</span>
                </span>
              </Link>
            </div>

            {/* Main Search Bar */}
            <SearchBar isMobile={false} />

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-6 font-bold text-[var(--color-primary)]">
              <button className="flex items-center gap-1 hover:underline underline-offset-4 decoration-2">
                <span className="text-[15px] uppercase">English</span>
                <HiChevronDown className="text-xl cursor-pointer" />
              </button>

              {isAuthenticated ? (
                <>
                  <Link to="/dashboard/messages" className="flex items-center justify-center hover:bg-gray-100 p-2 rounded-full transition-colors relative">
                    <HiOutlineChat className="text-2xl text-[var(--color-primary)]" />
                  </Link>
                  
                  <Link to="/dashboard/wishlist" className="flex items-center justify-center hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <HiOutlineHeart className="text-2xl text-[var(--color-primary)]" />
                  </Link>

                  <Link to="/dashboard/notifications" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative mr-2">
                    <HiOutlineBell className="text-2xl text-[var(--color-primary)]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-[var(--color-accent-notification)] rounded-full border-2 border-white"></span>
                    )}
                  </Link>

                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <BiUserCircle className="w-full h-full text-gray-500" />
                        )}
                      </div>
                      <HiChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 mb-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        
                        <Link onClick={() => setIsDropdownOpen(false)} to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]">
                          My Profile
                        </Link>
                        <Link onClick={() => setIsDropdownOpen(false)} to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]">
                          My Dashboard
                        </Link>
                        <Link onClick={() => setIsDropdownOpen(false)} to="/dashboard/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]">
                          Wishlist
                        </Link>
                        <Link onClick={() => setIsDropdownOpen(false)} to="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]">
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                            navigate('/');
                          }} 
                          className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-center hover:underline underline-offset-4 decoration-2">
                  <span className="text-lg underline underline-offset-4 decoration-2">Login</span>
                </Link>
              )}

              <Link to="/dashboard/sell">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="sell-btn-border flex items-center gap-1 px-5 py-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  <span className="text-xl font-bold text-[var(--color-primary)]">+</span>
                  <span className="font-bold tracking-wide uppercase text-[var(--color-primary)] text-sm">SELL</span>
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="text-[var(--color-primary)] hover:text-gray-700">
                {isOpen ? <HiX className="h-8 w-8" /> : <HiMenu className="h-8 w-8" />}
              </button>
            </div>

          </div>

          {/* Mobile Search - Visible only when menu is closed, underneath main nav */}
          <div className="md:hidden bg-white p-3 border-b border-gray-200">
            <SearchBar isMobile={true} />
          </div>
        </div>
      </nav>

      {/* Secondary Categories Navbar */}
      <nav className="bg-white border-b border-gray-200 py-3 hidden md:block shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 text-[14px]">
          <button className="flex items-center gap-1 font-bold text-[var(--color-primary)] uppercase hover:text-[var(--color-cyan)] transition-colors">
            ALL CATEGORIES
            <HiChevronDown className="text-xl cursor-pointer" />
          </button>
          
          <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap hide-scrollbar ml-4">
            {categories.map((cat, idx) => (
              <Link key={idx} to={`/category/${cat.toLowerCase()}`} className="text-gray-600 hover:text-[var(--color-cyan)] transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-white border-b border-gray-200"
        >
          <div className="px-4 pt-2 pb-4 space-y-3">
            {isAuthenticated ? (
              <Link to="/dashboard/profile" className="block text-[var(--color-primary)] hover:bg-gray-100 font-bold py-2 px-2 rounded">My Profile</Link>
            ) : (
              <Link to="/login" className="block text-[var(--color-primary)] hover:bg-gray-100 font-bold py-2 px-2 rounded">Login</Link>
            )}
            <Link to="/wishlist" className="block text-[var(--color-primary)] hover:bg-gray-100 font-bold py-2 px-2 rounded">Wishlist</Link>
            <div className="border-t border-gray-200 my-2" />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 px-2">Categories</p>
            {categories.map((cat, idx) => (
              <Link key={idx} to={`/category/${cat.toLowerCase()}`} className="block text-gray-700 hover:bg-gray-100 py-2 px-2 rounded">
                {cat}
              </Link>
            ))}
            <Link to="/dashboard/sell" className="block mt-4 text-center py-3 bg-[var(--color-primary)] rounded-full font-bold text-white uppercase mx-2">
              + SELL AN ITEM
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Navbar;
