export const CATEGORIES = [
  { id: "all", name: "All Items", icon: "🍽️" },
  { id: "Pizza", name: "Pizza", icon: "🍕" },
  { id: "Burger", name: "Burger", icon: "🍔" },
  { id: "Biryani", name: "Biryani", icon: "🍲" },
  { id: "Chinese", name: "Chinese", icon: "🥡" },
  { id: "Desserts", name: "Desserts", icon: "🍰" },
  { id: "Drinks", name: "Drinks", icon: "🥤" },
];

export const FOOD_ITEMS = [
  {
    id: 1,
    name: "Margherita Supreme Pizza",
    category: "Pizza",
    price: 349,
    rating: 4.8,
    reviews: 1420,
    prepTime: "25-30 min",
    isVeg: true,
    description: "Classic crust topped with fresh buffalo mozzarella, vine tomatoes, and aromatic basil leaves.",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Hyderabadi Dum Biryani",
    category: "Biryani",
    price: 429,
    rating: 4.9,
    reviews: 2150,
    prepTime: "30-35 min",
    isVeg: false,
    description: "Fragrant basmati rice layered with spiced tender meat, saffron, and fried golden onions.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Crispy Zinger Burger",
    category: "Burger",
    price: 229,
    rating: 4.7,
    reviews: 980,
    prepTime: "15-20 min",
    isVeg: false,
    description: "Crunchy golden fried patty with fresh lettuce, melted cheddar, and secret zesty sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "Paneer Tikka Biryani",
    category: "Biryani",
    price: 379,
    rating: 4.8,
    reviews: 1640,
    prepTime: "25-30 min",
    isVeg: true,
    description: "Charcoal-grilled cottage cheese cubes simmered with fragrant basmati and rich Indian spices.",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    name: "Pepperoni Loaded Pizza",
    category: "Pizza",
    price: 499,
    rating: 4.8,
    reviews: 870,
    prepTime: "20-25 min",
    isVeg: false,
    description: "Loaded with double spicy pepperoni slices, mozzarella blend, and Italian herb drizzle.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    name: "Double Cheese Smash Burger",
    category: "Burger",
    price: 279,
    rating: 4.9,
    reviews: 1210,
    prepTime: "20-25 min",
    isVeg: true,
    description: "Two crispy smash patties, caramelized onions, melted American cheddar, and tangy pickles.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 7,
    name: "Chilli Garlic Noodles & Manchurian",
    category: "Chinese",
    price: 299,
    rating: 4.6,
    reviews: 730,
    prepTime: "20-25 min",
    isVeg: true,
    description: "Wok-tossed spicy noodles loaded with bell peppers, served alongside crispy Manchurian balls.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 8,
    name: "Molten Choco Lava Cake",
    category: "Desserts",
    price: 159,
    rating: 4.9,
    reviews: 2450,
    prepTime: "10-15 min",
    isVeg: true,
    description: "Warm Belgian chocolate cake with a luscious, gooey chocolate center that melts on the tongue.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 9,
    name: "Szechuan Fried Rice Deluxe",
    category: "Chinese",
    price: 269,
    rating: 4.5,
    reviews: 640,
    prepTime: "15-20 min",
    isVeg: true,
    description: "Spicy wok-fried rice tossed with spring onions, crunchy veggies, and aromatic Sichuan peppers.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 10,
    name: "Royal Kesari Gulab Jamun",
    category: "Desserts",
    price: 129,
    rating: 4.7,
    reviews: 1320,
    prepTime: "10-15 min",
    isVeg: true,
    description: "Soft milk dumplings soaked in cardamom and saffron-infused rose sugar syrup (2 pieces).",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 11,
    name: "Alphonso Mango Shake",
    category: "Drinks",
    price: 169,
    rating: 4.8,
    reviews: 910,
    prepTime: "10 min",
    isVeg: true,
    description: "Rich and creamy blend of pure Ratnagiri Alphonso mango pulp, fresh milk, and vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 12,
    name: "Iced Berry Mint Cooler",
    category: "Drinks",
    price: 149,
    rating: 4.6,
    reviews: 580,
    prepTime: "5-10 min",
    isVeg: true,
    description: "Sparkling blend of wild berries, fresh garden mint, zesty lemon, and crushed iced soda.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80"
  }
];

export const SPECIAL_OFFERS = [
  {
    id: 1,
    code: "FOODIE50",
    title: "50% OFF up to ₹150",
    description: "Valid on your first 3 orders above ₹299",
    tag: "FIRST ORDER",
    bgGradient: "linear-gradient(135deg, #ff5722 0%, #ff8a65 100%)"
  },
  {
    id: 2,
    code: "FREEDEL",
    title: "Zero Delivery Fee",
    description: "Enjoy free doorstep delivery on all orders above ₹499",
    tag: "SUPER SAVER",
    bgGradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
  },
  {
    id: 3,
    code: "BIRYANIWEEK",
    title: "Flat ₹100 Cashback",
    description: "Applicable on all authentic Biryani and Family combos",
    tag: "COMBO DEALS",
    bgGradient: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
  }
];
