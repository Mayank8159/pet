const MenuItem = require("../models/MenuItem");

const defaultMenu = [
  // --- STARTERS (VEG) ---
  { name: "Paneer Tikka", price: 320, tag: "Tandoori", category: "Starter" },
  { name: "Hara Bhara Kabab", price: 280, tag: "Veggie", category: "Starter" },
  { name: "Veg Manchurian", price: 240, tag: "Indo-Chinese", category: "Starter" },
  { name: "Chilli Paneer", price: 290, tag: "Spicy", category: "Starter" },
  { name: "Crispy Corn", price: 220, tag: "Crunchy", category: "Starter" },
  { name: "Mushroom Duplex", price: 310, tag: "Chef Special", category: "Starter" },
  { name: "Dahi Ke Sholay", price: 260, tag: "Classic", category: "Starter" },
  { name: "Soya Chaap Tikka", price: 270, tag: "Protein", category: "Starter" },
  { name: "Aloo Tikki Chaat", price: 150, tag: "Street Food", category: "Starter" },
  { name: "Paneer 65", price: 280, tag: "Spicy", category: "Starter" },

  // --- STARTERS (NON-VEG) ---
  { name: "Chicken Tikka", price: 380, tag: "Tandoori", category: "Starter" },
  { name: "Murgh Malai Tikka", price: 410, tag: "Creamy", category: "Starter" },
  { name: "Chicken 65", price: 350, tag: "Spicy", category: "Starter" },
  { name: "Fish Amritsari", price: 450, tag: "Fried", category: "Starter" },
  { name: "Mutton Seekh Kabab", price: 480, tag: "Grill", category: "Starter" },
  { name: "Tandoori Chicken (Full)", price: 550, tag: "Classic", category: "Starter" },
  { name: "Chicken Lollipop", price: 320, tag: "Kids Choice", category: "Starter" },
  { name: "Garlic Butter Prawns", price: 580, tag: "Seafood", category: "Starter" },
  { name: "Chicken Seekh Kabab", price: 360, tag: "Grill", category: "Starter" },
  { name: "Afghani Chicken", price: 420, tag: "Mild", category: "Starter" },

  // --- MAIN COURSE (VEG) ---
  { name: "Dal Makhani", price: 280, tag: "Popular", category: "Main Course" },
  { name: "Paneer Butter Masala", price: 340, tag: "Best Seller", category: "Main Course" },
  { name: "Kadhai Paneer", price: 330, tag: "Spicy", category: "Main Course" },
  { name: "Palak Paneer", price: 310, tag: "Healthy", category: "Main Course" },
  { name: "Malai Kofta", price: 350, tag: "Creamy", category: "Main Course" },
  { name: "Mix Vegetable", price: 260, tag: "Simple", category: "Main Course" },
  { name: "Aloo Gobhi Adraki", price: 240, tag: "Homely", category: "Main Course" },
  { name: "Bhindi Do Pyaza", price: 250, tag: "Classic", category: "Main Course" },
  { name: "Dal Tadka", price: 210, tag: "Basic", category: "Main Course" },
  { name: "Chana Masala", price: 230, tag: "North Indian", category: "Main Course" },
  { name: "Baingan Bharta", price: 240, tag: "Smoky", category: "Main Course" },
  { name: "Shahi Paneer", price: 350, tag: "Royal", category: "Main Course" },
  { name: "Veg Jalfrezi", price: 270, tag: "Tangy", category: "Main Course" },
  { name: "Mushroom Masala", price: 310, tag: "Fusion", category: "Main Course" },
  { name: "Dum Aloo", price: 280, tag: "Kashmiri", category: "Main Course" },
  { name: "Methi Matar Malai", price: 320, tag: "Sweet", category: "Main Course" },
  { name: "Jeera Aloo", price: 180, tag: "Quick", category: "Main Course" },
  { name: "Kaju Curry", price: 390, tag: "Premium", category: "Main Course" },
  { name: "Navratan Korma", price: 340, tag: "Fruit & Nut", category: "Main Course" },
  { name: "Pindi Chole", price: 240, tag: "Rustic", category: "Main Course" },

  // --- MAIN COURSE (NON-VEG) ---
  { name: "Butter Chicken", price: 450, tag: "Legendary", category: "Main Course" },
  { name: "Chicken Curry", price: 380, tag: "Classic", category: "Main Course" },
  { name: "Kadhai Chicken", price: 410, tag: "Spicy", category: "Main Course" },
  { name: "Mutton Rogan Josh", price: 550, tag: "Signature", category: "Main Course" },
  { name: "Chicken Tikka Masala", price: 430, tag: "Popular", category: "Main Course" },
  { name: "Rara Mutton", price: 590, tag: "Heavy", category: "Main Course" },
  { name: "Chicken Do Pyaza", price: 390, tag: "Onion Base", category: "Main Course" },
  { name: "Egg Curry", price: 240, tag: "Protein", category: "Main Course" },
  { name: "Fish Curry", price: 480, tag: "Seafood", category: "Main Course" },
  { name: "Chicken Lababdar", price: 440, tag: "Smooth", category: "Main Course" },
  { name: "Mutton Bhuna Gosht", price: 570, tag: "Thick Gravy", category: "Main Course" },
  { name: "Chicken Saagwala", price: 410, tag: "Healthy", category: "Main Course" },
  { name: "Handi Chicken", price: 420, tag: "Traditional", category: "Main Course" },
  { name: "Mutton Korma", price: 560, tag: "Rich", category: "Main Course" },

  // --- BIRYANI & RICE ---
  { name: "Veg Biryani", price: 280, tag: "Aromatic", category: "Rice" },
  { name: "Chicken Dum Biryani", price: 380, tag: "Must Try", category: "Rice" },
  { name: "Mutton Biryani", price: 480, tag: "Rich", category: "Rice" },
  { name: "Egg Biryani", price: 260, tag: "Simple", category: "Rice" },
  { name: "Jeera Rice", price: 160, tag: "Light", category: "Rice" },
  { name: "Steam Rice", price: 120, tag: "Basic", category: "Rice" },
  { name: "Veg Pulao", price: 220, tag: "Healthy", category: "Rice" },
  { name: "Kashmiri Pulao", price: 260, tag: "Sweet", category: "Rice" },
  { name: "Chicken Fried Rice", price: 290, tag: "Chinese", category: "Rice" },
  { name: "Schezwan Rice", price: 250, tag: "Spicy", category: "Rice" },

  // --- BREADS ---
  { name: "Butter Naan", price: 60, tag: "Popular", category: "Breads" },
  { name: "Garlic Naan", price: 80, tag: "Flavorful", category: "Breads" },
  { name: "Tandoori Roti", price: 25, tag: "Healthy", category: "Breads" },
  { name: "Butter Roti", price: 30, tag: "Basic", category: "Breads" },
  { name: "Missi Roti", price: 45, tag: "Traditional", category: "Breads" },
  { name: "Lachha Paratha", price: 55, tag: "Layered", category: "Breads" },
  { name: "Stuffed Kulcha", price: 90, tag: "Heavy", category: "Breads" },
  { name: "Cheese Garlic Naan", price: 110, tag: "Cheesy", category: "Breads" },
  { name: "Rumali Roti", price: 40, tag: "Thin", category: "Breads" },
  { name: "Aloo Paratha", price: 70, tag: "Breakfast", category: "Breads" },

  // --- INDO-CHINESE ---
  { name: "Veg Hakka Noodles", price: 210, tag: "Kids Choice", category: "Chinese" },
  { name: "Chicken Noodles", price: 260, tag: "Classic", category: "Chinese" },
  { name: "Honey Chilli Potato", price: 230, tag: "Sweet/Spicy", category: "Chinese" },
  { name: "Veg Spring Roll", price: 190, tag: "Crunchy", category: "Chinese" },
  { name: "Chicken Schezwan", price: 340, tag: "Very Spicy", category: "Chinese" },

  // --- BEVERAGES ---
  { name: "Masala Chai", price: 40, tag: "Hot", category: "Beverage" },
  { name: "Cold Coffee", price: 150, tag: "Cold", category: "Beverage" },
  { name: "Sweet Lassi", price: 90, tag: "Refreshing", category: "Beverage" },
  { name: "Mango Shake", price: 140, tag: "Seasonal", category: "Beverage" },
  { name: "Fresh Lime Soda", price: 80, tag: "Fizzy", category: "Beverage" },
  { name: "Masala Chaas", price: 60, tag: "Digestive", category: "Beverage" },
  { name: "Virgin Mojito", price: 160, tag: "Mocktail", category: "Beverage" },
  { name: "Blue Lagoon", price: 170, tag: "Mocktail", category: "Beverage" },
  { name: "Iced Tea", price: 110, tag: "Cold", category: "Beverage" },
  { name: "Hot Chocolate", price: 180, tag: "Warm", category: "Beverage" },

  // --- DESSERTS ---
  { name: "Gulab Jamun (2 pcs)", price: 80, tag: "Hot", category: "Dessert" },
  { name: "Ras Malai (2 pcs)", price: 120, tag: "Cold", category: "Dessert" },
  { name: "Gajar Ka Halwa", price: 150, tag: "Seasonal", category: "Dessert" },
  { name: "Kheer", price: 110, tag: "Classic", category: "Dessert" },
  { name: "Ice Cream Scoop", price: 70, tag: "Cold", category: "Dessert" },
  { name: "Brownie with Ice Cream", price: 220, tag: "Best Seller", category: "Dessert" },
  { name: "Moong Dal Halwa", price: 140, tag: "Rich", category: "Dessert" },
  { name: "Kulfi Falooda", price: 160, tag: "Traditional", category: "Dessert" },
  { name: "Fruit Cream", price: 180, tag: "Healthy", category: "Dessert" },
  { name: "Chocolate Mousse", price: 190, tag: "Smooth", category: "Dessert" }
];

async function seedMenuIfEmpty() {
  try {
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(defaultMenu);
    console.log(`Seeded ${defaultMenu.length} menu items.`);
  } catch (error) {
    console.error("Error seeding menu:", error);
  }
}

module.exports = {
  seedMenuIfEmpty,
};