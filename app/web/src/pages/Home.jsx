import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { 
    ShoppingBag, 
    Truck, 
    Shield, 
    Star,
    Users,
    Package,
    ArrowRight,
    Zap,
    Trophy 
} from 'lucide-react';

// Components
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HeroSection from '../components/ui/HeroSection';
import NewsletterSignup from '../components/ui/NewsletterSignup';

// Framer Motion Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, when: "beforeChildren" },
    },
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, type: "spring" } },
};

// Helper function to get category icons (kept for fallback)
const getCategoryIcon = (category) => {
    const icons = {
        cricket: '🏏',
        football: '⚽',
        basketball: '🏀',
        // ... (other icons)
        equipment: '🏋️'
    };
    return icons[category?.toLowerCase()] || '🏆';
};

const Home = () => {
    // Fetch featured products
    const { data: featuredProducts = [], isLoading: productsLoading } = useQuery(
        'featured-products',
        async () => {
            const response = await axios.get('/products?isFeatured=true&limit=8');
            return response.data.products || [];
        }
    );

    // Fetch categories (Robust array handling in error/response)
    const { data: rawCategoriesData = [], isLoading: categoriesLoading } = useQuery(
        'categories',
        async () => {
            try {
                const response = await axios.get(`/categories`);
                const dataArray = response.data?.categories; 
                return Array.isArray(dataArray) 
                    ? dataArray.filter(cat => cat.isActive !== false)
                    : [];
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                return []; 
            }
        }
    );

    // --- CRITICAL FIX: Use useMemo to safely process categories only when data is stable ---
    const { cricketCategory, otherCategories } = useMemo(() => {
        const safeCategories = Array.isArray(rawCategoriesData) ? rawCategoriesData : [];
        
        return {
            cricketCategory: safeCategories.find(
                cat => cat.name.toLowerCase() === 'cricket'
            ),
            otherCategories: safeCategories.filter(
                cat => cat.name.toLowerCase() !== 'cricket'
            ),
        };
    }, [rawCategoriesData]); // Logic runs only when data is stable and available
    // -----------------------------------------------------------------------------


    // --- Other Static Data (Features/Stats) remains the same ---
    const features = [
        { icon: <ShoppingBag className="w-8 h-8" />, title: "Wide Selection", description: "Find everything you need for your favorite sports" },
        { icon: <Truck className="w-8 h-8" />, title: "Fast Shipping", description: "Quick and reliable delivery to your doorstep" },
        { icon: <Shield className="w-8 h-8" />, title: "Quality Guarantee", description: "Premium products from trusted brands" },
        { icon: <Star className="w-8 h-8" />, title: "Expert Support", description: "Get help from sports equipment specialists" }
    ];

    const stats = [
        { icon: <Users className="w-6 h-6" />, label: "Happy Customers", value: "10,000+", suffix: "" },
        { icon: <Package className="w-6 h-6" />, label: "Products", value: "5,000+", suffix: "" },
        { icon: <Truck className="w-6 h-6" />, label: "Orders Delivered", value: "50,000+", suffix: "" },
        { icon: <Star className="w-6 h-6" />, label: "Average Rating", value: "4.8", suffix: "/5" }
    ];


    return (
        <>
            <Helmet>
                <title>Sportify - Your Ultimate Sports Equipment Store</title>
                <meta 
                    name="description" 
                    content="Discover premium sports equipment, gear, and accessories for all your favorite sports. Fast shipping, quality guarantee, and expert support." 
                />
            </Helmet>

            <div className="min-h-screen bg-white">
                {/* 1. Hero Section */}
                <HeroSection />

                {/* 2. Stats Section (unchanged) */}
                <section className="py-16 bg-gray-50 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div 
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            {stats.map((stat, index) => (
                                <motion.div 
                                    key={index} 
                                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-transform hover:scale-[1.02] duration-300"
                                    variants={itemVariants}
                                >
                                    <div className="flex items-center space-x-3 text-blue-600 mb-2">
                                        {stat.icon}
                                        <span className="text-sm font-medium text-gray-500 uppercase">{stat.label}</span>
                                    </div>
                                    <div className="text-4xl font-extrabold text-gray-900">
                                        {stat.value}
                                        <span className='text-base font-semibold text-blue-600'>{stat.suffix}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* 3. Categories Section (Enhanced Modern Design) */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                                Discover Your Sport
                            </h2>
                            <p className="text-xl text-gray-600">Shop by our most popular categories.</p>
                        </div>

                        {categoriesLoading ? (
                            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
                        ) : (
                            <motion.div 
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                {/* 1. Cricket Priority Card (Large, Dynamic Focus) */}
                                {cricketCategory && (
                                    <motion.a 
                                        key={cricketCategory._id}
                                        href={`/products?category=${cricketCategory._id}`}
                                        className="col-span-2 sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-6 text-center shadow-2xl border-4 border-yellow-400 transform transition-all duration-500 hover:scale-[1.03]"
                                        variants={itemVariants}
                                    >
                                        <div className="flex justify-center mb-4">
                                            {cricketCategory.image?.url ? (
                                                <img 
                                                    src={`${import.meta.env.VITE_SERVER_URL}/${cricketCategory.image.url.replace(/\\/g, "/")}`} 
                                                    alt={cricketCategory.name} 
                                                    className="w-full h-16 object-contain filter rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-7xl block animate-pulse">{getCategoryIcon(cricketCategory.name)}</span>
                                            )}
                                        </div>
                                        <h3 className="text-white font-extrabold text-3xl mb-1">{cricketCategory.name.toUpperCase()}</h3>
                                        <p className="text-blue-200 mt-1 font-medium text-sm flex items-center justify-center">
                                            <Trophy className="h-4 w-4 mr-1"/> Our Top Priority
                                        </p>
                                    </motion.a>
                                )}

                                {/* 2. Other Categories (Clean Grid Cards) */}
                                {otherCategories.map((cat) => (
                                    <motion.a 
                                        key={cat._id}
                                        href={`/products?category=${cat._id}`}
                                        className="bg-gray-100 rounded-xl p-4 text-center hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 shadow-md border border-gray-200"
                                        variants={itemVariants}
                                    >
                                        <div className="mb-3">
                                            {cat.image?.url ? (
                                                <img 
                                                    src={`${import.meta.env.VITE_SERVER_URL}/${cat.image.url.replace(/\\/g, "/")}`} 
                                                    alt={cat.image.alt || cat.name} 
                                                    className="h-full object-contain mx-auto w-full rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-3xl block">{getCategoryIcon(cat.name)}</span>
                                            )}
                                        </div>
                                        <h3 className="text-gray-900 font-bold text-sm">{cat.name}</h3>
                                    </motion.a>
                                ))}
                            </motion.div>
                        )}
                        <div className="text-center mt-12">
                            <a 
                                href="/products" 
                                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                            >
                                View All Products <ArrowRight className="ml-3 h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* 4. Features Section (Animated) */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                                Your Trusted Sports Partner
                            </h2>
                        </div>
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            {features.map((feature, index) => (
                                <motion.div 
                                    key={index} 
                                    className="text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors shadow-md"
                                    variants={itemVariants}
                                >
                                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-blue-600 shadow-md">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* 5. Featured Products Section (Animated) */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                                Top Picks & Deals
                            </h2>
                            <p className="text-lg text-gray-600 flex items-center justify-center">
                                <Zap className='h-5 w-5 text-yellow-500 mr-2'/> Limited Stock & Exclusive Offers
                            </p>
                        </div>

                        {productsLoading ? (
                            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
                        ) : (
                            <motion.div 
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                {featuredProducts?.length > 0 ? (
                                    featuredProducts.map((product) => (
                                        <motion.div key={product._id} variants={itemVariants}>
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10 text-gray-600">
                                        No featured products available right now.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* 6. Newsletter Section */}
                <NewsletterSignup />
            </div>
        </>
    );
};

export default Home;