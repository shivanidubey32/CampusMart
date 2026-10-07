import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Update user profile to complete it
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.college = req.body.college || user.college;
      user.branch = req.body.branch || user.branch;
      user.semester = req.body.semester || user.semester;
      user.phone = req.body.phone || user.phone;
      user.city = req.body.city || user.city;
      user.state = req.body.state || user.state;
      user.bio = req.body.bio || user.bio;
      user.name = req.body.name || user.name;
      
      if (req.file) {
        user.avatar = `/uploads/${req.file.filename}`;
      } else if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }
      
      // Mark profile as complete if required fields are present
      if (user.college && user.branch && user.semester && user.phone) {
        user.isProfileComplete = true;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        city: updatedUser.city,
        state: updatedUser.state,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        isProfileComplete: updatedUser.isProfileComplete,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// @desc    Toggle item in wishlist
// @route   PUT /api/users/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const alreadyAdded = user.wishlist.includes(productId);

      if (alreadyAdded) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
      } else {
        user.wishlist.push(productId);
      }

      await user.save();
      res.json({ wishlist: user.wishlist });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'title price condition images seller status',
      populate: { path: 'seller', select: 'name' }
    });

    if (user) {
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.password) {
        user.password = req.body.password;
        await user.save();
        res.json({ message: 'Password updated successfully' });
      } else {
        res.status(400).json({ message: 'No new password provided' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public user profile
// @route   GET /api/users/:id
// @access  Public
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar bio college branch semester city state createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Also fetch their active products
    const products = await Product.find({ seller: req.params.id, status: 'available' }).sort('-createdAt');
    
    res.json({ user, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
