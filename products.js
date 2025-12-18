// NYXEN WEARS - PRODUCTS Database
// This file contains all product information used across the website

const PRODUCTS = [
  {
    id: 0,
    name: 'BATMAN Hoodie',
    price: 2499,
    description: 'A bold and clean Batman hoodie designed for fans who like their style sharp. Featuring the iconic Bat emblem printed in high-definition, this hoodie blends comfort with a sleek, heroic look. Perfect for streetwear, casual outfits, or showing your inner vigilante energy.',
    imageFront: 'Product1(F).png',
    imageBack: 'Product1(B).png',
    color: 'Black with white print',
    material: 'Premium cotton blend',
    size: ['S', 'M', 'L', 'XL'],
    care: 'Machine wash cold, tumble dry low',
    isFeatured: true,
    category: 'hoodies'
  },
  {
    id: 1,
    name: 'Symbolic / Tattoo-Inspired Hoodie',
    price: 2499,
    description: 'A modern hoodie featuring a striking tattoo-inspired design, commonly seen in gym compression gear and Pinterest aesthetics. The artwork blends sharp lines, symbolic elements, and bold contrast to create a standout piece. Unique, expressive, and visually powerful, this hoodie adds an edgy artistic touch to any wardrobe.',
    imageFront: 'Product2(F).png',
    imageBack: 'Product2(B).png',
    color: 'Black with intricate white artwork',
    material: 'Premium cotton blend',
    size: ['S', 'M', 'L', 'XL'],
    care: 'Machine wash cold, tumble dry low',
    isFeatured: true,
    category: 'hoodies',
    style: 'Tattoo-inspired, gym-to-street versatile',
    design: 'Symbolic elements with sharp linework'
  },
  {
    id: 2,
    name: 'TRENDING MEME Hoodie',
    price: 1999,
    description: 'A playful twist on the viral streetwear meme. This hoodie carries the classic "Not From Paris Madame" print in a minimalist, urban-inspired layout. It\'s humorous, stylish, and easy to pair with any fit while keeping that subtle sarcastic vibe alive.',
    imageFront: 'Product3(F).png',
    imageBack: 'Product3(B).png',
    color: 'Black with minimalist print',
    material: 'Premium cotton blend',
    size: ['S', 'M', 'L', 'XL'],
    care: 'Machine wash cold, tumble dry low',
    isFeatured: true,
    category: 'hoodies',
    style: 'Urban streetwear, meme culture'
  }
];

// Helper function to get product by ID
function getProductById(id) {
  return PRODUCTS.find(product => product.id === parseInt(id));
}

// Helper function to get featured PRODUCTS
function getFeaturedPRODUCTS() {
  return PRODUCTS.filter(product => product.isFeatured);
}

// Helper function to get PRODUCTS by category
function getPRODUCTSByCategory(category) {
  return PRODUCTS.filter(product => product.category === category);
}

// Helper function to search PRODUCTS
function searchPRODUCTS(query) {
  const search = query.toLowerCase();
  return PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(search) ||
    product.description.toLowerCase().includes(search)
  );
}