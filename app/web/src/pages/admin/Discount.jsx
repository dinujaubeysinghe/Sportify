import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Discount() {
  const [discounts, setDiscounts] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load discounts
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/discounts");
      setDiscounts(res.data.discounts || []);
    } catch (err) {
      toast.error("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit form (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`/discounts/${editingId}`, formData);
        toast.success("Discount updated successfully");
      } else {
        await axios.post("/discounts", formData);
        toast.success("Discount created successfully");
      }
      setFormData({
        code: "",
        type: "percentage",
        value: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
      setEditingId(null);
      fetchDiscounts();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save discount";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Edit discount
  const handleEdit = (discount) => {
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      startDate: discount.startDate?.split("T")[0],
      endDate: discount.endDate?.split("T")[0],
      isActive: discount.isActive,
    });
    setEditingId(discount._id);
  };

  // Delete discount
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this discount?")) return;
    try {
      await axios.delete(`/discounts/${id}`);
      toast.success("Discount deleted successfully");
      fetchDiscounts();
    } catch (err) {
      toast.error("Failed to delete discount");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
      <h1 className="text-2xl font-bold mb-6">Discount Management</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md mb-8 max-w-2xl"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Discount" : "Create Discount"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Value</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Active</label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  code: "",
                  type: "percentage",
                  value: "",
                  startDate: "",
                  endDate: "",
                  isActive: true,
                });
              }}
              className="ml-3 text-gray-600 hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Discounts</h2>

        {loading ? (
          <p>Loading...</p>
        ) : discounts.length === 0 ? (
          <p className="text-gray-600">No discounts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border">Code</th>
                  <th className="p-3 border">Type</th>
                  <th className="p-3 border">Value</th>
                  <th className="p-3 border">Start Date</th>
                  <th className="p-3 border">End Date</th>
                  <th className="p-3 border">Active</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="p-3 border font-semibold">{d.code}</td>
                    <td className="p-3 border capitalize">{d.type}</td>
                    <td className="p-3 border">{d.value}</td>
                    <td className="p-3 border">{d.startDate?.split("T")[0]}</td>
                    <td className="p-3 border">{d.endDate?.split("T")[0]}</td>
                    <td className="p-3 border">
                      {d.isActive ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-red-600 font-medium">No</span>
                      )}
                    </td>
                    <td className="p-3 border text-center space-x-2">
                      <button
                        onClick={() => handleEdit(d)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
