import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingCart, 
  User, 
  Heart,
  ChevronDown,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Truck,
  MessageCircle,
  Shield,
  TrendingUp,
  Tag,
  UserCog,
  Cog,
  Currency,
  DollarSign,
  CreditCard,
  Building2,
  UserPlus,
  IdCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const RoleBasedNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
    // New state to manage active desktop dropdowns (Inventory, Finance)
    const [activeDropdown, setActiveDropdown] = useState(null); 
    
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

    // Ref to hold the closing timer ID
    const [closeTimer, setCloseTimer] = useState(null); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

    // Close all menus when navigating
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);
    
    // --- DROPDOWN FIX HANDLERS ---
    const handleMouseEnter = (menuName) => {
        if (closeTimer) clearTimeout(closeTimer);
        setActiveDropdown(menuName);
    };

    const handleMouseLeave = () => {
        const timer = setTimeout(() => {
            setActiveDropdown(null);
        }, 150); // Small delay to allow mouse transition to submenu
        setCloseTimer(timer);
    };
    // ----------------------------


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Home', href: '/' },
      { name: 'Products', href: '/products' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' }
    ];

    if (!isAuthenticated || !user) {
      return baseItems;
    }

    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, type: 'link' },
          
          // DROPDOWN 1: INVENTORY
          { name: 'Inventory', icon: BarChart3, type: 'dropdown', subItems: [
              { name: 'Inventory List', href: '/admin/inventory', icon: BarChart3 },
              { name: 'Categories', href: '/admin/categories', icon: Package },
              { name: 'Brands', href: '/admin/brands', icon: Tag },
            ]},
          
          // DROPDOWN 2: FINANCE
          { name: 'Finance', icon: DollarSign, type: 'dropdown', subItems: [
              { name: 'Payments', href: '/admin/payments', icon: CreditCard },
              { name: 'Discounts', href: '/admin/discount', icon: Tag},
            ]},
          
          // DROPDOWN 3: STAFF MANAGEMENT (NEW)
          { name: 'Staff Management', icon: Users, type: 'dropdown', subItems: [
              { name: 'Staff List', href: '/admin/staff', icon: Users },
              { name: 'Add Staff', href: '/admin/staff/add', icon: UserPlus },
              { name: 'Departments', href: '/admin/departments', icon: Building2 },
              // { name: 'Generate Reports', href: '/admin/reports', icon: BarChart3 },
            ]},
          
          { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, type: 'link' },
          { name: 'Users', href: '/admin/users', icon: Users, type: 'link' },
          { name: 'Suppliers', href: '/admin/suppliers', icon: UserCog, type: 'link'},
          { name: 'Settings', href: '/admin/settings', icon: Cog, type: 'link'}
        ];
      case 'supplier':
        return [
          { name: 'Dashboard', href: '/supplier', icon: LayoutDashboard },
          { name: 'Products', href: '/supplier/products', icon: Package },
          { name: 'Orders', href: '/supplier/orders', icon: ShoppingCart },
          { name: 'Inventory', href: '/supplier/inventory', icon: Truck },
          { name: 'Payments', href: '/supplier/payments', icon: BarChart3 },
          { name: 'Analysis', href: '/supplier/analysis', icon: TrendingUp },
        ];
      case 'staff':
        return [
          { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
          { name: 'Orders', href: '/staff/orders', icon: ShoppingCart },
          { name: 'Customers', href: '/staff/customers', icon: Users },
          { name: 'Support', href: '/staff/support', icon: MessageCircle }
        ];
      default:
        return baseItems;
    }
  };

  const getUserNavigation = () => {
    if (!isAuthenticated || !user) {
      return [];
    }

    const baseUserNav = [
      { name: 'Profile', href: '/profile', icon: User },
    ];

    // Add role-specific navigation
    if (user.role === 'admin') {
      baseUserNav.unshift({ name: 'Admin Panel', href: '/admin', icon: Shield });
    } else if (user.role === 'supplier') {
      baseUserNav.unshift({ name: 'Supplier Panel', href: '/supplier', icon: Truck });
    } else if (user.role === 'staff') {
      baseUserNav.unshift({ name: 'Staff Panel', href: '/staff', icon: MessageCircle });
    }else{
      baseUserNav.unshift({  name: 'Orders', href: '/orders', icon: ShoppingCart  });
    }

    return baseUserNav;
  };

  const navigation = getNavigationItems();
  const userNavigation = getUserNavigation();
    
    // Helper to determine if a dropdown item is active (for styling the parent button)
    const isDropdownActive = (subItems) => {
        return subItems.some(item => location.pathname === item.href);
    };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg backdrop-blur-md bg-opacity-95' 
        : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/SportifyLogo.png" 
                alt="Sportify Logo"
                className="w-auto h-8" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navigation.map((item) => {
                if (item.type === 'dropdown') {
                    // Dropdown Menu Logic (Inventory/Finance)
                    const isActive = isDropdownActive(item.subItems);
                    
                    return (
                        <div 
                            key={item.name} 
                            className="relative"
                            onMouseEnter={() => handleMouseEnter(item.name)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                type="button"
                                className={`flex items-center px-1 py-1 text-sm font-semibold transition-colors duration-200 ${
                                    isActive || activeDropdown === item.name
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-700 hover:text-blue-600'
                                }`}
                            >
                                {item.name}
                                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                            
                            {/* Dropdown Content */}
                            {(activeDropdown === item.name) && (
                                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                                    {item.subItems.map((subItem) => (
                                        <Link
                                            key={subItem.name}
                                            to={subItem.href}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                            onClick={() => setActiveDropdown(null)}
                                        >
                                            <subItem.icon className="h-4 w-4 mr-3 text-gray-500" />
                                            {subItem.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                }
                
                // Standard Link Logic
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-1 py-1 text-sm font-semibold transition-colors duration-200 ${
                        // Use startsWith for parent routes like /admin
                      location.pathname.startsWith(item.href) && item.href !== '/' || location.pathname === item.href
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                  }`}
                  >
                    {item.name}
                  </Link>
                );
            })}
          </div>



          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon for Mobile (Kept for consistency) */}
            <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
              <Search className="h-5 w-5" />
            </button>

            {/* Cart - only show for customers */}
            {(!user || user.role === 'customer') && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors rounded-full p-2 hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium">
                    Hi, {user?.firstName}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100 animate-fade-in-down origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded mt-1">
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </span>
                    </div>
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-3 text-gray-500" />
                        {item.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 ml-3"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              {navigation.map((item) => {
                    if (item.type === 'dropdown') {
                        // Mobile Dropdown Logic
                        return (
                            <div key={item.name} className="space-y-1">
                                <p className="flex items-center px-3 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-md">
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </p>
                                <div className="ml-6 border-l border-gray-200">
                                    {item.subItems.map((subItem) => (
                                        <Link
                                            key={subItem.name}
                                            to={subItem.href}
                                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <subItem.icon className="w-4 h-4 mr-3" />
                                            {subItem.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    
                    // Standard Link Logic
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-3 py-2 text-base font-medium ${
                                location.pathname.startsWith(item.href) && item.href !== '/' || location.pathname === item.href
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                            {item.name}
                        </Link>
                    );
                })}


              {/* Mobile User Actions */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white block px-3 py-2 text-base font-medium rounded-lg mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RoleBasedNavbar;