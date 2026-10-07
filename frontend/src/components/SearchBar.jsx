import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { HiSearch } from 'react-icons/hi';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SearchBar = ({ isMobile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Update query if we navigate to a new search URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
    }
  }, [location.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products/search?q=${encodeURIComponent(query)}`);
        setResults(data.slice(0, 5)); // show top 5 in dropdown
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setLoading(false);
      }
    };

    // Only auto-search if the dropdown is open (user is typing)
    if (showDropdown) {
      const delayDebounceFn = setTimeout(() => {
        fetchResults();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [query, showDropdown]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleProductClick = (product) => {
    setShowDropdown(false);
    // Determine route based on authentication
    if (user) {
      navigate(`/dashboard/product/${product._id}`);
    } else {
      // If not logged in, they can still view search results but maybe not product details
      // Assuming we'll allow public view or prompt login
      navigate(`/login`);
    }
  };

  const highlightMatch = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <strong key={i} className="text-[var(--color-primary)] font-extrabold">{part}</strong> : part
    );
  };

  return (
    <div className={`relative ${isMobile ? 'w-full' : 'flex-grow max-w-3xl flex items-center'}`} ref={dropdownRef}>
      <form onSubmit={handleSearch} className="flex w-full bg-[var(--color-bg-main)] border-2 border-[var(--color-primary)] rounded transition-colors overflow-hidden focus-within:border-[var(--color-cyan)]">
        <input 
          type="text" 
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => { if(query) setShowDropdown(true); }}
          placeholder="Search for laptops, books, cycles..." 
          className="flex-1 bg-transparent px-4 py-2.5 text-sm md:text-base text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] outline-none"
        />
        <button type="submit" className="bg-[var(--color-primary)] hover:bg-[#001f24] text-white px-6 py-2.5 transition-colors flex items-center justify-center">
          <HiSearch size={22} className="font-bold" />
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-md z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={24} />
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.map(product => (
                <div 
                  key={product._id} 
                  onClick={() => handleProductClick(product)}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                >
                  <img src={product.images?.[0] || 'https://via.placeholder.com/50'} className="w-10 h-10 object-cover rounded" alt={product.title} />
                  <div className="flex-1 truncate">
                    <p className="text-sm text-gray-800 truncate">{highlightMatch(product.title, query)}</p>
                    <p className="text-xs text-gray-500 truncate">{product.category}</p>
                  </div>
                  <span className="text-[var(--color-primary)] font-bold text-sm">₹{product.price}</span>
                </div>
              ))}
              <div 
                onClick={handleSearch}
                className="p-3 text-center text-sm text-[var(--color-primary)] hover:bg-gray-50 cursor-pointer font-bold border-t border-gray-200"
              >
                See all results for "{query}"
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
