import { useAuth } from '../../context/AuthContext';
import { useState, useRef } from 'react';
import { Camera, ChevronRight, MapPin, User, CheckCircle2, PartyPopper } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SellItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState('Books & Notes');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    description: '',
    price: '',
    condition: 'Good',
    city: '',
    state: '',
    address: '',
    hostel: 'Hostel 1',
    phone: '',
  });

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 20) {
      toast.error('You can only upload a maximum of 20 photos.');
      return;
    }
    
    const newImages = files.map(file => ({
      preview: URL.createObjectURL(file),
      file: file
    }));
    
    setImages([...images, ...newImages]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || !formData.phone) {
      toast.error('Please fill in all mandatory fields (Title, Description, Price, Phone)');
      return;
    }
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', Number(formData.price));
      formDataToSend.append('category', selectedCategory);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('sellerPhone', formData.phone);
      formDataToSend.append('pickupLocation', JSON.stringify({
        city: formData.city,
        state: formData.state,
        address: formData.address,
        hostel: formData.hostel,
      }));
      
      images.forEach(img => {
        formDataToSend.append('images', img.file);
      });

      const res = await axios.post('/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setIsSuccess(true);
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to post ad. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
            <PartyPopper size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-primary)] mb-4">Hooray! Ad Successfully Posted</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Your item is now live on the CampusMart AI marketplace. Students can now view your ad and contact you.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[var(--color-primary)] hover:bg-[#001f24] text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => {
                setIsSuccess(false);
                setImages([]);
                setFormData({
                  ...formData,
                  title: '',
                  description: '',
                  price: '',
                  brand: ''
                });
              }}
              className="bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-gray-50 font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Post Another Item
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto pb-12">
      <h1 className="text-2xl font-extrabold text-[var(--color-primary)] text-center py-6 border-b border-[var(--color-border)] mb-6 uppercase tracking-wider">
        Post Your Ad
      </h1>

      <div className="bg-[var(--color-bg-card)] rounded border border-[var(--color-border)] shadow-sm">
        
        {/* 1. Selected Category */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text-main)] mb-4 uppercase">Category *</h2>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            className="w-full md:w-1/2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors"
          >
            <option value="Books & Study Tools">📚 Books & Study Tools</option>
            <option value="Electronics & Gadgets">📱 Electronics & Gadgets</option>
            <option value="Hostel & Appliances">⚡ Hostel & Appliances</option>
            <option value="Bicycles & Mobility">🚲 Bicycles & Mobility</option>
            <option value="Sports & Leisure">⚽ Sports & Leisure</option>
          </select>
        </div>

        {/* 2. Include Some Details */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text-main)] mb-6 uppercase">Include Some Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">Brand</label>
              <select name="brand" value={formData.brand} onChange={handleInputChange} className="w-full md:w-1/2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors">
                <option value="">Select Brand</option>
                <option value="Apple">Apple</option>
                <option value="Dell">Dell</option>
                <option value="HP">HP</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">Year of Purchase *</label>
              <input 
                type="text" 
                placeholder="e.g. 2023"
                className="w-full md:w-1/2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-3">Condition *</label>
              <div className="flex flex-wrap gap-3">
                {['Brand New', 'Like New', 'Good', 'Fair', 'Heavily Used', 'Needs Repair'].map((cond) => (
                  <button 
                    key={cond}
                    type="button"
                    onClick={() => setFormData({...formData, condition: cond})}
                    className={`px-6 py-2 border rounded text-sm transition-colors ${formData.condition === cond ? 'border-[var(--color-primary)] bg-[var(--color-bg-hover)] text-[var(--color-primary)] font-bold' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]'}`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">Ad title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors"
                maxLength={70}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-[var(--color-text-muted)]">Mention the key features of your item (e.g. brand, model, age, type)</p>
                <p className="text-xs text-[var(--color-text-muted)]">0 / 70</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">Description *</label>
              <textarea 
                rows="5"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors resize-none"
                maxLength={4096}
              ></textarea>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-[var(--color-text-muted)]">Include condition, features and reason for selling</p>
                <p className="text-xs text-[var(--color-text-muted)]">0 / 4096</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Set a Price */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text-main)] mb-6 uppercase">Set a Price</h2>
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">Price *</label>
            <div className="relative w-full md:w-1/2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] border-r border-[var(--color-border)] pr-3">₹</span>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded pl-12 pr-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 4. Upload Photos */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text-main)] mb-2 uppercase">Upload up to 20 photos</h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-6">This field is mandatory</p>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />

            {images.map((img, index) => (
              <div key={index} className="aspect-square relative rounded overflow-hidden border border-[var(--color-border)] group">
                <img src={img.preview} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold hover:bg-red-500"
                >
                  X
                </button>
              </div>
            ))}

            {images.length < 20 && (
              <div 
                onClick={() => fileInputRef.current.click()}
                className="aspect-square border-2 border-dashed border-[var(--color-primary)] flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors rounded"
              >
                <Camera size={24} className="text-[var(--color-primary)] mb-1" />
                <span className="text-xs font-bold text-[var(--color-primary)]">Add Photo</span>
              </div>
            )}

            {[...Array(Math.max(0, 11 - images.length))].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border border-[var(--color-border)] flex flex-col items-center justify-center bg-[var(--color-bg-main)] rounded">
                <Camera size={24} className="text-[var(--color-border)]" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text-main)] mb-6 uppercase">Confirm your location</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">State *</label>
              <select name="state" value={formData.state} onChange={handleInputChange} className="w-full md:w-1/2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors">
                <option value="">Select State</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">City *</label>
              <select name="city" value={formData.city} onChange={handleInputChange} className="w-full md:w-1/2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors">
                <option value="">Select City</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">Full Address (Optional)</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full md:w-1/2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors"
                placeholder="e.g. Near Main Gate"
              />
            </div>
          </div>
        </div>

        {/* 6. Review Your Details */}
        <div className="p-6">
          <h2 className="text-sm font-bold text-[var(--color-text-main)] mb-6 uppercase">Review your details</h2>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-hover)] flex items-center justify-center relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-[var(--color-text-muted)]" />
              )}
              <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 border border-[var(--color-border)] shadow-sm">
                <Camera size={12} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="flex-1 max-w-sm">
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">Name</label>
              <input 
                type="text" 
                defaultValue={user?.name || "Shivani Dubey"}
                className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors"
                maxLength={30}
              />
              <div className="flex justify-end mt-1">
                <p className="text-xs text-[var(--color-text-muted)]">13 / 30</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)]">
            <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-2">Let's verify your account</h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">We will send you a confirmation code by sms on the next step.</p>
            
            <div className="max-w-sm">
              <label className="block text-sm text-[var(--color-text-muted)] mb-2">Mobile Phone Number *</label>
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-main)] border-r border-[var(--color-border)] pr-3">+91</span>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded pl-16 pr-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* POST NOW Button */}
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[var(--color-primary)] hover:bg-[#4E342E] text-white font-bold py-4 px-12 rounded shadow-md transition-colors text-lg disabled:opacity-50"
        >
          {loading ? 'POSTING...' : 'POST NOW'}
        </button>
      </div>

    </div>
  );
};

export default SellItem;
