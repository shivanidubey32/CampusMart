import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { HiOutlineChatAlt2, HiCheck, HiX } from 'react-icons/hi';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Requests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received');

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const [resReceived, resSent] = await Promise.all([
          axios.get('/api/requests/seller'),
          axios.get('/api/requests/buyer')
        ]);
        setReceivedRequests(resReceived.data);
        setSentRequests(resSent.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchRequests();
  }, [user]);

  const handleAccept = async (requestId) => {
    try {
      await axios.put(`/api/requests/${requestId}/accept`);
      setReceivedRequests(receivedRequests.map(req => 
        req._id === requestId ? { ...req, status: 'Accepted' } : req
      ));
      alert('Request accepted successfully!');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  };

  const handlePay = async (req) => {
    try {
      // 1. Create order
      const { data: orderData } = await axios.post('/api/payment/create-order', {
        productId: req.product._id,
        sellerId: req.seller._id,
        amount: req.product.price,
      });

      // 2. Mock Verify
      await axios.post('/api/payment/verify', {
        orderId: orderData.order._id,
        paymentId: `mock_pay_${Date.now()}`,
        signature: 'mock_signature'
      });

      alert('Payment successful! Order placed.');
      
      // Update local state to show paid
      setSentRequests(sentRequests.map(r => 
        r._id === req._id ? { ...r, status: 'Paid' } : r
      ));
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed!');
    }
  };

  const handleChat = (otherUserId, productId) => {
    navigate('/dashboard/messages', { state: { receiverId: otherUserId, productId } });
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#002f34]">Purchase Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Manage items you want to buy, and requests from buyers.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'received' 
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-white' 
              : 'text-gray-500 hover:text-[#002f34] hover:bg-gray-100'
            }`}
          >
            Received Requests ({receivedRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'sent' 
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-white' 
              : 'text-gray-500 hover:text-[#002f34] hover:bg-gray-100'
            }`}
          >
            Sent Requests ({sentRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
            </div>
          ) : (
            <>
              {/* Received Requests Tab */}
              {activeTab === 'received' && (
                receivedRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No requests received yet.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {receivedRequests.map(req => (
                      <li key={req._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#002f34]">{req.product.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Buyer: <span className="font-bold text-gray-700">{req.buyer.name}</span> • {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {req.status === 'Pending' ? (
                            <button 
                              onClick={() => handleAccept(req._id)}
                              className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded font-bold text-sm hover:bg-green-100 transition-colors"
                            >
                              <HiCheck className="text-lg" /> Accept
                            </button>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-green-200">
                              {req.status}
                            </span>
                          )}
                          <button 
                            onClick={() => handleChat(req.buyer._id, req.product._id)}
                            className="flex items-center gap-1 bg-white text-[var(--color-primary)] border border-gray-300 shadow-sm px-3 py-1.5 rounded font-bold text-sm hover:border-[var(--color-cyan)] transition-colors"
                          >
                            <HiOutlineChatAlt2 className="text-lg" /> Chat
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}

              {/* Sent Requests Tab */}
              {activeTab === 'sent' && (
                sentRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No requests sent yet.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {sentRequests.map(req => (
                      <li key={req._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#002f34]">{req.product.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Seller: <span className="font-bold text-gray-700">{req.seller.name}</span> • {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                            req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            req.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                            req.status === 'Paid' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            'bg-green-100 text-green-700 border-green-200'
                          }`}>
                            {req.status}
                          </span>
                          
                          {req.status === 'Accepted' && (
                            <button 
                              onClick={() => handlePay(req)}
                              className="flex items-center gap-1 bg-[var(--color-primary)] text-white shadow-sm px-4 py-1.5 rounded font-bold text-sm hover:bg-[#002f34] transition-colors"
                            >
                              Pay Now
                            </button>
                          )}

                          <button 
                            onClick={() => handleChat(req.seller._id, req.product._id)}
                            className="flex items-center gap-1 bg-white text-[var(--color-primary)] border border-gray-300 shadow-sm px-3 py-1.5 rounded font-bold text-sm hover:border-[var(--color-cyan)] transition-colors"
                          >
                            <HiOutlineChatAlt2 className="text-lg" /> Chat
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
