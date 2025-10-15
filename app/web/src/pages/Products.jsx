import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useMemo, useCallback, useState } from 'react';

// Components
import ProductCard from '../components/products/ProductCard';
import ProductListView from '../components/products/ProductListView';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductFilters from '../components/ui/ProductFilters';
import ProductSearchSort from '../components/ui/ProductSearchSort';
import { PackageSearch } from 'lucide-react';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => ({
        search: searchParams.get('search') || '',
        category: searchParams.getAll('category') || [],
        brand: searchParams.getAll('brand') || [],
        price: searchParams.get('price') || '',
        minRating: searchParams.get('minRating') || '',
        availability: searchParams.getAll('availability') || [],
        sort: searchParams.get('sort') || 'newest',
        page: Number(searchParams.get('page')) || 1,
    }), [searchParams]);
    
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    // --- FETCHING LOGIC ---
    const { data, isLoading, error } = useQuery(
        ['products', searchParams.toString()],
        async () => {
            const params = new URLSearchParams(searchParams.toString());
            
            // --- FIX: Translate price range for the API ---
            const priceRange = params.get('price');
            if (priceRange) {
                if (priceRange.includes('+')) {
                    params.set('minPrice', priceRange.replace('+', ''));
                } else if (priceRange.includes('-')) {
                    const [min, max] = priceRange.split('-');
                    params.set('minPrice', min);
                    params.set('maxPrice', max);
                }
                params.delete('price'); // Remove the original 'price' param
            }

            // --- FIX: Translate availability for the API ---
            if (params.getAll('availability').includes('onSale')) {
                params.set('onSale', 'true');
                params.delete('availability'); // Clean up old param
            }

            params.set('limit', '12');
            params.set('isActive', 'true');
            
            const res = await axios.get(`/products?${params.toString()}`);
            return res.data;
        },
        { keepPreviousData: true, staleTime: 5 * 60 * 1000 }
    );
    
    // --- NEW: Fetch categories & brands here to pass down ---
    const { data: categoriesData } = useQuery('all-categories', async () => (await axios.get('/categories')).data.categories || []);
    const { data: brandsData } = useQuery('all-brands', async () => (await axios.get('/brands')).data.brands || []);

    const productsData = data?.products || [];
    const totalProducts = data?.totalProducts || 0;
    const totalPages = data?.totalPages || 0;

    const updateSearchParams = useCallback((key, value, type = 'set') => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev.toString());
            if (type === 'multi') {
                const existing = newParams.getAll(key);
                if (existing.includes(value)) {
                    const filtered = existing.filter(v => v !== value);
                    newParams.delete(key);
                    filtered.forEach(v => newParams.append(key, v));
                } else {
                    newParams.append(key, value);
                }
            } else {
                if (value) newParams.set(key, value);
                else newParams.delete(key);
            }
            if (key !== 'page') newParams.set('page', '1');
            return newParams;
        });
    }, [setSearchParams]);

    const handleSearchChange = (value) => updateSearchParams('search', value);
    const handleSortChange = (value) => updateSearchParams('sort', value);
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            updateSearchParams('page', page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const handleFilterChange = (key, value) => {
        const multiSelectKeys = ['category', 'brand', 'availability'];
        if (multiSelectKeys.includes(key)) {
            updateSearchParams(key, value, 'multi');
        } else {
            const current = filters[key];
            updateSearchParams(key, current === value ? '' : value);
        }
    };
    const clearFilters = () => setSearchParams({});

    const generatePagination = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (filters.page > 4) pages.push('...');
            let start = Math.max(2, filters.page - 2);
            let end = Math.min(totalPages - 1, filters.page + 2);
            for (let i = start; i <= end; i++) pages.push(i);
            if (filters.page < totalPages - 3) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <>
            <Helmet>
                <title>Products - Sportify</title>
                <meta name="description" content="Browse our wide selection of sports equipment, gear, and accessories." />
            </Helmet>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sports Equipment & Gear</h1>
                        <p className="text-gray-600">Find the perfect equipment for your favorite sports</p>
                    </div>

                    <ProductSearchSort
                        searchQuery={filters.search}
                        onSearchChange={handleSearchChange}
                        sortBy={filters.sort}
                        onSortChange={handleSortChange}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        showFilters={showFilters}
                        totalProducts={totalProducts}
                    />

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className={`lg:w-80 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            <ProductFilters
                                activeFilters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={clearFilters}
                                totalProducts={totalProducts}
                                categories={categoriesData} // Pass fetched data
                                brands={brandsData}         // Pass fetched data
                            />
                        </div>

                        <div className="flex-1">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-600">Error loading products. Please try again.</div>
                            ) : (
                                <>
                                    {productsData.length > 0 ? (
                                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                            {productsData.map(product =>
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
                                                <PackageSearch className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                                                <h3 className="text-xl font-medium text-gray-900 mb-2">No Products Found</h3>
                                                <p className="text-gray-600 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
                                                <button onClick={clearFilters} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                                    Clear All Filters
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {totalPages > 1 && (
                                        <div className="flex justify-center mt-12">
                                            <nav className="flex items-center space-x-1 sm:space-x-2">
                                                <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    Previous
                                                </button>
                                                {generatePagination().map((page, index) =>
                                                    typeof page === 'number' ? (
                                                        <button key={`${page}-${index}`} onClick={() => handlePageChange(page)} className={`px-4 py-2 text-sm font-medium rounded-lg ${page === filters.page ? 'bg-blue-600 text-white' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                                            {page}
                                                        </button>
                                                    ) : (
                                                        <span key={`dots-${index}`} className="px-4 py-2 text-sm font-medium text-gray-500">...</span>
                                                    )
                                                )}
                                                <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page === totalPages} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
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