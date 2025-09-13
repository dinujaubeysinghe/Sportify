import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BulkStockUpdate = ({ onClose }) => {
  const [uploadedData, setUploadedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Bulk update mutation
  const bulkUpdateMutation = useMutation(
    async (data) => {
      return axios.post('/inventory/bulk-update', { updates: data });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory-summary');
        queryClient.invalidateQueries('low-stock-products');
        queryClient.invalidateQueries('inventory-items');
        toast.success('Bulk stock update completed successfully!');
        setUploadedData([]);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update stock');
      }
    }
  );

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Expected headers: SKU, Action, Quantity, Reason, Cost, Notes
      const expectedHeaders = ['SKU', 'Action', 'Quantity', 'Reason'];
      const hasRequiredHeaders = expectedHeaders.every(header => 
        headers.some(h => h.toLowerCase() === header.toLowerCase())
      );

      if (!hasRequiredHeaders) {
        toast.error('CSV must contain columns: SKU, Action, Quantity, Reason');
        return;
      }

      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 4 && values[0]) {
          data.push({
            sku: values[0],
            action: values[1]?.toLowerCase(),
            quantity: parseInt(values[2]) || 0,
            reason: values[3] || 'Bulk Update',
            cost: parseFloat(values[4]) || 0,
            notes: values[5] || '',
            row: i + 1
          });
        }
      }

      setUploadedData(data);
      toast.success(`Loaded ${data.length} stock updates from CSV`);
    };

    reader.readAsText(file);
  };

  const handleManualAdd = (data) => {
    const newUpdate = {
      sku: data.sku,
      action: data.action,
      quantity: parseInt(data.quantity),
      reason: data.reason,
      cost: parseFloat(data.cost) || 0,
      notes: data.notes || '',
      row: uploadedData.length + 1
    };

    setUploadedData(prev => [...prev, newUpdate]);
    reset();
  };

  const removeUpdate = (index) => {
    setUploadedData(prev => prev.filter((_, i) => i !== index));
  };

  const processBulkUpdate = () => {
    if (uploadedData.length === 0) {
      toast.error('No updates to process');
      return;
    }

    setIsProcessing(true);
    bulkUpdateMutation.mutate(uploadedData, {
      onSettled: () => setIsProcessing(false)
    });
  };

  const downloadTemplate = () => {
    const csvContent = [
      'SKU,Action,Quantity,Reason,Cost,Notes',
      'PROD001,add,50,Restock,25.99,New shipment received',
      'PROD002,remove,5,Damage,0,Items damaged in transit',
      'PROD003,adjust,100,Inventory Adjustment,0,Year-end count correction'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock-update-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'add':
        return 'bg-green-100 text-green-800';
      case 'remove':
        return 'bg-red-100 text-red-800';
      case 'adjust':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Bulk Stock Update</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update multiple products at once using CSV upload or manual entry
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Upload CSV File</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </label>
                    <button
                      onClick={downloadTemplate}
                      className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Template
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <p>CSV format: SKU, Action, Quantity, Reason, Cost, Notes</p>
                    <p>Actions: add, remove, adjust</p>
                  </div>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Manual Entry</h4>
                
                <form onSubmit={handleSubmit(handleManualAdd)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        {...register('sku', { required: 'SKU is required' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Product SKU"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                      <select
                        {...register('action', { required: 'Action is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Action</option>
                        <option value="add">Add Stock</option>
                        <option value="remove">Remove Stock</option>
                        <option value="adjust">Adjust Stock</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        {...register('quantity', { required: 'Quantity is required', min: 1 })}
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cost (Optional)</label>
                      <input
                        {...register('cost')}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                    <select
                      {...register('reason', { required: 'Reason is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Reason</option>
                      <option value="restock">Restock</option>
                      <option value="purchase">Purchase</option>
                      <option value="return">Return</option>
                      <option value="damage">Damage</option>
                      <option value="adjustment">Inventory Adjustment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <input
                      {...register('notes')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to List
                  </button>
                </form>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Updates to Process ({uploadedData.length})
                </h4>
                {uploadedData.length > 0 && (
                  <button
                    onClick={() => setUploadedData([])}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </button>
                )}
              </div>

              {uploadedData.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  <div className="divide-y divide-gray-200">
                    {uploadedData.map((update, index) => (
                      <div key={index} className="p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">
                                {update.sku}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(update.action)}`}>
                                {update.action}
                              </span>
                              <span className="text-sm text-gray-600">
                                {update.quantity} units
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {update.reason}
                              {update.cost > 0 && ` • $${update.cost}`}
                              {update.notes && ` • ${update.notes}`}
                            </div>
                          </div>
                          <button
                            onClick={() => removeUpdate(index)}
                            className="text-gray-400 hover:text-red-600 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">
                    No updates added yet. Upload a CSV file or add entries manually.
                  </p>
                </div>
              )}

              {/* Process Button */}
              {uploadedData.length > 0 && (
                <div className="pt-4">
                  <button
                    onClick={processBulkUpdate}
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Process {uploadedData.length} Updates
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkStockUpdate;

