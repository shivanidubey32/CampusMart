import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create a mock payment order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { productId, sellerId, amount } = req.body;
    const buyerId = req.user._id;

    // Create order in DB
    const order = new Order({
      buyerId,
      sellerId,
      productId,
      amount,
      paymentStatus: 'Pending',
    });

    const savedOrder = await order.save();

    // Mock an order ID returned from a payment gateway (e.g. Razorpay)
    const mockGatewayOrderId = `order_${Math.random().toString(36).substr(2, 9)}`;

    res.status(201).json({
      success: true,
      order: savedOrder,
      gatewayOrderId: mockGatewayOrderId
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// @desc    Verify payment and update order
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // In a real app, verify signature with Razorpay/Stripe using crypto
    // For now, we mock success
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'Completed';
    order.orderStatus = 'Processing';
    await order.save();

    // Also update product status to sold
    const product = await Product.findById(order.productId);
    if (product) {
      product.status = 'Sold';
      await product.save();
    }

    res.json({ success: true, message: 'Payment verified successfully', order });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error while verifying payment' });
  }
};
