const mongoose = require("mongoose");
const Food = require("../models/Food");
const connectDB = require("../config/db");
require("dotenv").config();

const INITIAL_FOODS = [
  {
    name: "Margherita Supreme Pizza",
    category: "Pizza",
    price: 349,
    rating: 4.8,
    prepTime: "25-30 min",
    isVeg: true,
    isAvailable: true,
    description: "Classic crust topped with fresh buffalo mozzarella, vine tomatoes, and aromatic basil leaves.",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Hyderabadi Dum Biryani",
    category: "Biryani",
    price: 429,
    rating: 4.9,
    prepTime: "30-35 min",
    isVeg: false,
    isAvailable: true,
    description: "Fragrant basmati rice layered with spiced tender meat, saffron, and fried golden onions.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Crispy Zinger Burger",
    category: "Burger",
    price: 229,
    rating: 4.7,
    prepTime: "15-20 min",
    isVeg: false,
    isAvailable: true,
    description: "Crunchy golden fried patty with fresh lettuce, melted cheddar, and secret zesty sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Paneer Tikka Biryani",
    category: "Biryani",
    price: 379,
    rating: 4.8,
    prepTime: "25-30 min",
    isVeg: true,
    isAvailable: true,
    description: "Charcoal-grilled cottage cheese cubes simmered with fragrant basmati and rich Indian spices.",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Pepperoni Loaded Pizza",
    category: "Pizza",
    price: 499,
    rating: 4.8,
    prepTime: "20-25 min",
    isVeg: false,
    isAvailable: true,
    description: "Loaded with double spicy pepperoni slices, mozzarella blend, and Italian herb drizzle.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Double Cheese Smash Burger",
    category: "Burger",
    price: 279,
    rating: 4.9,
    prepTime: "20-25 min",
    isVeg: true,
    isAvailable: true,
    description: "Two crispy smash patties, caramelized onions, melted American cheddar, and tangy pickles.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Chilli Garlic Noodles & Manchurian",
    category: "Chinese",
    price: 299,
    rating: 4.6,
    prepTime: "20-25 min",
    isVeg: true,
    isAvailable: true,
    description: "Wok-tossed spicy noodles loaded with bell peppers, served alongside crispy Manchurian balls.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Molten Choco Lava Cake",
    category: "Desserts",
    price: 159,
    rating: 4.9,
    prepTime: "10-15 min",
    isVeg: true,
    isAvailable: true,
    description: "Warm Belgian chocolate cake with a luscious, gooey chocolate center that melts on the tongue.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Szechuan Fried Rice Deluxe",
    category: "Chinese",
    price: 269,
    rating: 4.5,
    prepTime: "15-20 min",
    isVeg: true,
    isAvailable: true,
    description: "Spicy wok-fried rice tossed with spring onions, crunchy veggies, and aromatic Sichuan peppers.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Royal Kesari Gulab Jamun",
    category: "Desserts",
    price: 129,
    rating: 4.7,
    prepTime: "10-15 min",
    isVeg: true,
    isAvailable: true,
    description: "Soft milk dumplings soaked in cardamom and saffron-infused rose sugar syrup (2 pieces).",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Alphonso Mango Shake",
    category: "Drinks",
    price: 169,
    rating: 4.8,
    prepTime: "10 min",
    isVeg: true,
    isAvailable: true,
    description: "Rich and creamy blend of pure Ratnagiri Alphonso mango pulp, fresh milk, and vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Iced Berry Mint Cooler",
    category: "Drinks",
    price: 149,
    rating: 4.6,
    prepTime: "5-10 min",
    isVeg: true,
    isAvailable: true,
    description: "Sparkling blend of wild berries, fresh garden mint, zesty lemon, and crushed iced soda.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80"
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    const count = await Food.countDocuments();
    if (count === 0) {
      console.log("🌱 Seeding initial food items to MongoDB Atlas...");
      await Food.insertMany(INITIAL_FOODS);
      console.log(`✅ Successfully seeded ${INITIAL_FOODS.length} food items.`);
    } else {
      console.log(`ℹ️  Database already contains ${count} food items.`);
    }
  } catch (error) {
    console.error("Seeding error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedDatabase();
