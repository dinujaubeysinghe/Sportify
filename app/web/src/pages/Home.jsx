import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { 
    ShoppingBag, 
    Truck, 
    Shield, 
    Star,
    ArrowRight,
    Zap,
    Trophy 
} from 'lucide-react';

// Components
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HeroSection from '../components/ui/HeroSection';
import NewsletterSignup from '../components/ui/NewsletterSignup';

// Framer Motion Variants (no changes needed)
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

const Home = () => {
    // --- Data Fetching (No changes needed, your logic is solid) ---
    const { data: featuredProducts = [], isLoading: productsLoading } = useQuery(
        'featured-products',
        async () => {
            const response = await axios.get('/products?isFeatured=true&limit=8');
            return response.data.products || [];
        }
    );

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

    const { cricketCategory, otherCategories } = useMemo(() => {
        const safeCategories = Array.isArray(rawCategoriesData) ? rawCategoriesData : [];
        return {
            cricketCategory: safeCategories.find(cat => cat.name.toLowerCase() === 'balls'),
            otherCategories: safeCategories.filter(cat => cat.name.toLowerCase() !== 'balls'),
        };
    }, [rawCategoriesData]);

    // --- NEW: Refined Feature Data ---
    const features = [
        { icon: <ShoppingBag className="w-8 h-8" />, title: "Vast Selection", description: "From grassroots to professional gear, we have it all." },
        { icon: <Truck className="w-8 h-8" />, title: "Island-wide Delivery", description: "Fast, reliable, and tracked shipping across Sri Lanka." },
        { icon: <Shield className="w-8 h-8" />, title: "Authenticity Guaranteed", description: "100% genuine products sourced from trusted brands." },
    ];

    return (
        <>
            <Helmet>
                <title>Sportify - Your Ultimate Sports Equipment Store in Sri Lanka</title>
                <meta 
                    name="description" 
                    content="Discover premium sports equipment for cricket, football, and more. Based in Sri Lanka, we offer fast island-wide shipping, a quality guarantee, and expert support." 
                />
            </Helmet>

            <div className="min-h-screen bg-slate-50">
                {/* 1. Hero Section */}
                <HeroSection />

                {/* 2. Why Choose Us Section (NEW DESIGN) */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Why Shop With Sportify?</h2>
                            <p className="mt-4 text-lg text-slate-600">The gear you need, with the service you deserve.</p>
                        </motion.div>
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {features.map((feature) => (
                                <motion.div 
                                    key={feature.title} 
                                    className="p-8 bg-slate-50 rounded-xl shadow-lg border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                                    variants={itemVariants}
                                >
                                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-5 text-blue-600">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* 3. Shop by Category Section (DYNAMIC MOSAIC DESIGN) */}
                <section className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Shop by Category</h2>
                            <p className="mt-4 text-lg text-slate-600">Find the right gear for your game.</p>
                        </motion.div>

                        {categoriesLoading ? (
                            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
                        ) : (
                            <motion.div 
                                className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[600px]"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.1 }}
                            >
                                {/* Cricket Feature Card */}
                                {cricketCategory && (
                                    <motion.div 
                                        variants={itemVariants}
                                        className="lg:col-span-3 lg:row-span-2 rounded-2xl overflow-hidden group relative shadow-2xl"
                                    >
                                        <img 
                                            src={`${import.meta.env.VITE_SERVER_URL}/${cricketCategory.image.url.replace(/\\/g, "/")}`} 
                                            alt={cricketCategory.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-8 text-white">
                                            <h3 className="text-4xl font-extrabold tracking-tight">{cricketCategory.name}</h3>
                                            <Link to={`/products?category=${cricketCategory._id}`} className="mt-4 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                                                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Other Categories Grid */}
                                {otherCategories.slice(0, 4).map((cat, index) => (
                                    <motion.div
                                        key={cat._id}
                                        variants={itemVariants}
                                        className={`lg:col-span-2 rounded-2xl overflow-hidden group relative shadow-xl ${index > 1 ? 'hidden md:block' : ''}`} // Hide 3rd & 4th on mobile for cleaner look
                                    >
                                        <img 
                                            src={`${import.meta.env.VITE_SERVER_URL}/${cat.image.url.replace(/\\/g, "/")}`} 
                                            alt={cat.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/60"></div>
                                        <Link to={`/products?category=${cat._id}`} className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                                            <h3 className="text-2xl font-bold">{cat.name}</h3>
                                            <p className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Collection</p>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* 4. Featured Products Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Top Picks & Deals</h2>
                            <p className="mt-4 text-lg text-slate-600 flex items-center justify-center">
                                <Zap className='h-5 w-5 text-yellow-500 mr-2'/> Limited Stock & Exclusive Offers Just For You
                            </p>
                        </motion.div>
                        
                        {productsLoading ? (
                            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
                        ) : (
                            <motion.div 
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.1 }}
                            >
                                {featuredProducts?.map((product) => (
                                    <motion.div key={product._id} variants={itemVariants}>
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* 5. Brand Story / CTA (NEW SECTION) */}
                <section className="bg-slate-800">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center bg-cover bg-center" style={{backgroundImage: `url('/images/stadium-bg.jpg')`}}>
                        <div className="bg-slate-900/60 p-10 rounded-xl backdrop-blur-sm">
                            <motion.h2 
                                className="text-4xl font-extrabold text-white tracking-tight"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                For the Love of the Game
                            </motion.h2>
                            <motion.p 
                                className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                We believe that sport has the power to change lives. That's why we're dedicated to providing every athlete in Sri Lanka with the best gear to chase their dreams.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Link to="/products" className="mt-8 inline-flex items-center px-8 py-3 bg-white text-blue-600 text-lg font-semibold rounded-full shadow-lg hover:bg-slate-100 transition-colors">
                                    Explore All Gear
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 6. Newsletter Section */}
                <NewsletterSignup />
            </div>
        </>
    );
};

export default Home;