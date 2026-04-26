// ==============================
// TYPES
// ==============================
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface ProductDetails {
  ingredients?: string;
  usage?: string;
  benefits?: string[];
  specifications?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  requiresPrescription: boolean;
  brand: string;
  rating: number;
  reviews: number;
  details?: ProductDetails;
}

// ==============================
// CATEGORIES
// ==============================
export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Products', icon: '🏥' },
  { id: 'skincare', name: 'Skin Care', icon: '✨' },
  { id: 'baby', name: 'Baby Care', icon: '👶' },
  { id: 'equipment', name: 'Medical Equipment', icon: '🩺' },
  { id: 'medicine', name: 'Medicines', icon: '💊' },
  { id: 'veterinary', name: 'Veterinary', icon: '🐾' },
  { id: 'personal', name: 'Personal Care', icon: '🧴' },
  { id: 'vitamins', name: 'Vitamins & Supplements', icon: '💪' },
  { id: 'firstaid', name: 'First Aid', icon: '🩹' },
  { id: 'diabetes', name: 'Diabetes Care', icon: '📊' },
  { id: 'maternal', name: 'Maternal Health', icon: '🤰' },
];

// ==============================
// PRODUCTS
// ==============================
export const ALL_PRODUCTS: Product[] = [
  {
    id: 'sc1',
    name: 'Onelle Moisturizing Sunscreen SPF50 PA+++',
    description: 'Water-resistant sunscreen shields your skin from sun damage',
    price: 2100,
    stock: 45,
    category: 'skincare',
    imageUrl:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',
    requiresPrescription: false,
    brand: 'Onelle Naturals',
    rating: 4.8,
    reviews: 124,
    details: {
      ingredients:
        'Aloe Vera, Glycerin, Vitamin E, Zinc Oxide',
      usage:
        'Apply generously 15 minutes before sun exposure. Reapply every 2 hours.',
      benefits: [
        'SPF 50 Protection',
        'Water Resistant',
        'Non-greasy',
        'For all skin types',
      ],
      specifications: {
        Volume: '100ml',
        'SPF Level': '50',
      },
    },
  },

  {
    id: 'sc2',
    name: 'Vitamin C Brightening Serum',
    description: 'Reduces dark spots and enhances skin radiance',
    price: 3500,
    stock: 32,
    category: 'skincare',
    imageUrl:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    requiresPrescription: false,
    brand: 'GlowLab',
    rating: 4.6,
    reviews: 89,
    details: {
      benefits: [
        'Brightens skin',
        'Reduces wrinkles',
        'Antioxidant protection',
      ],
      specifications: {
        Volume: '30ml',
      },
    },
  },

  // (rest of your products remain same)
];

// ==============================
// FUNCTIONS
// ==============================
export const getProductById = (id: string): Product | undefined => {
  return ALL_PRODUCTS.find((product) => product.id === id);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  if (categoryId === 'all') return ALL_PRODUCTS;

  return ALL_PRODUCTS.filter(
    (product) => product.category === categoryId
  );
};