import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Layout Components
import RoleBasedNavbar from './components/layout/RoleBasedNavbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Contact from './pages/Contact';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import SystemTest from './pages/SystemTest';
import About from './pages/about';
import ReviewSubmission from './pages/ReviewSubmission';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminProductsManagement from './pages/admin/ProductsManagement';
import AdminCategories from './pages/admin/Categories';
import AdminBrands from './pages/admin/Brands';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetails from './pages/admin/OrderDetail';
import AdminUsers from './pages/admin/Users';
import AdminInventory from './pages/admin/Inventory';
import AdminSuppliers from './pages/admin/Suppliers';
import AdminDiscount from './pages/admin/Discount';
import AdminSettings from './pages/admin/Settings';
import AdminPayments from './pages/admin/Payments';
import StaffManagement from './pages/admin/StaffManagement';
import ReportGeneration from './pages/admin/ReportGeneration';

// Supplier Pages
import SupplierDashboard from './pages/supplier/Dashboard';
import SupplierProducts from './pages/supplier/Products';
import SupplierOrders from './pages/supplier/Orders';
import SupplierInventory from './pages/supplier/Inventory';
import SupplierPayments from './pages/supplier/Payments';
import SupplierAnalysis from './pages/supplier/InventoryAnalysisReport';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffOrders from './pages/staff/Orders';
import StaffSupport from './pages/staff/Support';
import Customers from './pages/staff/Customers';

// Protected Routes
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import SupplierRoute from './components/auth/SupplierRoute';
import StaffRoute from './components/auth/StaffRoute';
import VerifyEmail from './pages/VerifyEmail';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <RoleBasedNavbar />
                <main className="pt-16">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact/>} />
                    <Route path="/about" element={<About/>} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email/:token" element={<VerifyEmail/>} />
                    
                    {/* Protected Routes */}
                    <Route path="/cart" element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/review/:productId" element={
                      <ProtectedRoute>
                        <ReviewSubmission />
                      </ProtectedRoute>
                    } />
                    <Route path="/system-test" element={<SystemTest />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products" element={
                      <AdminRoute>
                        <AdminProducts />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products-management" element={
                      <AdminRoute>
                        <AdminProductsManagement />
                      </AdminRoute>
                    } />
                    <Route path="/admin/categories" element={
                      <AdminRoute>
                        <AdminCategories />
                      </AdminRoute>
                    } />
                    <Route path="/admin/brands" element={
                      <AdminRoute>
                        <AdminBrands />
                      </AdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <AdminRoute>
                        <AdminOrders />
                      </AdminRoute>
                    } />
                    <Route path="/admin/orders/:id" element={
                      <AdminRoute>
                        <AdminOrderDetails />
                      </AdminRoute>
                    } />
                    <Route path="/admin/users" element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    } />
                    <Route path="/admin/inventory" element={
                      <AdminRoute>
                        <AdminInventory />
                      </AdminRoute>
                    } />
                    <Route path="/admin/suppliers" element={
                      <AdminRoute>
                        <AdminSuppliers />
                      </AdminRoute>
                    } />
                    <Route path="/admin/discount" element={
                      <AdminRoute>
                        <AdminDiscount />
                      </AdminRoute>
                    } />
                    <Route path="/admin/payments" element={
                      <AdminRoute>
                        <AdminPayments />
                      </AdminRoute>
                    } />
                    <Route path="/admin/settings" element={
                      <AdminRoute>
                        <AdminSettings />
                      </AdminRoute>
                    } />
                    
                    {/* Staff Management Routes */}
                    <Route path="/admin/staff" element={
                      <AdminRoute>
                        <StaffManagement />
                      </AdminRoute>
                    } />
                    <Route path="/admin/staff/add" element={
                      <AdminRoute>
                        <StaffManagement />
                      </AdminRoute>
                    } />
                    <Route path="/admin/departments" element={
                      <AdminRoute>
                        <StaffManagement />
                      </AdminRoute>
                    } />
                    <Route path="/admin/reports" element={
                      <AdminRoute>
                        <ReportGeneration />
                      </AdminRoute>
                    } />
                    <Route path="/supplier" element={
                      <SupplierRoute>
                        <SupplierDashboard />
                      </SupplierRoute>
                    } />
                    <Route path="/supplier/products" element={
                      <SupplierRoute>
                        <SupplierProducts />
                      </SupplierRoute>
                    } />
                    <Route path="/supplier/orders" element={
                      <SupplierRoute>
                        <SupplierOrders />
                      </SupplierRoute>
                    } />
                    <Route path="/supplier/inventory" element={
                      <SupplierRoute>
                        <SupplierInventory />
                      </SupplierRoute>
                    } />
                    <Route path="/supplier/payments" element={
                      <SupplierRoute>
                        <SupplierPayments />
                      </SupplierRoute>
                    } />
                    <Route path="/supplier/analysis" element={
                      <SupplierRoute>
                        <SupplierAnalysis />
                      </SupplierRoute>
                    } />
                    
                    {/* Staff Routes */}
                    <Route path="/staff" element={
                      <StaffRoute>
                        <StaffDashboard />
                      </StaffRoute>
                    } />
                    <Route path="/staff/orders" element={
                      <StaffRoute>
                        <StaffOrders />
                      </StaffRoute>
                    } />
                    <Route path="/staff/support" element={
                      <StaffRoute>
                        <StaffSupport />
                      </StaffRoute>
                    } />
                    <Route path="/staff/customers" element={
                      <StaffRoute>
                        <Customers />
                      </StaffRoute>
                    } />
                  </Routes>
                </main>
                <Footer />
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
