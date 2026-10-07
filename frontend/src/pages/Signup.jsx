import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff, HiPhone, HiLocationMarker, HiPhotograph } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { State, City } from 'country-state-city';

const Signup = () => {
  const { signup, isLoading, user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    password: '',
    confirmPassword: '',
  });
  
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const indianStates = State.getStatesOfCountry('IN');
  const selectedStateObj = indianStates.find(s => s.name === formData.state);
  const availableCities = selectedStateObj ? City.getCitiesOfState('IN', selectedStateObj.isoCode) : [];

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, phone: numericValue });
    } else if (name === 'state') {
      setFormData({ ...formData, state: value, city: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('state', formData.state);
    submitData.append('city', formData.city);
    submitData.append('password', formData.password);
    if (avatar) {
      submitData.append('avatar', avatar);
    }

    const success = await signup(submitData);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-primary)]">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[var(--color-primary)] hover:text-[#001f24] hover:underline underline-offset-4 decoration-2 transition-all">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 relative group cursor-pointer">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <HiPhotograph className="text-2xl" />
                    <span className="text-[10px] mt-1 font-bold">OPTIONAL</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiUser className="text-gray-400 text-xl" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm"
                  placeholder="Full Name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiMail className="text-gray-400 text-xl" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiPhone className="text-gray-400 text-xl" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm"
                  placeholder="10-digit Phone Number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State */}
              <div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLocationMarker className="text-gray-400 text-xl" />
                  </div>
                  <select
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm appearance-none bg-white"
                  >
                    <option value="" disabled>Select State</option>
                    {indianStates.map(state => (
                      <option key={state.isoCode} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLocationMarker className="text-gray-400 text-xl" />
                  </div>
                  <select
                    name="city"
                    required
                    disabled={!formData.state}
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="" disabled>Select City</option>
                    {availableCities.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="text-gray-400 text-xl" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm"
                  placeholder="Password"
                  minLength="6"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <HiEyeOff className="text-gray-400 text-xl hover:text-gray-600" /> : <HiEye className="text-gray-400 text-xl hover:text-gray-600" />}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="text-gray-400 text-xl" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm"
                  placeholder="Confirm Password"
                  minLength="6"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <HiEyeOff className="text-gray-400 text-xl hover:text-gray-600" /> : <HiEye className="text-gray-400 text-xl hover:text-gray-600" />}
                </div>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 text-sm rounded text-white bg-[var(--color-primary)] hover:bg-[#001f24] font-bold border-2 border-[var(--color-primary)] transition-all disabled:opacity-70"
              >
                {isLoading ? 'Creating Account...' : 'Sign up'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
