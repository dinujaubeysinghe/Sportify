import { Helmet } from "react-helmet-async";
import { ShoppingCart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const AdminOrders = () => {
  const queryClient = useQueryClient();

  // Fetch all orders
  const { data: orders, isLoading } = useQuery("all-orders", async () => {
    const response = await axios.get("/orders/admin/all");
    return response.data.orders;
  });

  // Mutation to update order status
  const updateStatusMutation = useMutation(
    async ({ orderId, paymentStatus }) => {
      await axios.put(`/orders/${orderId}/payment`, { paymentStatus });
    },
    {
      onSuccess: () => queryClient.invalidateQueries("all-orders"),
    }
  );

  const statusOptions = [
    "pending",
    "paid",
    "failed",
    "refunded",
    "partially_refunded",
  ];

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, paymentStatus: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // =====================
  // --- ANALYSIS LOGIC ---
  // =====================
  const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;
  const totalOrders = orders?.length || 0;
  const paidOrders = orders?.filter((o) => o.paymentStatus === "paid").length || 0;
  const pendingOrders =
    orders?.filter((o) => o.paymentStatus === "pending").length || 0;

  // Orders by date
  const ordersByDate = Object.values(
    orders.reduce((acc, o) => {
      const date = new Date(o.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = { date, count: 0, revenue: 0 };
      acc[date].count += 1;
      acc[date].revenue += o.total;
      return acc;
    }, {})
  );

  // Revenue by product
  const revenueByProduct = Object.values(
    orders.reduce((acc, o) => {
      o.items.forEach((item) => {
        if (!acc[item.name]) acc[item.name] = { product: item.name, revenue: 0 };
        acc[item.name].revenue += item.price * item.quantity;
      });
      return acc;
    }, {})
  );

  // Revenue by payment status
  const revenueByStatus = Object.values(
    orders.reduce((acc, o) => {
      if (!acc[o.paymentStatus])
        acc[o.paymentStatus] = { status: o.paymentStatus, revenue: 0 };
      acc[o.paymentStatus].revenue += o.total;
      return acc;
    }, {})
  );

  // =====================
  // --- REPORT EXPORT ---
  // =====================
  const exportCSV = () => {
    const csv = Papa.unparse(
      orders.map((o) => ({
        OrderNumber: o.orderNumber,
        Customer: o.user?.fullName,
        Total: o.total,
        PaymentStatus: o.paymentStatus,
        CreatedAt: new Date(o.createdAt).toLocaleString(),
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "orders_report.csv");
  };

  const exportPDF = () => {
    const doc = new jsPDF("p", "pt"); // portrait, points
    doc.setFontSize(14);
    doc.text("Sportify - Orders Report", 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

    // Table body
    const tableBody = orders.map((o) => [
      o.orderNumber,
      o.user?.fullName || "N/A",
      `$${o.total.toFixed(2)}`,
      o.paymentStatus,
      new Date(o.createdAt).toLocaleDateString(),
    ]);

    // Use autoTable
    autoTable(doc, {
      startY: 80,
      head: [["Order #", "Customer", "Total", "Status", "Date"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] }, // Tailwind indigo-500
      styles: { fontSize: 9 },
    });

    // Summary after table
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text(`Total Orders: ${orders.length}`, 40, finalY);
    doc.text(`Paid Orders: ${paidOrders}`, 40, finalY + 15);
    doc.text(`Pending Orders: ${pendingOrders}`, 40, finalY + 30);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 40, finalY + 45);

    doc.save("orders_report.pdf");
  };

  // =====================
  // --- RENDER ---
  // =====================
  return (
    <>
      <Helmet>
        <title>Manage Orders - Sportify Admin</title>
        <meta
          name="description"
          content="Manage orders in the Sportify e-commerce platform."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
            <p className="text-gray-600 mt-2">
              Process and track customer orders
            </p>
          </div>

          {/* Orders Table */}
          {orders && orders.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto mb-10">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {statusOptions.map((paymentStatus) => (
                            <option key={paymentStatus} value={paymentStatus}>
                              {paymentStatus.replace("_", " ").toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() =>
                            (window.location.href = `orders/${order._id}`)
                          }
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Orders Yet
              </h2>
              <p className="text-gray-600 mb-6">
                There are no orders at the moment.
              </p>
            </div>
          )}

          {/* --- Reports + Analysis --- */}
          {orders && orders.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Orders Analysis & Reports
              </h2>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={exportCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download CSV
                </button>
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Orders by Date */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Orders by Date</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ordersByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={ordersByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue by Product */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">
                    Revenue by Product
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={revenueByProduct}
                        dataKey="revenue"
                        nameKey="product"
                        outerRadius={100}
                        fill="#6366f1"
                        label
                      >
                        {revenueByProduct.map((_, index) => (
                          <Cell
                            key={index}
                            fill={[
                              "#6366f1",
                              "#f59e0b",
                              "#ef4444",
                              "#10b981",
                              "#3b82f6",
                            ][index % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders;
