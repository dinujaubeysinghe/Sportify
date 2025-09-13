import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  History,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Package,
  User,
  Calendar,
  Search,
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner';

const StockMovementHistory = ({ productId, productName, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: movementsData, isLoading } = useQuery(
    ['stock-movements', productId, searchQuery, filterType, currentPage],
    async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType !== 'all') params.append('type', filterType);
      params.append('page', currentPage);
      params.append('limit', 20);

      const response = await axios.get(
        `/inventory/item/${productId}/movements?${params.toString()}`
      );
      return response.data;
    },
    { enabled: !!productId }
  );

  const getMovementIcon = (type) => {
    switch (type) {
      case 'stock_in':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'stock_out':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-5 w-5 text-blue-600" />;
      case 'damage':
        return <Package className="h-5 w-5 text-orange-600" />;
      case 'return':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'stock_in':
        return 'bg-green-100 text-green-800';
      case 'stock_out':
        return 'bg-red-100 text-red-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      case 'damage':
        return 'bg-orange-100 text-orange-800';
      case 'return':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementText = (type) => {
    switch (type) {
      case 'stock_in':
        return 'Stock In';
      case 'stock_out':
        return 'Stock Out';
      case 'adjustment':
        return 'Adjustment';
      case 'damage':
        return 'Damage';
      case 'return':
        return 'Return';
      default:
        return 'Movement';
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto flex justify-center items-start pt-20"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Stock Movement History
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            {productName && `for ${productName}`}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search movements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="stock_in">Stock In</option>
            <option value="stock_out">Stock Out</option>
            <option value="adjustment">Adjustment</option>
            <option value="damage">Damage</option>
            <option value="return">Return</option>
          </select>
        </div>

        {/* Movements List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : movementsData?.movements?.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {movementsData.movements.map((movement) => (
              <div
                key={movement._id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getMovementIcon(movement.type)}
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementColor(
                            movement.type
                          )}`}
                        >
                          {getMovementText(movement.type)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {movement.quantity} units
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-1">
                        {movement.reason}
                      </p>
                      {movement.notes && (
                        <p className="text-sm text-gray-600">{movement.notes}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>
                            {movement.performedBy?.firstName}{' '}
                            {movement.performedBy?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(movement.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Stock Change</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {movement.previousStock} →
                      </span>
                      <span className="font-semibold text-gray-900">
                        {movement.newStock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Movements Found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filterType !== 'all'
                ? 'No stock movements match your search criteria.'
                : 'No stock movements recorded for this product yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {movementsData?.pages > 1 && (
          <div className="flex justify-center mt-4">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(movementsData.pages)].map((_, index) => {
                const page = index + 1;
                const isCurrent = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === movementsData.pages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMovementHistory;
