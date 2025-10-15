import { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";

const ProductFilters = ({ activeFilters, onFilterChange, onClearFilters, totalProducts, categories, brands }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ category: true, brand: true });

  const filterSections = [
    { key: "category", title: "Category", options: categories?.map(c => ({ value: c._id, label: c.name })) || [] },
    { key: "brand", title: "Brand", options: brands?.map(b => ({ value: b._id, label: b.name })) || [] },
    { key: "price", title: "Price Range", options: [
        { value: "0-5000", label: "Under LKR 5,000" },
        { value: "5000-10000", label: "LKR 5,000 - LKR 10,000" },
        { value: "10000-25000", label: "LKR 10,000 - LKR 25,000" },
        { value: "25000-50000", label: "LKR 25,000 - LKR 50,000" },
        { value: "50000+", label: "Over LKR 50,000" },
    ]},
    { key: "minRating", title: "Customer Rating", options: [
        { value: "4.5", label: "4.5 Stars & Up" },
        { value: "4", label: "4 Stars & Up" },
        { value: "3", label: "3 Stars & Up" },
    ]},
    { key: "availability", title: "Availability", options: [{ value: "onSale", label: "On Sale" }] },
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // --- FIX: Count only the actual UI filters, not URL params like 'sort' or 'page' ---
  const getActiveFiltersCount = () => {
    const filterKeys = ['category', 'brand', 'price', 'minRating', 'availability'];
    return filterKeys.reduce((count, key) => {
      const value = activeFilters[key];
      if (Array.isArray(value)) return count + value.length;
      if (value) return count + 1;
      return count;
    }, 0);
  };
  
  const isChecked = (key, value) => {
    if (Array.isArray(activeFilters[key])) return activeFilters[key].includes(value);
    return activeFilters[key] === value;
  };

  const activeFilterCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Mobile Filter Header */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left">
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-gray-600" />
            <span className="font-semibold text-gray-900">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{activeFilterCount}</span>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Filter Header */}
      <div className="hidden lg:block p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <button onClick={onClearFilters} className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              <X className="w-4 h-4 mr-1" /> Clear All
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{totalProducts} products found</p>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
        <div className="p-4 space-y-6">
          {filterSections.map((section) => (
            section.options.length > 0 && <div key={section.key}>
              <button onClick={() => toggleSection(section.key)} className="flex items-center justify-between w-full text-left mb-3">
                <h4 className="font-medium text-gray-900">{section.title}</h4>
                {expandedSections[section.key] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {expandedSections[section.key] && (
                <div className="space-y-2">
                  {section.options.map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50">
                      <input type="checkbox" checked={isChecked(section.key, option.value)} onChange={() => onFilterChange(section.key, option.value)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;