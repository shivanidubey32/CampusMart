import Product from '../models/Product.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { title, brand, description, price, category, condition, images, pickupLocation, sellerPhone } = req.body;

    let imageUrls = [];

    // If files are uploaded, use local paths
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // pickupLocation comes as a JSON string because of FormData, need to parse it
    let parsedPickupLocation = {};
    if (pickupLocation) {
      try {
        parsedPickupLocation = typeof pickupLocation === 'string' ? JSON.parse(pickupLocation) : pickupLocation;
      } catch (e) {
        console.error("Failed to parse pickup location", e);
      }
    }

    const product = new Product({
      title,
      brand,
      description,
      price,
      category,
      condition,
      images: imageUrls.length > 0 ? imageUrls : images, // fallback to base64 if sent that way, though not recommended
      pickupLocation: parsedPickupLocation,
      seller: req.user._id, // Set by authMiddleware
      sellerPhone: sellerPhone,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, keyword, condition } = req.query;
    
    // Build filter object based on query params
    const filter = {};
    if (category && category !== 'All Products') {
      if (category.toLowerCase() === 'books & study tools' || category.toLowerCase() === 'books & notes') {
        filter.category = { $regex: /^Books & (Study Tools|Notes)$/i };
      } else {
        filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
    }
    
    if (condition) {
      // Assuming condition can be a comma-separated list
      filter.condition = { $in: condition.split(',') };
    }

    if (keyword) {
      filter.title = {
        $regex: keyword,
        $options: 'i',
      };
    }

    const products = await Product.find(filter)
      .populate('seller', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

// @desc    Fetch user's products
// @route   GET /api/products/my-products
// @access  Private
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Server error while fetching user products' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name avatar');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user is the seller
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to delete this product' });
      }
      
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};
// @desc    Update product status
// @route   PUT /api/products/:id/status
// @access  Private
export const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user is the seller
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to update this product' });
      }
      
      product.status = status;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ message: 'Server error while updating product status' });
  }
};

// @desc    Fetch products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const { sort, condition, minPrice, maxPrice } = req.query;

    const filter = {};
    
    // Support for legacy category names
    if (categoryName.toLowerCase() === 'books & study tools' || categoryName.toLowerCase() === 'books & notes') {
      filter.category = { $regex: /^Books & (Study Tools|Notes)$/i };
    } else {
      filter.category = { $regex: new RegExp(`^${categoryName}$`, 'i') };
    }

    if (condition) {
      filter.condition = { $in: condition.split(',') };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortObj = { createdAt: -1 }; // default Newest First
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };

    const products = await Product.find(filter)
      .populate('seller', 'name avatar')
      .sort(sortObj);

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Fetch similar products
// @route   GET /api/products/similar/:category
// @access  Public
export const getSimilarProducts = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const excludeId = req.query.exclude;

    const filter = { category: categoryName };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const products = await Product.find(filter)
      .populate('seller', 'name avatar')
      .limit(4)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching similar products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search products by keyword
// @route   GET /api/products/search?q=keyword
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    let filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { brand: regex }
      ];
    }
    
    const products = await Product.find(filter)
      .populate('seller', 'name avatar')
      .sort({ createdAt: -1 });
      
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error while searching products' });
  }
};
