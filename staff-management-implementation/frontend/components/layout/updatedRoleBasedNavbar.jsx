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
    // New state to manage active desktop dropdowns (Inventory, Finance, Staff Management)
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
              { name: 'Staff Analytics', href: '/admin/staff/analytics', icon: BarChart3 },
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
      baseUserNav.unshift({  name: 'Orders', href: '/orders', icon: ShoppingCart  });
    }

    return baseUserNav;
  };

  const navigationItems = getNavigationItems();
  const userNavigation = getUserNavigation();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              Sportify
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative">
                {item.type === 'dropdown' ? (
                  <div
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      activeDropdown === item.name ? 'rotate-180' : ''
                    }`} />
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {item.type === 'dropdown' && activeDropdown === item.name && (
                  <div
                    className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        <subItem.icon className="h-4 w-4 mr-3" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex md:items-center md:flex-1 md:max-w-md md:ml-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            {isAuthenticated && user?.role === 'customer' && (
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Wishlist */}
            {isAuthenticated && user?.role === 'customer' && (
              <Link to="/wishlist" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <Heart className="h-6 w-6" />
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <button className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <Bell className="h-6 w-6" />
              </button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    {userNavigation.map((navItem) => (
                      <Link
                        key={navItem.name}
                        to={navItem.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        <navItem.icon className="h-4 w-4 mr-3" />
                        {navItem.name}
                      </Link>
                    ))}
                    
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </form>
              </div>

              {/* Mobile Navigation Items */}
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.type === 'dropdown' ? (
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-2 text-gray-700 font-medium">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      <div className="ml-7 mt-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile User Menu */}
              {isAuthenticated && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  {userNavigation.map((navItem) => (
                    <Link
                      key={navItem.name}
                      to={navItem.href}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      <navItem.icon className="h-5 w-5" />
                      <span>{navItem.name}</span>
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
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
