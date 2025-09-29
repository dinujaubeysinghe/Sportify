import { Helmet } from 'react-helmet-async';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminSuppliers = () => {
  return (
    <>
      <Helmet>
        <title>Manage Suppliers - Sportify Admin</title>
        <meta name="description" content="Manage suppliers in the Sportify e-commerce platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Suppliers</h1>
            <p className="text-gray-600 mt-2">Approve and manage supplier accounts</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Supplier Management</h2>
                <p className="text-gray-600 mb-6">This page will contain the supplier management interface.</p>
                <div className="flex justify-center space-x-4">
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Suppliers
                  </button>
                  <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Reviews
                  </button>
                  <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejected Applications
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSuppliers;
