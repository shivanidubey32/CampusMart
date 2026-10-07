import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Bell, MessageSquare, Heart, User, LogOut, Settings, Package, Grid, HelpCircle, ShoppingBag, ShoppingCart
} from 'lucide-react';
import SearchBar from '../components/SearchBar';

const DashboardLayout = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: contextLogout, unreadCount } = useAuth();
  const isAuthenticated = !!user;

  const categories = [
    'Books & Study Tools', 'Electronics & Gadgets', 'Hostel & Appliances', 
    'Bicycles & Mobility', 'Sports & Leisure'
  ];

  const handleLogout = async () => {
    await contextLogout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-main)] overflow-hidden">
      
      {/* 1. Top Navigation Bar */}
      <header className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] h-20 flex items-center justify-between px-4 sm:px-8 z-50 sticky top-0">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <img src="/logo.png" alt="CampusMart" className="h-12 w-auto object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-black tracking-tighter text-[#8B4513] drop-shadow-sm hidden sm:block">
            CampusMart <span className="font-light italic text-[#A0522D] drop-shadow-none">AI</span>
          </span>
        </Link>

        {/* Center: Large Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <SearchBar isMobile={false} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          
          <Link to="/dashboard/messages" className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors relative">
            <MessageSquare size={22} />
          </Link>
          
          <Link to="/dashboard/notifications" className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors relative">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-accent-notification)] rounded-full border-2 border-[var(--color-bg-card)]"></span>
            )}
          </Link>

          <Link to="/dashboard/wishlist" className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-notification)] transition-colors">
            <Heart size={22} />
          </Link>

          {isAuthenticated ? (
            <div className="relative ml-2">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-hover)] border border-[var(--color-border)] overflow-hidden">
                  <img src={user?.avatar || '/logo.png'} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 py-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <div className="px-4 py-3 border-b border-[var(--color-border)] mb-2">
                      <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">My Profile</h3>
                      <p className="text-base font-bold text-[var(--color-text-main)] truncate">{user?.name || 'Student Name'}</p>
                      <p className="text-sm text-[var(--color-text-muted)] truncate">{user?.email || 'student@college.edu'}</p>
                    </div>
                    
                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-base text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]">
                      <Package size={18} /> My Dashboard
                    </Link>
                    <Link to="/dashboard/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-base text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]">
                      <User size={18} /> View and Edit Profile
                    </Link>
                    <Link to="/dashboard/settings" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-base text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]">
                      <Settings size={18} /> Settings
                    </Link>
                    <Link to="/dashboard/help" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-base text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]">
                      <HelpCircle size={18} /> Help & Support
                    </Link>
                    <Link to="#" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-base text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]">
                      <ShoppingBag size={18} /> Buyer
                    </Link>
                    <Link to="#" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-base text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]">
                      <ShoppingCart size={18} /> View Cart
                    </Link>
                    
                    <div className="border-t border-[var(--color-border)] mt-2 pt-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-base text-red-500 hover:bg-red-500/10">
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="ml-2 font-bold text-[var(--color-primary)] hover:underline">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* 2. Horizontal Category Sub-Navigation */}
      <nav className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] px-4 sm:px-8 py-2 overflow-x-auto custom-scrollbar flex-shrink-0">
        <ul className="flex items-center gap-6 whitespace-nowrap min-w-max">
          <li>
            <Link to="/dashboard/marketplace" className="text-sm font-bold text-[var(--color-primary)] hover:text-purple-400">
              All Categories
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <Link to={`/dashboard/marketplace?category=${cat}`} className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
                {cat}
              </Link>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <Link to="/dashboard/sell" className="text-sm font-bold text-[var(--color-accent-success)] hover:text-green-400 ml-4 flex items-center gap-1">
                + Sell Item
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* 3. Mobile Search Bar (Visible only on small screens) */}
      <div className="md:hidden p-4 bg-[var(--color-bg-main)] border-b border-[var(--color-border)] flex-shrink-0 z-40">
        <SearchBar isMobile={true} />
      </div>

      {/* 4. Main Content Area */}
      <main className="flex-1 overflow-auto bg-[var(--color-bg-main)] relative p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;
