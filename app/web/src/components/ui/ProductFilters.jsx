import { useState, useEffect } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

const ProductFilters = ({ filters, onFilterChange, onClearFilters, totalProducts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [filterSections, setFilterSections] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get("/categories"),
          axios.get("/brands"),
        ]);

        const sections = [
          {
            key: "category",
            title: "Category",
            options: categoriesRes.data.categories.map((cat) => ({
              value: cat._id,
              label: cat.name,
              image: cat.image?.url || null,
              count: cat.productCount || 0,
            })),
          },
          {
            key: "brand",
            title: "Brand",
            options: brandsRes.data.brands.map((brand) => ({
              value: brand._id,
              label: brand.name,
              image: brand.logo?.url || null,
              count: brand.productCount || 0,
            })),
          },
          {
            key: "price",
            title: "Price Range",
            options: [
              { value: "0-50", label: "Under $50" },
              { value: "50-100", label: "$50 - $100" },
              { value: "100-200", label: "$100 - $200" },
              { value: "200-500", label: "$200 - $500" },
              { value: "500+", label: "Over $500" },
            ],
          },
          {
            key: "rating",
            title: "Customer Rating",
            options: [
              { value: "4.5+", label: "4.5 & Up" },
              { value: "4+", label: "4 & Up" },
              { value: "3.5+", label: "3.5 & Up" },
              { value: "3+", label: "3 & Up" },
            ],
          },
          {
            key: "availability",
            title: "Availability",
            options: [
              { value: "in-stock", label: "In Stock" },
              { value: "low-stock", label: "Low Stock" },
              { value: "on-sale", label: "On Sale" },
            ],
          },
        ];

        setFilterSections(sections);
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    };

    fetchFilters();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (filterKey, value, checked) => {
    onFilterChange(filterKey, value, checked);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce(
      (total, filterArray) => total + filterArray.length,
      0
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Mobile Filter Header */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-gray-600" />
            <span className="font-semibold text-gray-900">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Desktop Filter Header */}
      <div className="hidden lg:block p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{totalProducts} products found</p>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
        <div className="p-4 space-y-6">
          {filterSections.map((section) => (
            <div key={section.key}>
              <button
                onClick={() => toggleSection(section.key)}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h4 className="font-medium text-gray-900">{section.title}</h4>
                {expandedSections[section.key] ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expandedSections[section.key] && (
                <div className="space-y-2">
                  {section.options.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            filters[section.key]?.includes(option.value) || false
                          }
                          onChange={(e) =>
                            handleFilterChange(
                              section.key,
                              option.value,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {/* Show image/logo if available */}
                        {option.image && (
                          <img
                            src={`${import.meta.env.VITE_SERVER_URL}/${option.image.replace(/\\/g, "/")}`} 
                            alt={option.label}
                            className="ml-3 w-6 h-6 object-contain"
                          />
                        )}
                        <span className="ml-3 text-sm text-gray-700">
                          {option.label}
                        </span>
                      </div>
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-500">
                          ({option.count})
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Clear Button */}
        {getActiveFiltersCount() > 0 && (
          <div className="lg:hidden p-4 border-t border-gray-200">
            <button
              onClick={onClearFilters}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
