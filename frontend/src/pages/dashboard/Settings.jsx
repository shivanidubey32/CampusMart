import { useState, useEffect } from 'react';
import { HiUser, HiPhone, HiLocationMarker, HiPhotograph, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { State, City } from 'country-state-city';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'password' ? 'password' : 'profile';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    state: user?.state || '',
    city: user?.city || '',
  });

  const indianStates = State.getStatesOfCountry('IN');
  const selectedStateObj = indianStates.find(s => s.name === profileData.state);
  const availableCities = selectedStateObj ? City.getCitiesOfState('IN', selectedStateObj.isoCode) : [];
  
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setProfileData({ ...profileData, phone: numericValue });
    } else if (name === 'state') {
      setProfileData({ ...profileData, state: value, city: '' });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      formData.append('state', profileData.state);
      formData.append('city', profileData.city);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const res = await axios.put('/api/users/profile', formData);
      setUser({ ...user, ...res.data });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await axios.put('/api/users/change-password', { password: passwordData.password });
      toast.success('Password updated successfully!');
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#002f34]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and security.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'profile' 
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-white' 
              : 'text-gray-500 hover:text-[#002f34] hover:bg-gray-100'
            }`}
          >
            Edit Profile
          </button>
          <button 
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'password' 
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-white' 
              : 'text-gray-500 hover:text-[#002f34] hover:bg-gray-100'
            }`}
          >
            Change Password
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="max-w-xl mx-auto space-y-6">
              
              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg relative group cursor-pointer mb-3">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <HiPhotograph className="text-4xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase">Change</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <p className="text-xs text-gray-500">Click image to upload new avatar</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiUser className="text-gray-400 text-lg" />
                  </div>
                  <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiPhone className="text-gray-400 text-lg" />
                  </div>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={profileData.phone} 
                    onChange={handleProfileChange} 
                    required 
                    pattern="[0-9]{10}"
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Please enter a valid 10-digit number</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiLocationMarker className="text-gray-400 text-lg" />
                    </div>
                    <select 
                      name="state" 
                      value={profileData.state} 
                      onChange={handleProfileChange} 
                      required 
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm appearance-none bg-white"
                    >
                      <option value="" disabled>Select State</option>
                      {indianStates.map(state => (
                        <option key={state.isoCode} value={state.name}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiLocationMarker className="text-gray-400 text-lg" />
                    </div>
                    <select 
                      name="city" 
                      value={profileData.city} 
                      onChange={handleProfileChange} 
                      required 
                      disabled={!profileData.state}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="" disabled>Select City</option>
                      {availableCities.map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[#001f24] focus:outline-none transition-colors disabled:opacity-70">
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="max-w-xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLockClosed className="text-gray-400 text-lg" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={passwordData.password} onChange={handlePasswordChange} required minLength="6" className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <HiEyeOff className="text-gray-400 text-lg hover:text-gray-600" /> : <HiEye className="text-gray-400 text-lg hover:text-gray-600" />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLockClosed className="text-gray-400 text-lg" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required minLength="6" className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-[var(--color-primary)] bg-white border-2 border-[var(--color-primary)] hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-70">
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;
