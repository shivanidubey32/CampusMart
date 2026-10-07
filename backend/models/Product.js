import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      }
    ],
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    condition: {
      type: String,
      enum: ['Brand New', 'Like New', 'Good', 'Fair', 'Heavily Used', 'Needs Repair'],
      required: true,
    },
    listingType: {
      type: String,
      enum: ['Sell', 'Exchange', 'Rent', 'Donate'],
      required: true,
      default: 'Sell',
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerPhone: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    wishlistedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available',
    },
    pickupLocation: {
      city: { type: String },
      state: { type: String },
      college: { type: String },
      hostel: { type: String },
      address: { type: String },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    aiMetadata: {
      generatedDescription: {
        type: Boolean,
        default: false,
      },
      recommendedPrice: {
        type: Number,
      },
      scamProbability: {
        type: Number,
        default: 0, // 0 to 1 scale
      }
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
