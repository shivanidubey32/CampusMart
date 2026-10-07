import Request from '../models/Request.js';
import Product from '../models/Product.js';

// @desc    Create a purchase request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
  try {
    const { productId, message } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      buyer: req.user._id,
      product: productId
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already sent a request for this product' });
    }

    const request = new Request({
      buyer: req.user._id,
      seller: product.seller,
      product: productId,
      message,
    });

    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Server error while creating request' });
  }
};

// @desc    Get all incoming requests for the seller
// @route   GET /api/requests/seller
// @access  Private
export const getSellerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ seller: req.user._id })
      .populate('buyer', 'name avatar')
      .populate('product', 'title images price status')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching seller requests:', error);
    res.status(500).json({ message: 'Server error while fetching requests' });
  }
};

// @desc    Get all outgoing requests for the buyer
// @route   GET /api/requests/buyer
// @access  Private
export const getBuyerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ buyer: req.user._id })
      .populate('seller', 'name avatar')
      .populate('product', 'title images price status')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching buyer requests:', error);
    res.status(500).json({ message: 'Server error while fetching requests' });
  }
};

// @desc    Accept a request
// @route   PUT /api/requests/:id/accept
// @access  Private
export const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to accept this request' });
    }

    request.status = 'Accepted';
    const updatedRequest = await request.save();

    // Optionally update product status to Reserved
    await Product.findByIdAndUpdate(request.product, { status: 'Reserved' });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ message: 'Server error while accepting request' });
  }
};
