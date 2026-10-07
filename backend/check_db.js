import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../CampusMartAI/backend/.env') });

const productSchema = new mongoose.Schema({
  title: String,
  category: String
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({});
  console.log("All categories in DB:");
  const catSet = new Set();
  products.forEach(p => {
    catSet.add(p.category);
    if (p.title.toLowerCase().includes('book')) {
      console.log(`Product: ${p.title} -> Category: ${p.category}`);
    }
  });
  console.log(Array.from(catSet));
  process.exit(0);
}

check();
