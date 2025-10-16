import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash2, Edit } from 'lucide-react';

// --- Reusable UI Components (No changes needed) ---
const FormInput = ({ label, name, value, onChange, error, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full border rounded-lg p-2.5 transition-colors ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            {...props}
        />
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
);

const FormSelect = ({ label, name, value, onChange, error, children }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full border rounded-lg p-2.5 transition-colors ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
        >
            {children}
        </select>
         {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
);

const ToggleSwitch = ({ name, checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
);


export default function Discount() {
    const [discounts, setDiscounts] = useState([]);
    const [formData, setFormData] = useState({
        code: "", type: "percentage", value: "",
        startDate: "", endDate: "", isActive: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // --- ⬇️ CORRECTED CODE HERE ⬇️ ---
    // This correctly gets today's date in the local timezone (YYYY-MM-DD)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    // --- ⬆️ END OF CORRECTED CODE ⬆️ ---

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

    useEffect(() => { fetchDiscounts(); }, []);

    const validateForm = (data) => {
        const newErrors = {};
        if (!data.code.trim()) newErrors.code = "Code is required.";
        else if (/\s/.test(data.code)) newErrors.code = "Code cannot contain spaces.";
        else if (data.code.trim().length < 3) newErrors.code = "Code must be at least 3 characters long.";

        if (!data.value) newErrors.value = "Value is required.";
        else if (isNaN(data.value) || Number(data.value) <= 0) newErrors.value = "Value must be a positive number.";
        else if (data.type === 'percentage' && Number(data.value) > 100) newErrors.value = "Percentage cannot exceed 100.";

        const todayValidation = new Date();
        todayValidation.setHours(0, 0, 0, 0);

        if (!data.startDate) newErrors.startDate = "Start date is required.";
        else if (!editingId && new Date(data.startDate) < todayValidation) {
            newErrors.startDate = "Start date cannot be in the past.";
        }
        
        if (!data.endDate) newErrors.endDate = "End date is required.";
        else if (data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
            newErrors.endDate = "End date cannot be before the start date.";
        }
        return newErrors;
    };

    const clearForm = () => {
        setFormData({
            code: "", type: "percentage", value: "",
            startDate: "", endDate: "", isActive: true,
        });
        setEditingId(null);
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        setErrors(validationErrors);
        
        if (Object.keys(validationErrors).length > 0) {
            toast.error("Please fix the validation errors.");
            return;
        }

        try {
            setLoading(true);
            const apiData = { ...formData, code: formData.code.toUpperCase().trim() };
            if (editingId) {
                await axios.put(`/discounts/${editingId}`, apiData);
                toast.success("Discount updated successfully");
            } else {
                await axios.post("/discounts", apiData);
                toast.success("Discount created successfully");
            }
            clearForm();
            fetchDiscounts();
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to save discount";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };
    
    const handleEdit = (discount) => {
        window.scrollTo(0, 0);
        setFormData({
            code: discount.code, type: discount.type, value: discount.value,
            startDate: discount.startDate?.split("T")[0],
            endDate: discount.endDate?.split("T")[0],
            isActive: discount.isActive,
        });
        setEditingId(discount._id);
        setErrors({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this discount?")) return;
        try {
            await axios.delete(`/api/discounts/${id}`);
            toast.success("Discount deleted successfully");
            fetchDiscounts();
        } catch (err) {
            toast.error("Failed to delete discount");
        }
    };
    
    return (
        <div className="p-4 sm:p-6 min-h-screen bg-slate-50 text-slate-900">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Discount Management</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-3xl">
                <h2 className="text-xl font-semibold mb-6 border-b pb-4">
                    {editingId ? "Edit Discount Code" : "Create New Discount Code"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Discount Code" name="code" value={formData.code} onChange={handleChange} error={errors.code} required placeholder="e.g., SAVE20" />
                    <FormInput label="Value" name="value" type="number" value={formData.value} onChange={handleChange} error={errors.value} required min="0" placeholder="e.g., 20 or 500" />
                    <FormSelect label="Discount Type" name="type" value={formData.type} onChange={handleChange} error={errors.type}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (LKR)</option>
                    </FormSelect>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <ToggleSwitch name="isActive" checked={formData.isActive} onChange={handleChange} />
                    </div>
                    
                    <FormInput 
                        label="Start Date" 
                        name="startDate" 
                        type="date" 
                        value={formData.startDate} 
                        onChange={handleChange} 
                        error={errors.startDate} 
                        required 
                        min={!editingId ? todayString : undefined}
                    />
                    <FormInput 
                        label="End Date" 
                        name="endDate" 
                        type="date" 
                        value={formData.endDate} 
                        onChange={handleChange} 
                        error={errors.endDate} 
                        required 
                        min={formData.startDate || todayString}
                    />
                </div>

                <div className="mt-6 pt-4 border-t">
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Saving..." : editingId ? "Update Discount" : "Create Discount"}
                    </button>
                    {editingId && (
                        <button type="button" onClick={clearForm} className="ml-4 text-sm text-gray-600 hover:underline">
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">All Discounts</h2>
                {loading ? <p>Loading discounts...</p> : discounts.length === 0 ? (
                    <p className="text-slate-600">No discounts have been created yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Code</th>
                                    <th scope="col" className="px-6 py-3">Value</th>
                                    <th scope="col" className="px-6 py-3">Dates</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {discounts.map((d) => (
                                    <tr key={d._id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-900">{d.code}</td>
                                        <td className="px-6 py-4">{d.type === 'percentage' ? `${d.value}%` : `LKR ${d.value}`}</td>
                                        <td className="px-6 py-4">{d.startDate?.split("T")[0]} to {d.endDate?.split("T")[0]}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${d.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {d.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-4">
                                            <button onClick={() => handleEdit(d)} className="font-medium text-blue-600 hover:text-blue-800 transition"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(d._id)} className="font-medium text-red-600 hover:text-red-800 transition"><Trash2 size={18} /></button>
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