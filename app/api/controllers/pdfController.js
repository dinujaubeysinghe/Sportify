const htmlPdf = require('html-pdf-node');
const path = require('path');

// @desc    Generate PDF report for customers
// @route   POST /api/pdf/customer-report
// @access  Staff/Admin
exports.generateCustomerReport = async (req, res) => {
  try {
    const { customers, reportType, reportPeriod } = req.body;

    if (!customers || customers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No customer data provided' 
      });
    }

    // Calculate summary statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const averageOrderValue = customers.reduce((sum, c) => sum + (c.averageOrderValue || 0), 0) / totalCustomers;
    const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
    const revenueThisMonth = customers.reduce((sum, c) => sum + (c.spendingThisMonth || 0), 0);

    // Format currency
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
      }).format(price);
    };

    // Format date
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // Generate HTML content for PDF
    const generateHTML = () => {
      const reportDate = new Date().toLocaleDateString('en-LK');
      
      let reportContent = '';
      
      switch (reportType) {
        case 'customer_summary':
          reportContent = `
            <div class="report-section">
              <h2>SUMMARY STATISTICS</h2>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Total Customers:</span>
                  <span class="stat-value">${totalCustomers}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Active Customers:</span>
                  <span class="stat-value">${activeCustomers}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Inactive Customers:</span>
                  <span class="stat-value">${totalCustomers - activeCustomers}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Revenue:</span>
                  <span class="stat-value">${formatPrice(totalRevenue)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Order Value:</span>
                  <span class="stat-value">${formatPrice(averageOrderValue)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Orders:</span>
                  <span class="stat-value">${totalOrders}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Revenue This Month:</span>
                  <span class="stat-value">${formatPrice(revenueThisMonth)}</span>
                </div>
              </div>
            </div>

            <div class="report-section">
              <h2>TOP CUSTOMERS BY SPENDING</h2>
              <table class="customer-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Customer Name</th>
                    <th>Total Spent</th>
                    <th>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  ${customers
                    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                    .slice(0, 10)
                    .map((customer, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${customer.firstName} ${customer.lastName}</td>
                        <td>${formatPrice(customer.totalSpent || 0)}</td>
                        <td>${customer.totalOrders || 0}</td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          `;
          break;

        case 'spending_analysis':
          reportContent = `
            <div class="report-section">
              <h2>SPENDING STATISTICS</h2>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Total Revenue:</span>
                  <span class="stat-value">${formatPrice(totalRevenue)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Customer Value:</span>
                  <span class="stat-value">${formatPrice(totalRevenue / totalCustomers)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Revenue This Month:</span>
                  <span class="stat-value">${formatPrice(revenueThisMonth)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Order Value:</span>
                  <span class="stat-value">${formatPrice(averageOrderValue)}</span>
                </div>
              </div>
            </div>

            <div class="report-section">
              <h2>HIGH-VALUE CUSTOMERS (>LKR 100,000)</h2>
              <table class="customer-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Total Spent</th>
                    <th>Orders</th>
                    <th>Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${customers
                    .filter(c => (c.totalSpent || 0) > 100000)
                    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                    .map(customer => `
                      <tr>
                        <td>${customer.firstName} ${customer.lastName}</td>
                        <td>${formatPrice(customer.totalSpent || 0)}</td>
                        <td>${customer.totalOrders || 0}</td>
                        <td>${formatPrice(customer.averageOrderValue || 0)}</td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          `;
          break;

        case 'monthly_activity':
          reportContent = `
            <div class="report-section">
              <h2>MONTHLY STATISTICS</h2>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Total Orders This Month:</span>
                  <span class="stat-value">${customers.reduce((sum, c) => sum + (c.ordersThisMonth || 0), 0)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Revenue This Month:</span>
                  <span class="stat-value">${formatPrice(revenueThisMonth)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Active Customers This Month:</span>
                  <span class="stat-value">${customers.filter(c => (c.ordersThisMonth || 0) > 0).length}</span>
                </div>
              </div>
            </div>

            <div class="report-section">
              <h2>CUSTOMER ACTIVITY THIS MONTH</h2>
              <table class="customer-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Orders This Month</th>
                    <th>Spending This Month</th>
                    <th>Last Order Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${customers
                    .filter(c => (c.ordersThisMonth || 0) > 0)
                    .sort((a, b) => (b.ordersThisMonth || 0) - (a.ordersThisMonth || 0))
                    .map(customer => `
                      <tr>
                        <td>${customer.firstName} ${customer.lastName}</td>
                        <td>${customer.ordersThisMonth || 0}</td>
                        <td>${formatPrice(customer.spendingThisMonth || 0)}</td>
                        <td>${formatDate(customer.lastOrderDate)}</td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          `;
          break;
      }

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Customer Report - Sportify</title>
          <style>
            @page {
              margin: 60px 40px 100px 40px;
              @top-center {
                content: "Sportify Customer Report";
                font-size: 12px;
                color: #666;
              }
              @bottom-center {
                content: "Generated on " counter(page) " of " counter(pages);
                font-size: 10px;
                color: #999;
              }
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: 0;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
            }
            
            .logo {
              width: 120px;
              height: auto;
              margin-bottom: 10px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin: 0;
            }
            
            .company-tagline {
              font-size: 14px;
              color: #666;
              margin: 5px 0 0 0;
            }
            
            .report-title {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              margin: 20px 0;
              text-align: center;
            }
            
            .report-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              font-size: 11px;
              color: #666;
            }
            
            .report-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            
            .report-section h2 {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            
            .stat-item {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              background-color: #f9fafb;
              border-radius: 4px;
              border-left: 4px solid #2563eb;
            }
            
            .stat-label {
              font-weight: 500;
              color: #374151;
            }
            
            .stat-value {
              font-weight: bold;
              color: #1f2937;
            }
            
            .customer-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            
            .customer-table th,
            .customer-table td {
              padding: 8px 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .customer-table th {
              background-color: #f3f4f6;
              font-weight: bold;
              color: #374151;
              font-size: 11px;
            }
            
            .customer-table td {
              font-size: 11px;
            }
            
            .customer-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 80px;
              border-top: 1px solid #e5e7eb;
              padding: 20px 40px;
              background-color: #f9fafb;
            }
            
            .signature-section {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .signature-box {
              width: 200px;
              height: 40px;
              border: 1px solid #d1d5db;
              border-bottom: 2px solid #374151;
              background-color: white;
            }
            
            .signature-label {
              font-size: 10px;
              color: #666;
              margin-top: 5px;
            }
            
            .date-section {
              text-align: right;
            }
            
            .date-label {
              font-size: 10px;
              color: #666;
              margin-bottom: 5px;
            }
            
            .date-box {
              width: 150px;
              height: 20px;
              border: 1px solid #d1d5db;
              border-bottom: 2px solid #374151;
              background-color: white;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SPORTIFY</div>
            <div class="company-tagline">GEAR UP. GAME ON</div>
          </div>
          
          <div class="report-title">
            ${reportType === 'customer_summary' ? 'CUSTOMER SUMMARY REPORT' : 
              reportType === 'spending_analysis' ? 'CUSTOMER SPENDING ANALYSIS REPORT' : 
              'MONTHLY CUSTOMER ACTIVITY REPORT'}
          </div>
          
          <div class="report-info">
            <div>Generated on: ${reportDate}</div>
            <div>Report Period: Last ${reportPeriod} days</div>
            <div>Total Customers: ${totalCustomers}</div>
          </div>
          
          ${reportContent}
          
          <div class="footer">
            <div class="signature-section">
              <div>
                <div class="signature-box"></div>
                <div class="signature-label">Authorized Signature</div>
              </div>
              <div class="date-section">
                <div class="date-label">Date</div>
                <div class="date-box"></div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    // Generate PDF using html-pdf-node
    const options = {
      format: 'A4',
      margin: {
        top: '60px',
        right: '40px',
        bottom: '100px',
        left: '40px'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 12px; color: #666; text-align: center; width: 100%;">
          <span>Sportify Customer Report</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #999; text-align: center; width: 100%;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    };

    const file = { content: generateHTML() };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="customer_report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate PDF report' 
    });
  }
};
