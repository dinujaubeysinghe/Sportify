import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductListView = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    await addToCart(product._id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    // TODO: Implement wishlist functionality
    toast.success('Added to wishlist!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
        {/* Product Image */}
        <div className="md:w-64 flex-shrink-0">
          <Link to={`/products/${product._id}`} className="block">
            <div className="relative overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none">
              <img
                src={`${import.meta.env.VITE_SERVER_URL}${product.images?.[0]?.url}`}
                alt={product.name}
                className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Sale Badge */}
              {isOnSale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  -{product.discount}%
                </div>
              )}

              {/* Stock Status */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">Out of Stock</span>
                </div>
              )}

              {/* Quick Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={handleWishlist}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors mb-2"
                  title="Add to Wishlist"
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <Link
                  to={`/products/${product._id}`}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors block"
                  title="Quick View"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </Link>
              </div>
            </div>
          </Link>
        </div>

        {/* Product Info */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              {/* Category */}
              <div className="text-sm text-gray-500 mb-2 capitalize">
                {product.category?.name}
              </div>

              {/* Product Name */}
              <Link to={`/products/${product._id}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              {/* Brand */}
              <div className="inline-block bg-green-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-md mb-2">
                {product.brand?.name || 'No brand'}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.description || 'High-quality sports equipment designed for performance and durability. Perfect for athletes of all levels.'}
              </p>

              {/* Rating */}
              {product.ratings?.count > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.ratings.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {product.ratings.average} ({product.ratings.count} reviews)
                  </span>
                </div>
              )}

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.features?.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(getDiscountPrice())}
                </span>
                {isOnSale && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListView;
