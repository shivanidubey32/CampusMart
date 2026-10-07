import express from 'express';
import { createProduct, getProducts, getMyProducts, deleteProduct, getProductById, updateProductStatus } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.array('images', 10), createProduct)
  .get(getProducts);

router.route('/my-products')
  .get(protect, getMyProducts);

import { getProductsByCategory, getSimilarProducts, searchProducts } from '../controllers/productController.js';

router.route('/search')
  .get(searchProducts);

router.route('/category/:categoryName')
  .get(getProductsByCategory);

router.route('/similar/:categoryName')
  .get(getSimilarProducts);

router.route('/:id')
  .get(getProductById)
  .delete(protect, deleteProduct);

router.route('/:id/status')
  .put(protect, updateProductStatus);

export default router;
