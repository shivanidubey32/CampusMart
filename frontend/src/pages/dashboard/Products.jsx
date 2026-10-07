import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineShare, HiOutlineEye, HiOutlineHeart } from 'react-icons/hi';
import { FaRegCheckCircle } from 'react-icons/fa';

const Products = () => {
  const listings = [
    {
      id: 1,
      title: 'Dell Inspiron 15',
      price: '32,000',
      views: 145,
      wishlisted: 12,
      status: 'Available',
      image: 'https://via.placeholder.com/300x200/f3f4f6/a1a1aa?text=Dell+Laptop'
    },
    {
      id: 2,
      title: 'Engineering Mathematics Vol 2',
      price: '400',
      views: 32,
      wishlisted: 3,
      status: 'Available',
      image: 'https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=Math+Book'
    },
    {
      id: 3,
      title: 'Scientific Calculator',
      price: '800',
      views: 210,
      wishlisted: 24,
      status: 'Reserved',
      image: 'https://via.placeholder.com/300x200/d1d5db/6b7280?text=Calculator'
    },
    {
      id: 4,
      title: 'Drafting Table',
      price: '1,500',
      views: 89,
      wishlisted: 5,
      status: 'Sold',
      image: 'https://via.placeholder.com/300x200/f3f4f6/a1a1aa?text=Table'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Reserved': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Sold': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#002f34]">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all the products you are selling.</p>
        </div>
        <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-[#001f24] transition-colors">
          + Sell New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            
            {/* Image & Status */}
            <div className="relative h-48 bg-gray-100">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <div className={`absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border shadow-sm ${getStatusColor(item.status)}`}>
                {item.status}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-[#002f34] mb-1 line-clamp-1">{item.title}</h2>
              <h3 className="text-xl font-extrabold text-[var(--color-primary)] mb-4">₹ {item.price}</h3>
              
              {/* Stats */}
              <div className="flex gap-4 text-gray-500 text-sm mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-1.5" title="Views">
                  <HiOutlineEye className="text-lg" />
                  <span className="font-semibold">{item.views}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Wishlists">
                  <HiOutlineHeart className="text-lg" />
                  <span className="font-semibold">{item.wishlisted}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                  <HiOutlinePencilAlt className="text-lg text-[var(--color-primary)]" /> Edit
                </button>
                <button className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                  <HiOutlineShare className="text-lg text-blue-500" /> Share
                </button>
                {item.status !== 'Sold' && (
                  <button className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors col-span-2">
                    <FaRegCheckCircle className="text-lg" /> Mark Sold
                  </button>
                )}
                {item.status === 'Sold' && (
                   <button className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors col-span-2">
                   <HiOutlineTrash className="text-lg" /> Delete Listing
                 </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
