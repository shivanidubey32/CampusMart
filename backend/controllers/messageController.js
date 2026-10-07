import Message from '../models/Message.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import { getIo } from '../sockets/socketManager.js';
import mongoose from 'mongoose';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, productId, content } = req.body;

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      productContext: productId,
      content,
    });

    const savedMessage = await message.save();
    
    // Populate sender info before returning
    await savedMessage.populate('sender', 'name avatar');
    
    // Create a notification for the receiver
    const product = await Product.findById(productId);
    const notification = new Notification({
      recipient: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: `You received a new message from ${req.user.name} regarding "${product?.title || 'a product'}".`,
      relatedProduct: productId,
      relatedUser: req.user._id
    });
    const savedNotification = await notification.save();

    // Emit notification in real-time
    try {
      const io = getIo();
      io.to(`user_${receiverId}`).emit('new_notification', savedNotification);
    } catch (err) {
      console.log('Socket not initialized or error emitting notification:', err);
    }
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// @desc    Get chat history between current user and another user for a specific product
// @route   GET /api/messages/:productId/:userId
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { productId, userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      productContext: productId,
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar');

    // Mark messages as read
    await Message.updateMany(
      { productContext: productId, sender: userId, receiver: currentUserId, readStatus: false },
      { $set: { readStatus: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Server error while fetching chat history' });
  }
};

// @desc    Get inbox (latest message per chat thread)
// @route   GET /api/messages/inbox
// @access  Private
export const getInbox = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Use MongoDB Aggregation to get the latest message per (product + other user)
    const inbox = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        }
      },
      {
        $sort: { createdAt: -1 } // Sort by newest first
      },
      {
        $group: {
          _id: {
            productContext: "$productContext",
            otherUser: {
              $cond: {
                if: { $eq: ["$sender", currentUserId] },
                then: "$receiver",
                else: "$sender"
              }
            }
          },
          latestMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.otherUser',
          foreignField: '_id',
          as: 'otherUserDetails'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.productContext',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: "$otherUserDetails"
      },
      {
        $unwind: "$productDetails"
      },
      {
        $project: {
          _id: "$latestMessage._id",
          product: {
            _id: "$productDetails._id",
            title: "$productDetails.title",
            images: "$productDetails.images"
          },
          otherUser: {
            _id: "$otherUserDetails._id",
            name: "$otherUserDetails.name",
            avatar: "$otherUserDetails.avatar"
          },
          content: "$latestMessage.content",
          createdAt: "$latestMessage.createdAt",
          isRead: "$latestMessage.readStatus",
          isMine: { $eq: ["$latestMessage.sender", currentUserId] }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(inbox);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Server error while fetching inbox' });
  }
};
