import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                CampusMart AI
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              The premier AI-powered marketplace exclusively for college students. Buy, sell, exchange, and rent with ease and security.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><FaTwitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-secondary)] transition-colors"><FaInstagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><FaLinkedin size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaGithub size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-gray-400 hover:text-white transition-colors text-sm">Explore All</Link></li>
              <li><Link to="/books" className="text-gray-400 hover:text-white transition-colors text-sm">Book Exchange</Link></li>
              <li><Link to="/rentals" className="text-gray-400 hover:text-white transition-colors text-sm">Rent Equipment</Link></li>
              <li><Link to="/electronics" className="text-gray-400 hover:text-white transition-colors text-sm">Electronics</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/safety" className="text-gray-400 hover:text-white transition-colors text-sm">Safety Guidelines</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
              <li><Link to="/report" className="text-gray-400 hover:text-white transition-colors text-sm">Report a Scam</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} CampusMart AI. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <span className="text-xs text-gray-600">Designed for modern campuses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
