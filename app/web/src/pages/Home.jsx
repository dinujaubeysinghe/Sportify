import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  ShoppingBag, 
  Truck, 
  Shield, 
  Star,
  Users,
  Package
} from 'lucide-react';

// Components
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HeroSection from '../components/ui/HeroSection';
import NewsletterSignup from '../components/ui/NewsletterSignup';

// Helper function to get category icons
const getCategoryIcon = (category) => {
  const icons = {
    football: '⚽',
    basketball: '🏀',
    soccer: '⚽',
    tennis: '🎾',
    golf: '⛳',
    baseball: '⚾',
    hockey: '🏒',
    swimming: '🏊',
    running: '🏃',
    fitness: '💪',
    outdoor: '🏔️',
    'winter-sports': '⛷️',
    'water-sports': '🏄',
    'combat-sports': '🥊',
    accessories: '🎒',
    clothing: '👕',
    shoes: '👟',
    equipment: '🏋️'
  };
  return icons[category?.toLowerCase()] || '🏆';
};

const Home = () => {
  // Fetch featured products
  const { data: featuredProducts, isLoading: productsLoading } = useQuery(
    'featured-products',
    async () => {
      const response = await axios.get('/products');
      return response.data.products;
    }
  );

  // Fetch categories
const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery(
  'categories',
  async () => {
    try {
      const response = await axios.get(`/categories`);
      return Array.isArray(response.data.categories) ? response.data.categories : [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  }
);




  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Wide Selection",
      description: "Find everything you need for your favorite sports"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fast Shipping",
      description: "Quick and reliable delivery to your doorstep"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Guarantee",
      description: "Premium products from trusted brands"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Expert Support",
      description: "Get help from sports equipment specialists"
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, label: "Happy Customers", value: "10,000+" },
    { icon: <Package className="w-6 h-6" />, label: "Products", value: "5,000+" },
    { icon: <Truck className="w-6 h-6" />, label: "Orders Delivered", value: "50,000+" },
    { icon: <Star className="w-6 h-6" />, label: "Average Rating", value: "4.8/5" }
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

      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Shop by Categories
              </h2>
            </div>

            {categoriesLoading ? (
              <div className="flex justify-center"><LoadingSpinner /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {Array.isArray(categoriesData) && categoriesData.map((cat) => (
                  <div key={cat._id}
                    className="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition"
                  >
                    {cat.image?.url ? (
                      <img 
                        src={`${import.meta.env.VITE_SERVER_URL}/${cat.image.url.replace(/\\/g, "/")}`} 
                        alt={cat.image.alt || cat.name} 
                        className="w-16 h-16 object-contain mx-auto mb-3"
                      />
                    ) : (
                      <span className="text-4xl mb-3 block">{getCategoryIcon(cat.name)}</span>
                    )}
                    <h3 className="text-gray-900 font-semibold">{cat.name}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Sportify?
              </h2>
              <p className="text-lg text-gray-600">
                We're committed to providing the best sports equipment experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
            </div>

            {productsLoading ? (
              <div className="flex justify-center"><LoadingSpinner /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts?.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSignup />
      </div>
    </>
  );
};

export default Home;
