import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  UserPlus,
  Download,
  X,
  FileText,
  TrendingUp,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('customer_summary');
  const [reportPeriod, setReportPeriod] = useState('30');

  // Load customers data
  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/users/customers');
      setCustomers(response.data.users || []);
      setFilteredCustomers(response.data.users || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      // Mock data for development with enhanced metrics
      setCustomers([
        {
          _id: '1',
          firstName: 'Kamal',
          lastName: 'Perera',
          email: 'kamal.perera@gmail.com',
          phone: '+94 77 123 4567',
          address: '123 Galle Road, Colombo 03, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          totalOrders: 5,
          totalSpent: 125000,
          averageOrderValue: 25000,
          lastOrderDate: '2024-02-15T10:30:00Z',
          customerLifetimeValue: 125000,
          ordersThisMonth: 2,
          spendingThisMonth: 50000
        },
        {
          _id: '2',
          firstName: 'Priya',
          lastName: 'Fernando',
          email: 'priya.fernando@gmail.com',
          phone: '+94 77 234 5678',
          address: '456 Mount Lavinia, Colombo 06, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-01-20T14:15:00Z',
          totalOrders: 3,
          totalSpent: 85000,
          averageOrderValue: 28333,
          lastOrderDate: '2024-02-10T14:15:00Z',
          customerLifetimeValue: 85000,
          ordersThisMonth: 1,
          spendingThisMonth: 28000
        },
        {
          _id: '3',
          firstName: 'Saman',
          lastName: 'Silva',
          email: 'saman.silva@gmail.com',
          phone: '+94 77 345 6789',
          address: '789 Kandy Road, Kandy, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-01-25T09:45:00Z',
          totalOrders: 7,
          totalSpent: 195000,
          averageOrderValue: 27857,
          lastOrderDate: '2024-02-12T09:45:00Z',
          customerLifetimeValue: 195000,
          ordersThisMonth: 3,
          spendingThisMonth: 85000
        },
        {
          _id: '4',
          firstName: 'Nimali',
          lastName: 'Jayawardena',
          email: 'nimali.jayawardena@gmail.com',
          phone: '+94 77 456 7890',
          address: '321 Negombo Road, Negombo, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-02-01T16:20:00Z',
          totalOrders: 2,
          totalSpent: 45000,
          averageOrderValue: 22500,
          lastOrderDate: '2024-02-08T16:20:00Z',
          customerLifetimeValue: 45000,
          ordersThisMonth: 2,
          spendingThisMonth: 45000
        },
        {
          _id: '5',
          firstName: 'Ruwan',
          lastName: 'Bandara',
          email: 'ruwan.bandara@gmail.com',
          phone: '+94 77 567 8901',
          address: '654 Batticaloa Road, Batticaloa, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-02-05T11:30:00Z',
          totalOrders: 4,
          totalSpent: 6600,
          averageOrderValue: 1650,
          lastOrderDate: '2024-09-26T11:30:00Z',
          customerLifetimeValue: 6600,
          ordersThisMonth: 4,
          spendingThisMonth: 6600
        },
        {
          _id: '6',
          firstName: 'Anjali',
          lastName: 'Silva',
          email: 'anjali.silva@gmail.com',
          phone: '+94 77 678 9012',
          address: '987 Dehiwala, Colombo 05, Sri Lanka',
          role: 'customer',
          isActive: false,
          createdAt: '2024-02-10T13:15:00Z',
          totalOrders: 1,
          totalSpent: 25000,
          averageOrderValue: 25000,
          lastOrderDate: '2024-02-10T13:15:00Z',
          customerLifetimeValue: 25000,
          ordersThisMonth: 1,
          spendingThisMonth: 25000
        }
      ]);
      setFilteredCustomers([
        {
          _id: '1',
          firstName: 'Kamal',
          lastName: 'Perera',
          email: 'kamal.perera@gmail.com',
          phone: '+94 77 123 4567',
          address: '123 Galle Road, Colombo 03, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          totalOrders: 5,
          totalSpent: 125000,
          averageOrderValue: 25000,
          lastOrderDate: '2024-02-15T10:30:00Z',
          customerLifetimeValue: 125000,
          ordersThisMonth: 2,
          spendingThisMonth: 50000
        },
        {
          _id: '2',
          firstName: 'Priya',
          lastName: 'Fernando',
          email: 'priya.fernando@gmail.com',
          phone: '+94 77 234 5678',
          address: '456 Mount Lavinia, Colombo 06, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-01-20T14:15:00Z',
          totalOrders: 3,
          totalSpent: 85000,
          averageOrderValue: 28333,
          lastOrderDate: '2024-02-10T14:15:00Z',
          customerLifetimeValue: 85000,
          ordersThisMonth: 1,
          spendingThisMonth: 28000
        },
        {
          _id: '3',
          firstName: 'Saman',
          lastName: 'Silva',
          email: 'saman.silva@gmail.com',
          phone: '+94 77 345 6789',
          address: '789 Kandy Road, Kandy, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-01-25T09:45:00Z',
          totalOrders: 7,
          totalSpent: 195000,
          averageOrderValue: 27857,
          lastOrderDate: '2024-02-12T09:45:00Z',
          customerLifetimeValue: 195000,
          ordersThisMonth: 3,
          spendingThisMonth: 85000
        },
        {
          _id: '4',
          firstName: 'Nimali',
          lastName: 'Jayawardena',
          email: 'nimali.jayawardena@gmail.com',
          phone: '+94 77 456 7890',
          address: '321 Negombo Road, Negombo, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-02-01T16:20:00Z',
          totalOrders: 2,
          totalSpent: 45000,
          averageOrderValue: 22500,
          lastOrderDate: '2024-02-08T16:20:00Z',
          customerLifetimeValue: 45000,
          ordersThisMonth: 2,
          spendingThisMonth: 45000
        },
        {
          _id: '5',
          firstName: 'Ruwan',
          lastName: 'Bandara',
          email: 'ruwan.bandara@gmail.com',
          phone: '+94 77 567 8901',
          address: '654 Batticaloa Road, Batticaloa, Sri Lanka',
          role: 'customer',
          isActive: true,
          createdAt: '2024-02-05T11:30:00Z',
          totalOrders: 4,
          totalSpent: 6600,
          averageOrderValue: 1650,
          lastOrderDate: '2024-09-26T11:30:00Z',
          customerLifetimeValue: 6600,
          ordersThisMonth: 4,
          spendingThisMonth: 6600
        },
        {
          _id: '6',
          firstName: 'Anjali',
          lastName: 'Silva',
          email: 'anjali.silva@gmail.com',
          phone: '+94 77 678 9012',
          address: '987 Dehiwala, Colombo 05, Sri Lanka',
          role: 'customer',
          isActive: false,
          createdAt: '2024-02-10T13:15:00Z',
          totalOrders: 1,
          totalSpent: 25000,
          averageOrderValue: 25000,
          lastOrderDate: '2024-02-10T13:15:00Z',
          customerLifetimeValue: 25000,
          ordersThisMonth: 1,
          spendingThisMonth: 25000
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search and status
  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        (customer.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone || '').includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => 
        statusFilter === 'active' ? customer.isActive : !customer.isActive
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleExportCustomers = () => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    const csvHeaders = [
      'Name',
      'Email',
      'Phone',
      'Address',
      'Status',
      'Total Orders',
      'Total Spent',
      'Average Order Value',
      'Customer Lifetime Value',
      'Orders This Month',
      'Spending This Month',
      'Last Order Date',
      'Join Date'
    ];

    const csvData = filteredCustomers.map(customer => [
      `${customer.firstName || '' || ''} ${customer.lastName || '' || ''}`,
      customer.email || '' || '',
      customer.phone || '' || '',
      customer.address || '',
      customer.isActive ? 'Active' : 'Inactive',
      customer.totalOrders || 0,
      formatPrice(customer.totalSpent || 0),
      formatPrice(customer.averageOrderValue || 0),
      formatPrice(customer.customerLifetimeValue || 0),
      customer.ordersThisMonth || 0,
      formatPrice(customer.spendingThisMonth || 0),
      formatDate(customer.lastOrderDate),
      formatDate(customer.createdAt)
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredCustomers.length} customers successfully!`);
  };

  const handleGenerateReport = async () => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers to generate report for');
      return;
    }

    try {
      toast.loading('Generating PDF report...', { id: 'pdf-generation' });
    
    // Calculate summary statistics
    const totalCustomers = filteredCustomers.length;
    const activeCustomers = filteredCustomers.filter(c => c.isActive).length;
    const totalRevenue = filteredCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const averageOrderValue = filteredCustomers.reduce((sum, c) => sum + (c.averageOrderValue || 0), 0) / totalCustomers;
    const totalOrders = filteredCustomers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
    const revenueThisMonth = filteredCustomers.reduce((sum, c) => sum + (c.spendingThisMonth || 0), 0);

      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addText = (text, x, y, maxWidth = pageWidth - 40) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * 7);
      };

      // Helper function to add a new page if needed
      const checkNewPage = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Load and add company logo
      try {
        // Convert logo to base64 for embedding
        const logoResponse = await fetch('/SportifyLogo_1.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });

        // Add logo to PDF (60x30 size)
        doc.addImage(logoBase64, 'PNG', pageWidth / 2 - 30, yPosition, 60, 30);
        yPosition += 40;
        
        // Add tagline below logo
        doc.setFontSize(12);
        doc.setTextColor(102, 102, 102); // Gray color
        doc.text('GEAR UP. GAME ON', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;
      } catch (logoError) {
        console.warn('Could not load logo, using text fallback:', logoError);
        // Fallback to text if logo fails to load
        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235); // Blue color
        doc.text('SPORTIFY', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        
        doc.setFontSize(12);
        doc.setTextColor(102, 102, 102); // Gray color
        doc.text('GEAR UP. GAME ON', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;
      }

      // Report title
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55); // Dark gray
      const reportTitle = reportType === 'customer_summary' ? 'CUSTOMER SUMMARY REPORT' : 
                         reportType === 'spending_analysis' ? 'CUSTOMER SPENDING ANALYSIS REPORT' : 
                         'MONTHLY CUSTOMER ACTIVITY REPORT';
      doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Report info
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      const reportDate = new Date().toLocaleDateString('en-LK');
      doc.text(`Generated on: ${reportDate}`, 20, yPosition);
      doc.text(`Report Period: Last ${reportPeriod} days`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 15;
      doc.text(`Total Customers: ${totalCustomers}`, 20, yPosition);
      yPosition += 20;

      // Generate different content based on report type
      if (reportType === 'customer_summary') {
        // Summary statistics
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('SUMMARY STATISTICS', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        const stats = [
          `Total Customers: ${totalCustomers}`,
          `Active Customers: ${activeCustomers}`,
          `Inactive Customers: ${totalCustomers - activeCustomers}`,
          `Total Revenue: ${formatPrice(totalRevenue)}`,
          `Average Order Value: ${formatPrice(averageOrderValue)}`,
          `Total Orders: ${totalOrders}`,
          `Revenue This Month: ${formatPrice(revenueThisMonth)}`
        ];

        stats.forEach(stat => {
          checkNewPage(10);
          yPosition = addText(stat, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 10;

        // Top customers section
        checkNewPage(30);
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('TOP CUSTOMERS BY SPENDING', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        const topCustomers = filteredCustomers
  .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
          .slice(0, 10);

        topCustomers.forEach((customer, index) => {
          checkNewPage(15);
          const customerText = `${index + 1}. ${customer.firstName || ''} ${customer.lastName || ''} - ${formatPrice(customer.totalSpent || 0)} (${customer.totalOrders || 0} orders)`;
          yPosition = addText(customerText, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 15;

        // Customer details table
        checkNewPage(50);
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('CUSTOMER DETAILS', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(8);
        doc.setTextColor(55, 65, 81);

        filteredCustomers.forEach((customer, index) => {
          checkNewPage(40);
          
          const customerDetails = [
            `Name: ${customer.firstName || ''} ${customer.lastName || ''}`,
            `Email: ${customer.email || ''}`,
            `Phone: ${customer.phone || ''}`,
            `Status: ${customer.isActive ? 'Active' : 'Inactive'}`,
            `Total Orders: ${customer.totalOrders || 0}`,
            `Total Spent: ${formatPrice(customer.totalSpent || 0)}`,
            `Average Order Value: ${formatPrice(customer.averageOrderValue || 0)}`,
            `Orders This Month: ${customer.ordersThisMonth || 0}`,
            `Spending This Month: ${formatPrice(customer.spendingThisMonth || 0)}`,
            `Last Order: ${formatDate(customer.lastOrderDate)}`,
            `Join Date: ${formatDate(customer.createdAt)}`
          ];

          customerDetails.forEach(detail => {
            yPosition = addText(detail, 20, yPosition, pageWidth - 40);
            yPosition += 3;
          });
          
          yPosition += 10;
          if (index < filteredCustomers.length - 1) {
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPosition, pageWidth - 20, yPosition);
            yPosition += 10;
          }
        });

      } else if (reportType === 'spending_analysis') {
        // Spending statistics
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('SPENDING STATISTICS', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        const spendingStats = [
          `Total Revenue: ${formatPrice(totalRevenue)}`,
          `Average Customer Value: ${formatPrice(totalRevenue / totalCustomers)}`,
          `Revenue This Month: ${formatPrice(revenueThisMonth)}`,
          `Average Order Value: ${formatPrice(averageOrderValue)}`,
          `Total Orders: ${totalOrders}`,
          `Active Customers: ${activeCustomers}`
        ];

        spendingStats.forEach(stat => {
          checkNewPage(10);
          yPosition = addText(stat, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 15;

        // High-value customers
        checkNewPage(30);
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('HIGH-VALUE CUSTOMERS (>LKR 100,000)', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        const highValueCustomers = filteredCustomers
  .filter(c => (c.totalSpent || 0) > 100000)
          .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));

        if (highValueCustomers.length > 0) {
          highValueCustomers.forEach((customer, index) => {
            checkNewPage(15);
            const customerText = `${index + 1}. ${customer.firstName || ''} ${customer.lastName || ''} - ${formatPrice(customer.totalSpent || 0)} (${customer.totalOrders || 0} orders)`;
            yPosition = addText(customerText, 20, yPosition);
            yPosition += 5;
          });
        } else {
          yPosition = addText('No high-value customers found (>LKR 100,000)', 20, yPosition);
          yPosition += 10;
        }

        yPosition += 15;

        // Spending distribution
        checkNewPage(30);
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('SPENDING DISTRIBUTION', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        const spendingDistribution = filteredCustomers
          .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));

        spendingDistribution.forEach((customer, index) => {
          checkNewPage(15);
          const customerText = `${customer.firstName || ''} ${customer.lastName || ''}: ${formatPrice(customer.totalSpent || 0)} (${customer.totalOrders || 0} orders)`;
          yPosition = addText(customerText, 20, yPosition);
          yPosition += 5;
        });

      } else if (reportType === 'monthly_activity') {
        // Monthly statistics
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('MONTHLY STATISTICS', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        const monthlyStats = [
          `Total Orders This Month: ${filteredCustomers.reduce((sum, c) => sum + (c.ordersThisMonth || 0), 0)}`,
          `Total Revenue This Month: ${formatPrice(revenueThisMonth)}`,
          `Active Customers This Month: ${filteredCustomers.filter(c => (c.ordersThisMonth || 0) > 0).length}`,
          `Average Orders Per Customer: ${(filteredCustomers.reduce((sum, c) => sum + (c.ordersThisMonth || 0), 0) / totalCustomers).toFixed(2)}`,
          `Average Spending Per Customer: ${formatPrice(revenueThisMonth / totalCustomers)}`
        ];

        monthlyStats.forEach(stat => {
          checkNewPage(10);
          yPosition = addText(stat, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 15;

        // Customer activity this month
        checkNewPage(30);
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('CUSTOMER ACTIVITY THIS MONTH', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        const activeCustomersThisMonth = filteredCustomers
  .filter(c => (c.ordersThisMonth || 0) > 0)
          .sort((a, b) => (b.ordersThisMonth || 0) - (a.ordersThisMonth || 0));

        if (activeCustomersThisMonth.length > 0) {
          activeCustomersThisMonth.forEach((customer, index) => {
            checkNewPage(15);
            const customerText = `${index + 1}. ${customer.firstName || ''} ${customer.lastName || ''} - ${customer.ordersThisMonth || 0} orders, ${formatPrice(customer.spendingThisMonth || 0)}`;
            yPosition = addText(customerText, 20, yPosition);
            yPosition += 5;
          });
        } else {
          yPosition = addText('No customer activity this month', 20, yPosition);
          yPosition += 10;
        }

        yPosition += 15;

        // Inactive customers
        checkNewPage(30);
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('INACTIVE CUSTOMERS (No orders this month)', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        const inactiveCustomers = filteredCustomers
          .filter(c => (c.ordersThisMonth || 0) === 0);

        if (inactiveCustomers.length > 0) {
          inactiveCustomers.forEach((customer, index) => {
            checkNewPage(15);
            const customerText = `${index + 1}. ${customer.firstName || ''} ${customer.lastName || ''} (Last order: ${formatDate(customer.lastOrderDate)})`;
            yPosition = addText(customerText, 20, yPosition);
            yPosition += 5;
          });
        } else {
          yPosition = addText('All customers have been active this month', 20, yPosition);
          yPosition += 10;
        }
      }

      // Footer with signature space - ensure it's on the last page
      doc.addPage();
      
      // Start signature section higher up on the page
      const signatureStartY = 60;
      
      // Signature section title
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235); // Blue color to match header
      doc.text('AUTHORIZATION', pageWidth / 2, signatureStartY, { align: 'center' });
      
      // Add some space after title
      const signatureY = signatureStartY + 30;
      
      // Signature area labels
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81); // Dark gray
      
      // Left side - Signature
      doc.text('Authorized Signature:', 20, signatureY);
      
      // Right side - Date
      doc.text('Date:', pageWidth - 80, signatureY);
      
      // Signature boxes
      const boxY = signatureY + 15;
      const boxHeight = 40;
      
      // Left signature box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.rect(20, boxY, 120, boxHeight);
      
      // Add signature line inside the box
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(20, boxY + boxHeight/2, 140, boxY + boxHeight/2);
      
      // Right date box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.rect(pageWidth - 80, boxY, 60, boxHeight);
      
      // Add date line inside the box
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 80, boxY + boxHeight/2, pageWidth - 20, boxY + boxHeight/2);
      
      // Add labels inside boxes
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Signature', 25, boxY + boxHeight/2 - 5);
      doc.text('Date', pageWidth - 75, boxY + boxHeight/2 - 5);
      
      // Add space for printed name below signature
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Print Name:', 20, boxY + boxHeight + 15);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, boxY + boxHeight + 20, 140, boxY + boxHeight + 20);
      
      // Add title/position below signature
      doc.text('Title/Position:', 20, boxY + boxHeight + 30);
      doc.line(20, boxY + boxHeight + 35, 140, boxY + boxHeight + 35);
      
      // Footer line
      const footerY = pageHeight - 30;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
      
      // Print generation date
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Report generated on: ${new Date().toLocaleDateString('en-LK')}`, pageWidth / 2, footerY, { align: 'center' });

      // Save the PDF
      const fileName = `customer_report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF report generated successfully!', { id: 'pdf-generation' });
    setShowReportModal(false);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error('Failed to generate PDF report. Please try again.', { id: 'pdf-generation' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage your customer base and track customer activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(customers.reduce((sum, c) => sum + (c.averageOrderValue || 0), 0) / customers.length || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowReportModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </button>
              <button 
                onClick={handleExportCustomers}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '320px' }}>
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Avg Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      This Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4" style={{ minWidth: '320px' }}>
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName || ''} {customer.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {customer._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email || ''}</div>
                        <div className="text-sm text-gray-500">{customer.phone || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {customer.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalOrders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(customer.totalSpent || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(customer.averageOrderValue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-xs">
                          <div>{customer.ordersThisMonth || 0} orders</div>
                          <div className="text-gray-500">{formatPrice(customer.spendingThisMonth || 0)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-sm text-gray-900">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedCustomer.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.address}</p>
                </div>

                {/* Customer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[120px] flex flex-col justify-between">
                    <p className="text-sm font-medium text-gray-600 leading-tight mb-2">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[120px] flex flex-col justify-between">
                    <p className="text-sm font-medium text-gray-600 leading-tight mb-2">Total Spent</p>
                    <p className="text-xl font-bold text-gray-900 break-words">
                      {formatPrice(selectedCustomer.totalSpent || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[120px] flex flex-col justify-between">
                    <p className="text-sm font-medium text-gray-600 leading-tight mb-2">Avg Order Value</p>
                    <p className="text-xl font-bold text-gray-900 break-words">
                      {formatPrice(selectedCustomer.averageOrderValue || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[120px] flex flex-col justify-between">
                    <p className="text-sm font-medium text-gray-600 leading-tight mb-2">This Month</p>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-gray-900 break-words">
                        {formatPrice(selectedCustomer.spendingThisMonth || 0)}
                      </p>
                      <p className="text-xs text-gray-500">{selectedCustomer.ordersThisMonth || 0} orders</p>
                    </div>
                  </div>
                </div>

                {/* Additional Customer Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Lifetime Value</label>
                    <p className="text-sm text-gray-900">{formatPrice(selectedCustomer.customerLifetimeValue || 0)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Order Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedCustomer.lastOrderDate)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      window.open(`mailto:${selectedCustomer.email}`, '_blank');
                    }}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Generation Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Generate Customer Report</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Report Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="customer_summary"
                        checked={reportType === 'customer_summary'}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Customer Summary Report</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="spending_analysis"
                        checked={reportType === 'spending_analysis'}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Spending Analysis Report</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="monthly_activity"
                        checked={reportType === 'monthly_activity'}
                        onChange={(e) => setReportType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Monthly Activity Report</span>
                    </label>
                  </div>
                </div>

                {/* Report Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Period (Days)</label>
                  <select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>

                {/* Report Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">PDF Report Preview</h4>
                  <p className="text-xs text-gray-600">
                    {reportType === 'customer_summary' && 'Comprehensive customer overview with spending statistics and top customers'}
                    {reportType === 'spending_analysis' && 'Detailed spending patterns and high-value customer identification'}
                    {reportType === 'monthly_activity' && 'Monthly customer activity and engagement metrics'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Will include {filteredCustomers.length} customers
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-xs text-blue-700">
                      <strong>PDF Features:</strong> Professional layout with company logo header and signature space footer
                  </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate PDF Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
