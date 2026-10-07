import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({
  title: String,
  category: String
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function migrate() {
  try {
    console.log("Connecting to", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    
    // Map of old categories to new ones
    const categoryMap = {
      'Books & Notes': 'Books & Study Tools',
      'Tools & Lab': 'Electronics & Gadgets',
      'Gadgets': 'Electronics & Gadgets',
      'Hostel Essentials': 'Hostel & Appliances',
      'Mobility': 'Bicycles & Mobility',
      'Accessories': 'Electronics & Gadgets',
      'Books': 'Books & Study Tools',
      'Electronics': 'Electronics & Gadgets',
      'Vehicles': 'Bicycles & Mobility',
      'Fashion': 'Hostel & Appliances',
      'Furniture': 'Hostel & Appliances',
      'Mobiles': 'Electronics & Gadgets',
      'Property': 'Hostel & Appliances',
      'Jobs': 'Books & Study Tools',
      'Sports': 'Sports & Leisure',
      'Pets': 'Sports & Leisure'
    };

    let updatedCount = 0;
    for (const [oldCat, newCat] of Object.entries(categoryMap)) {
      const res = await Product.updateMany({ category: oldCat }, { $set: { category: newCat } });
      if (res.modifiedCount > 0) {
        console.log(`Updated ${res.modifiedCount} products from '${oldCat}' to '${newCat}'`);
        updatedCount += res.modifiedCount;
      }
    }
    
    console.log(`Migration complete. Updated ${updatedCount} products total.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
