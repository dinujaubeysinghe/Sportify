import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockMovementsChart = ({ movements }) => {
  // Sort movements by date
  const sorted = [...movements].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Labels: formatted dates
  const labels = sorted.map((m) =>
    new Date(m.createdAt).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  // Separate datasets by movement type
  const types = ['stock_in', 'stock_out', 'adjustment'];
  const datasets = types.map((type) => ({
    label: type.replace('_', ' ').toUpperCase(),
    data: sorted.map((m) => (m.type === type ? m.newStock : null)),
    borderColor:
      type === 'stock_in'
        ? 'rgba(34,197,94,1)' // green
        : type === 'stock_out'
        ? 'rgba(239,68,68,1)' // red
        : 'rgba(249,115,22,1)', // orange for adjustment
    backgroundColor: 'transparent',
    spanGaps: true,
    tension: 0.3
  }));

  const data = { labels, datasets };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Stock Movements Over Time' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const movement = sorted[context.dataIndex];
            return movement
              ? `${movement.type.replace('_', ' ')}: ${movement.quantity} units`
              : '';
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Stock Level' } },
      x: { title: { display: true, text: 'Date & Time' } }
    }
  };

  return <Line data={data} options={options} />;
};

export default StockMovementsChart;
