import React, { useRef } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import '../../assets/css/InventoryAnalysisReport.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const InventoryAnalysisPage = () => {
  const reportRef = useRef(null);

  // Fetch summary
  const { data: summary, isLoading: summaryLoading } = useQuery(
    'supplier-inventory-summary',
    async () => {
      const res = await axios.get('/inventory/supplier/summary');
      return res.data.summary;
    }
  );

  // Fetch inventory items
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery(
    'supplier-inventory-items',
    async () => {
      const res = await axios.get('/inventory/supplier');
      return res.data;
    }
  );

  // Fetch stock movements
  const { data: stockMovementsData, isLoading: movementsLoading } = useQuery(
    'supplier-stock-movements',
    async () => {
      const res = await axios.get('/inventory/supplier/movements');
      return res.data.movements;
    }
  );

  // Handle download to PDF
  const handleDownload = async () => {
    const input = reportRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const pageHeight = 297;
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

    pdf.save('inventory-analysis-report.pdf');
  };

  if (summaryLoading || inventoryLoading || movementsLoading) {
    return <LoadingSpinner />;
  }

  // Prepare chart data
  const stockData = {
    labels: ['Total Stock', 'Total Reserved', 'Total Available'],
    datasets: [
      {
        label: 'Inventory Overview',
        data: [summary?.totalStock, summary?.totalReserved, summary?.totalAvailable],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1
      }
    ]
  };

  const lowStockData = {
    labels: ['Low Stock', 'Out of Stock', 'In Stock'],
    datasets: [
      {
        label: 'Stock Status',
        data: [
          summary?.lowStockCount || 0,
          summary?.outOfStockCount || 0,
          (summary?.totalProducts || 0) - (summary?.lowStockCount || 0) - (summary?.outOfStockCount || 0)
        ],
        backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
        borderColor: ['rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1
      }
    ]
  };

  const movementLabels = stockMovementsData?.map(m => new Date(m.createdAt).toLocaleDateString()) || [];
  const movementQuantities = stockMovementsData?.map(m => m.quantity * (m.type === 'stock_out' ? -1 : 1)) || [];

  const movementLineData = {
    labels: movementLabels,
    datasets: [
      {
        label: 'Stock Change per Movement',
        data: movementQuantities,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="report-container">
      <div ref={reportRef} className="report-content">
        <header className="report-header">
          <h1>Inventory Analysis Report</h1>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </header>

        <section className="report-charts-summary">
          <div className="chart-container">
            <h3>Overall Stock Status</h3>
            <Pie data={lowStockData} />
          </div>
          <div className="chart-container">
            <h3>Inventory Breakdown</h3>
            <Bar data={stockData} />
          </div>
        </section>

        <section className="report-section">
          <h2>Product Details</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Reserved Stock</th>
                  <th>Min. Level</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData?.inventory.map(item => (
                  <tr key={item._id}>
                    <td>{item.product.name}</td>
                    <td>{item.product.sku}</td>
                    <td>{item.currentStock}</td>
                    <td>{item.reservedStock}</td>
                    <td>{item.minStockLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section">
          <h2>Recent Stock Movements</h2>
          <div className="chart-container-full">
            <Line data={movementLineData} />
          </div>
        </section>
      </div>

      <button onClick={handleDownload} className="download-btn">
        Download Analysis
      </button>
    </div>
  );
};

export default InventoryAnalysisPage;
