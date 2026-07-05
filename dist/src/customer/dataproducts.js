"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.getProductById = exports.ALL_PRODUCTS = exports.CATEGORIES = void 0;
exports.CATEGORIES = [
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
exports.ALL_PRODUCTS = [
    {
        id: 'sc1',
        name: 'Onelle Moisturizing Sunscreen SPF50 PA+++',
        description: 'Water-resistant sunscreen shields your skin from sun damage',
        price: 2100,
        stock: 45,
        category: 'skincare',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',
        requiresPrescription: false,
        brand: 'Onelle Naturals',
        rating: 4.8,
        reviews: 124,
        details: {
            ingredients: 'Aloe Vera, Glycerin, Vitamin E, Zinc Oxide',
            usage: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours.',
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
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
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
];
const getProductById = (id) => {
    return exports.ALL_PRODUCTS.find((product) => product.id === id);
};
exports.getProductById = getProductById;
const getProductsByCategory = (categoryId) => {
    if (categoryId === 'all')
        return exports.ALL_PRODUCTS;
    return exports.ALL_PRODUCTS.filter((product) => product.category === categoryId);
};
exports.getProductsByCategory = getProductsByCategory;
//# sourceMappingURL=dataproducts.js.map