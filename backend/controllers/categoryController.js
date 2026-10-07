// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = (req, res) => {
  const categories = [
    'All Products',
    'Books & Study Tools',
    'Electronics & Gadgets',
    'Hostel & Appliances',
    'Bicycles & Mobility',
    'Sports & Leisure'
  ];
  res.json(categories);
};
