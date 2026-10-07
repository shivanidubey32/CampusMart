import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { HiOutlinePaperAirplane, HiOutlineDotsVertical, HiOutlineEmojiHappy, HiOutlineChevronLeft } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import { Loader2 } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [inbox, setInbox] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { product: {}, otherUser: {} }
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Mobile view state
  const [showChatWindow, setShowChatWindow] = useState(false);

  // Fetch Inbox on mount
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const { data } = await axios.get('/api/messages/inbox');
        setInbox(data);

        // If navigated from ProductDetails to start a chat
        if (location.state?.receiverId && location.state?.productId) {
          const existingChat = data.find(
            (c) => c.product._id === location.state.productId && c.otherUser._id === location.state.receiverId
          );
          if (existingChat) {
            setActiveChat(existingChat);
            setShowChatWindow(true);
          } else {
            // It's a new chat, setup a temporary activeChat
            setActiveChat({
              product: { _id: location.state.productId, title: 'New Conversation' },
              otherUser: { _id: location.state.receiverId, name: 'Seller' },
              isNew: true
            });
            setShowChatWindow(true);
          }
        } else if (data.length > 0) {
          // On desktop, auto-select first chat. On mobile, just show list.
          if (window.innerWidth >= 768) {
            setActiveChat(data[0]);
            setShowChatWindow(true);
          }
        }
      } catch (error) {
        console.error('Error fetching inbox', error);
      } finally {
        setLoadingInbox(false);
      }
    };
    if (user) fetchInbox();
  }, [user, location.state]);

  // Fetch Chat History when activeChat changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!activeChat || activeChat.isNew) {
        setChatHistory([]);
        return;
      }
      setLoadingChat(true);
      try {
        const { data } = await axios.get(`/api/messages/${activeChat.product._id}/${activeChat.otherUser._id}`);
        setChatHistory(data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching history', error);
      } finally {
        setLoadingChat(false);
      }
    };
    fetchHistory();
  }, [activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Socket setup and listeners
  useEffect(() => {
    if (activeChat) {
      // Create a unique room ID based on product and the two users
      // To ensure it's the same for both, we can use the product ID and sort the user IDs
      const userIds = [user._id, activeChat.otherUser._id].sort();
      const roomId = `${activeChat.product._id}_${userIds[0]}_${userIds[1]}`;
      
      socket.emit('join_chat', roomId);

      // Listener for incoming messages
      const messageHandler = (newMsg) => {
        setChatHistory((prev) => [...prev, newMsg]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      };

      socket.on('receive_message', messageHandler);

      return () => {
        socket.off('receive_message', messageHandler);
      };
    }
  }, [activeChat, user._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      setSending(true);
      const res = await axios.post('/api/messages', {
        receiverId: activeChat.otherUser._id,
        productId: activeChat.product._id,
        content: newMessage
      });

      const messageData = res.data;
      setChatHistory([...chatHistory, messageData]);
      setNewMessage('');
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Emit to socket
      const userIds = [user._id, activeChat.otherUser._id].sort();
      const roomId = `${activeChat.product._id}_${userIds[0]}_${userIds[1]}`;
      socket.emit('send_message', { ...messageData, chatId: roomId });
      
      // Remove isNew flag if it was a new chat
      if (activeChat.isNew) {
        setActiveChat({ ...activeChat, isNew: false });
      }

    } catch (error) {
      console.error('Error sending message', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] min-h-[600px] flex flex-col pb-6">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-extrabold text-[#002f34]">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Chat directly with buyers and sellers on campus.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex relative">
        
        {/* Chat List (Sidebar) */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${showChatWindow ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[var(--color-primary)] text-sm"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingInbox ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-[var(--color-primary)]" />
              </div>
            ) : inbox.length === 0 && (!activeChat || !activeChat.isNew) ? (
              <div className="p-8 text-center text-gray-500 text-sm">No messages yet.</div>
            ) : (
              <>
                {activeChat && activeChat.isNew && (
                  <button 
                    className="w-full text-left p-4 border-b border-gray-100 flex items-start gap-3 bg-blue-50/50 border-l-4 border-l-[var(--color-primary)]"
                  >
                     <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeChat.otherUser.name}`} alt="Avatar" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-bold text-[#002f34] truncate text-sm">{activeChat.otherUser.name}</h3>
                      <p className="text-xs font-semibold text-[var(--color-primary)] truncate mb-0.5">New Conversation</p>
                    </div>
                  </button>
                )}
                {inbox.map(chat => {
                  const isActive = activeChat && activeChat.product._id === chat.product._id && activeChat.otherUser._id === chat.otherUser._id;
                  return (
                    <button 
                      key={chat._id}
                      onClick={() => {
                        setActiveChat(chat);
                        setShowChatWindow(true);
                      }}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                        isActive ? 'bg-blue-50/50 border-l-4 border-l-[var(--color-primary)]' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                          {chat.otherUser.avatar ? (
                            <img src={chat.otherUser.avatar} alt={chat.otherUser.name} className="w-full h-full object-cover" />
                          ) : (
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${chat.otherUser.name}`} alt={chat.otherUser.name} />
                          )}
                        </div>
                        {!chat.isRead && !chat.isMine && (
                          <span className="absolute top-0 right-0 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="font-bold text-[#002f34] truncate text-sm">{chat.otherUser.name}</h3>
                        </div>
                        <p className="text-xs font-semibold text-[var(--color-primary)] truncate mb-0.5">{chat.product.title}</p>
                        <p className={`text-xs truncate ${!chat.isRead && !chat.isMine ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                          {chat.isMine ? 'You: ' : ''}{chat.content}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
        
        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-[#f8fafc] ${!showChatWindow ? 'hidden md:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Header */}
              <div className="h-16 px-4 md:px-6 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowChatWindow(false)}
                  >
                    <HiOutlineChevronLeft className="text-2xl" />
                  </button>
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                    {activeChat.otherUser.avatar ? (
                      <img src={activeChat.otherUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeChat.otherUser.name}`} alt="Avatar" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#002f34] leading-tight">{activeChat.otherUser.name}</h3>
                    <p className="text-xs font-semibold text-[var(--color-primary)]">Regarding: {activeChat.product.title}</p>
                  </div>
                </div>
              </div>
    
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loadingChat ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>
                ) : chatHistory.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500 text-sm">Send a message to start chatting!</div>
                ) : (
                  chatHistory.map(msg => {
                    const isMe = msg.sender._id === user._id || msg.sender === user._id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${isMe ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'} rounded-2xl p-3 max-w-[75%] shadow-sm`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
    
              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-[var(--color-primary)] focus-within:bg-white transition-colors">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1"
                  />
                  <button 
                    type="submit" 
                    disabled={sending || !newMessage.trim()}
                    className="bg-[var(--color-primary)] hover:bg-[#001f24] text-white p-2 rounded-full flex-shrink-0 transition-colors shadow disabled:opacity-50"
                  >
                    <HiOutlinePaperAirplane className="text-sm transform translate-x-[1px] -rotate-45" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
