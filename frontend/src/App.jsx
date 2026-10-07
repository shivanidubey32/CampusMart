import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Category from './pages/Category';
import PublicProfile from './pages/PublicProfile';
import SearchResults from './pages/SearchResults';

// Layouts & Global Components
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingChatButton from './components/FloatingChatButton';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import Marketplace from './pages/dashboard/Marketplace';
import ProductDetails from './pages/dashboard/ProductDetails';
import SellItem from './pages/dashboard/SellItem';
import Profile from './pages/dashboard/Profile';
import Products from './pages/dashboard/Products';
import Requests from './pages/dashboard/Requests';
import Settings from './pages/dashboard/Settings';
import Wishlist from './pages/dashboard/Wishlist';
import Messages from './pages/dashboard/Messages';
import Notifications from './pages/dashboard/Notifications';
import HelpSupport from './pages/dashboard/HelpSupport';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <FloatingChatButton />
      <Routes>
        
        {/* Public Routes (with top Navbar) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/user/:id" element={<PublicProfile />} />
          <Route path="/search" element={<SearchResults />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          
          {/* Dashboard Routes (with Sidebar Layout) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="sell" element={<SellItem />} />
            <Route path="products" element={<Products />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="requests" element={<Requests />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<HelpSupport />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
