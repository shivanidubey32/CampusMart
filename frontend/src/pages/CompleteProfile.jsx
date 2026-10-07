import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, reset } from '../redux/authSlice';
import toast from 'react-hot-toast';

const CompleteProfile = () => {
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );
  
  const [formData, setFormData] = useState({
    college: user?.college || '',
    branch: user?.branch || '',
    semester: user?.semester || '1',
    phone: user?.phone || '',
    city: user?.city || '',
    bio: user?.bio || '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    // If the backend returns that the profile is complete, redirect to dashboard
    if (isSuccess && user?.isProfileComplete) {
      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-main)]">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded shadow-md border border-gray-200">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-[var(--color-primary)]">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Just a few more details to unlock the marketplace!
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">University / College Name *</label>
              <input
                type="text"
                required
                className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="e.g. Stanford University"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch / Major *</label>
              <input
                type="text"
                required
                className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="e.g. Computer Science"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                required
                className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 bg-white text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] sm:text-sm"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (10 digits) *</label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                maxLength="10"
                className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, phone: val });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <select
                required
                className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 bg-white text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] sm:text-sm overflow-y-auto max-h-48"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                <option value="" disabled>Select your city</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Indore">Indore</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Kochi">Kochi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
              <textarea
                rows="3"
                className="appearance-none rounded block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="Tell us a bit about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 rounded text-white bg-[var(--color-primary)] hover:bg-[#001f24] font-bold border-2 border-[var(--color-primary)] transition-all disabled:opacity-70"
            >
              {isLoading ? 'Saving...' : 'Complete Profile & Enter Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
