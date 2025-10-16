import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CustomerSpendingReport = ({ startDate, endDate, onClose }) => {
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch customer spending data
  const { data: customerData, isLoading } = useQuery(
    ['customer-spending', startDate, endDate],
    async () => {
      const response = await axios.get('/admin/reports/customer-spending', {
        params: { startDate, endDate }
      });
      return response.data;
    },
    {
      enabled: !!startDate && !!endDate,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (customerData) {
      setReportData(customerData);
    }
  }, [customerData]);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const reportElement = document.getElementById('customer-spending-report');
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `customer-spending-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="text-center py-8">
            <p className="text-gray-500">No data available for the selected period.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Report Actions */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Customer Spending Analysis Report</h2>
          <div className="flex gap-2">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div id="customer-spending-report" className="bg-white p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="mb-4">
              <div className="inline-block">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">SPORTIFY</h1>
                <p className="text-gray-500 text-sm">GEAR UP. GAME ON</p>
              </div>
            </div>
            
            {/* Report Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              CUSTOMER SPENDING ANALYSIS REPORT
            </h2>
            
            {/* Report Metadata */}
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Generated on: {formatDate(new Date())}</span>
              <span>Report Period: {formatDate(startDate)} - {formatDate(endDate)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Total Customers: {reportData.totalCustomers}
            </div>
          </div>

          {/* Spending Statistics */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SPENDING STATISTICS</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-semibold">{formatCurrency(reportData.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Customer Value:</span>
                  <span className="font-semibold">{formatCurrency(reportData.averageCustomerValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue This Month:</span>
                  <span className="font-semibold">{formatCurrency(reportData.monthlyRevenue)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Average Order Value:</span>
                  <span className="font-semibold">{formatCurrency(reportData.averageOrderValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-semibold">{reportData.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Customers:</span>
                  <span className="font-semibold">{reportData.activeCustomers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* High-Value Customers */}
          {reportData.highValueCustomers && reportData.highValueCustomers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                HIGH-VALUE CUSTOMERS (>LKR 100,000)
              </h3>
              <div className="space-y-2">
                {reportData.highValueCustomers.map((customer, index) => (
                  <div key={index} className="text-sm">
                    {customer.name} - {formatCurrency(customer.totalSpent)} ({customer.orderCount} orders)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spending Distribution */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SPENDING DISTRIBUTION</h3>
            <div className="space-y-2">
              {reportData.customerSpending.map((customer, index) => (
                <div key={index} className="text-sm">
                  {customer.name}: {formatCurrency(customer.totalSpent)} ({customer.orderCount} orders)
                </div>
              ))}
            </div>
          </div>

          {/* Authorization Section */}
          <div className="border-t border-gray-300 pt-6 mt-8">
            <h3 className="text-lg font-bold text-blue-600 text-center mb-6">AUTHORIZATION</h3>
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Authorized Signature:</span>
                  <div className="border-b border-gray-400 w-32"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Date:</span>
                  <div className="border border-gray-400 w-20 h-6"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Print Name:</span>
                  <div className="border-b border-gray-400 w-32"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Title/Position:</span>
                  <div className="border-b border-gray-400 w-32"></div>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              Report generated on: {formatDate(new Date())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSpendingReport;
