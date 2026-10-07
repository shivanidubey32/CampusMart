import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Package, Heart, MessageSquare, Bell, Star, Settings, HelpCircle, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HelpSupport = () => {
  const { user, logout } = useAuth();

  const sidebarLinks = [
    { name: 'My Profile', icon: <User size={20} />, path: '/dashboard/profile' },
    { name: 'My Listings', icon: <Package size={20} />, path: '/dashboard' },
    { name: 'Wishlist', icon: <Heart size={20} />, path: '/dashboard/wishlist' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/dashboard/messages' },
    { name: 'Notifications', icon: <Bell size={20} />, path: '/dashboard/notifications' },
    { name: 'Reviews & Ratings', icon: <Star size={20} />, path: '#' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    { name: 'Help & Support', icon: <HelpCircle size={20} />, path: '/dashboard/help', active: true },
  ];

  const helpSections = [
    {
      title: "My Account",
      links: [
        "Error showing 'Email already in use' while updating details",
        "I want to edit my Profile",
        "Not able to access my account - My account is suspended",
        "Unable to login - Technical Issues",
        "How to create an account on CampusMart AI?",
        "What should I mention in my profile section?"
      ]
    },
    {
      title: "Posting & Managing Ads",
      links: [
        "I want to edit my existing ad",
        "Why my ad was re-categorized",
        "Buying process on CampusMart AI",
        "Why my Ad was rejected?",
        "Why isn't my ad live yet?",
        "How can I post an ad?"
      ]
    },
    {
      title: "Safety & Security",
      links: [
        "How to report a suspicious user",
        "Safety tips for meeting buyers/sellers on campus",
        "What to do if someone asks for an OTP?",
        "How to block another user",
        "Is my personal data secure?",
        "General safety guidelines for transactions"
      ]
    },
    {
      title: "Payments & Wallet",
      links: [
        "How can I buy premium packages?",
        "What are the different premium packages and their benefits?",
        "Where can I see my transaction history?",
        "Updating billing details and accessing invoices",
        "I was charged but my ad isn't premium",
        "Refund policy on CampusMart AI"
      ]
    }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 m-2">
      
      {/* Left Sidebar Menu */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-black text-[#002f34] tracking-tight">Dashboard</h2>
        </div>
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link, idx) => (
            <Link 
              key={idx} 
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                link.active 
                  ? 'bg-blue-50 text-[var(--color-primary)] shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#002f34]'
              }`}
            >
              <div className={`${link.active ? 'text-blue-600' : 'text-gray-400'}`}>
                {link.icon}
              </div>
              {link.name}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-all w-full">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white p-6 md:p-12">
        <h1 className="text-3xl font-extrabold text-[#002f34] mb-12">Help & Support</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
          {helpSections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-[17px] font-bold text-[#002f34] mb-4">{section.title}</h2>
              <ul className="space-y-4">
                {section.links.map((linkText, linkIdx) => (
                  <li key={linkIdx}>
                    <a href="#" className="text-[#3a77ff] hover:underline text-[15px] font-medium leading-relaxed">
                      {linkText}
                    </a>
                  </li>
                ))}
                <li className="pt-2">
                  <a href="#" className="text-[#3a77ff] hover:underline text-[14px]">
                    See all articles
                  </a>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
};

export default HelpSupport;
