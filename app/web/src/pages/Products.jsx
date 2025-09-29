import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

// Components
import ProductCard from '../components/products/ProductCard';
import ProductListView from '../components/products/ProductListView';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductFilters from '../components/ui/ProductFilters';
import ProductSearchSort from '../components/ui/ProductSearchSort';

const Products = () => {
  const [searchParams] = useSearchParams();

  // Local states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ? [searchParams.get('category')] : [],
    brand: searchParams.get('brand') ? [searchParams.get('brand')] : [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: [],
    availability: []
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ===== Fetch products =====
  const { data: productsData, isLoading, error } = useQuery(
    ['products', searchQuery, filters, sortBy, currentPage],
    async () => {
      const params = new URLSearchParams();

      if (searchQuery) params.append('search', searchQuery);
      if (filters.category.length > 0) params.append('category', filters.category.join(','));
      if (filters.brand.length > 0) params.append('brand', filters.brand.join(','));
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.rating.length > 0) params.append('rating', filters.rating.join(','));
      if (filters.availability.length > 0) params.append('availability', filters.availability.join(','));

      params.append('sort', sortBy);
      params.append('page', currentPage);
      params.append('limit', 12);

      const res = await axios.get(`/products?${params.toString()}`);
      return res.data;
    },
    { keepPreviousData: true, staleTime: 5 * 60 * 1000 }
  );

  // ===== Fetch categories & brands for filters =====
  const { data: categoriesData } = useQuery('categories', async () => {
    const res = await axios.get('/categories');
    return res.data;
  });

  const { data: brandsData } = useQuery('brands', async () => {
    const res = await axios.get('/brands');
    return res.data;
  });

  // ===== Handlers =====
  const handleFilterChange = (key, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      brand: [],
      minPrice: '',
      maxPrice: '',
      rating: [],
      availability: []
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearchChange = value => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = value => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleViewModeChange = mode => setViewMode(mode);
  const toggleFilters = () => setShowFilters(!showFilters);

  // Pagination
  const totalPages = productsData ? Math.ceil(productsData.total / 12) : 0;
  const handlePageChange = page => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Products - Sportify</title>
        <meta name="description" content="Browse our wide selection of sports equipment, gear, and accessories." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sports Equipment & Gear
            </h1>
            <p className="text-gray-600">Find the perfect equipment for your favorite sports</p>
          </div>

          {/* Search and Sort */}
          <ProductSearchSort
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onToggleFilters={toggleFilters}
            showFilters={showFilters}
            totalProducts={productsData?.total || 0}
          />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <ProductFilters
                filters={filters}
                categories={categoriesData || []}
                brands={brandsData || []}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                totalProducts={productsData?.total || 0}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Error loading products. Please try again.</p>
                </div>
              ) : (
                <>
                  {/* Products */}
                  {productsData?.products?.length > 0 ? (
                    <div
                      className={`grid gap-6 ${
                        viewMode === 'grid'
                          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
                          : 'grid-cols-1'
                      }`}
                    >
                      {productsData.products.map(product =>
                        viewMode === 'grid' ? (
                          <ProductCard key={product._id} product={product} />
                        ) : (
                          <ProductListView key={product._id} product={product} />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600 mb-4">
                          Try adjusting your search or filter criteria to find what you're looking for.
                        </p>
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          const isCurrentPage = page === currentPage;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isCurrentPage
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
