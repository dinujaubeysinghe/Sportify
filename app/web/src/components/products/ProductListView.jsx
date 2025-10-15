import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import useSettings from '../../hooks/useSettings'; // Make sure this path is correct

const ProductListView = ({ product }) => {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { settings } = useSettings(); // Use settings hook

    // --- FIX: Use dynamic currency ---
    const currencyCode = settings?.currency || 'LKR'; 
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode
        }).format(price);
    };
    
    // The rest of your handlers and logic remain the same...
    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            return;
        }
        await addToCart(product._id, 1);
    };

    const getDiscountPrice = () => {
        if (product.discount > 0) {
            return product.price * (1 - product.discount / 100);
        }
        return product.price;
    };
    
    const isOnSale = product.discount > 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 group">
            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-64 flex-shrink-0">
                    <Link to={`/products/${product._id}`} className="block relative overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none h-48 md:h-full">
                        <img
                            src={`${import.meta.env.VITE_SERVER_URL}${product.images?.[0]?.url}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isOnSale && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                                -{product.discount}%
                            </div>
                        )}
                        {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-semibold">Out of Stock</span>
                            </div>
                        )}
                    </Link>
                </div>
                {/* Info Section */}
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-2 capitalize">{product.category?.name}</div>
                        <Link to={`/products/${product._id}`}>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                        </Link>
                        <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-md mb-2">
                            {product.brand?.name || 'No Brand'}
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                        {product.ratings?.count > 0 && (
                            <div className="flex items-center mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.ratings.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 ml-2">{product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-gray-900">{formatPrice(getDiscountPrice())}</span>
                            {isOnSale && (
                                <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
                            )}
                        </div>
                        <button onClick={handleAddToCart} disabled={product.stock === 0} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListView;