import { Helmet } from 'react-helmet-async';
import { MessageSquare, Phone, Mail, Clock } from 'lucide-react';

const StaffSupport = () => {
  return (
    <>
      <Helmet>
        <title>Customer Support - Sportify Staff</title>
        <meta name="description" content="Provide customer support and manage support tickets." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
            <p className="text-gray-600 mt-2">Manage customer support tickets and inquiries</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Support Management</h2>
                <p className="text-gray-600 mb-6">This page will contain the customer support interface.</p>
                <div className="flex justify-center space-x-4">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Tickets
                  </button>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Live Chat
                  </button>
                  <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
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

export default StaffSupport;
