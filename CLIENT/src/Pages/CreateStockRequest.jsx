import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { apiClient } from "../Api/apiClient";
import { Plus, X, Send } from "lucide-react";

const CreateStockRequest = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    branch: "HQ",
    items: [{ name: "", category: "", quantity: 1, notes: "" }],
    reason: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const addItemRow = () => {
    setForm({
      ...form,
      items: [...form.items, { name: "", category: "", quantity: 1, notes: "" }],
    });
  };

  const removeItemRow = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = form.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setForm({ ...form, items: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiClient.createStockRequest(token, form);
      if (data.request) {
        setMessage("✅ Stock request sent for approval!");
        setForm({
          branch: "HQ",
          items: [{ name: "", category: "", quantity: 1, notes: "" }],
          reason: "",
          notes: "",
        });
        setTimeout(() => setMessage(""), 4000);
      } else {
        setMessage(data.error || "Failed to create request");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Send className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Request Stock</h1>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {/* Branch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
          <select
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="HQ">HQ</option>
            <option value="STC">STC</option>
            <option value="SPADC">SPADC</option>
            <option value="SABIC">SABIC</option>
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Request *</label>
          <input
            type="text"
            placeholder="e.g., Low stock, expiring soon, new arrival"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Items *</label>
            <button
              type="button"
              onClick={addItemRow}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {form.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 mb-2 bg-gray-50 p-3 rounded-lg">
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                className="col-span-5 px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={item.category}
                onChange={(e) => handleItemChange(index, "category", e.target.value)}
                className="col-span-3 px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                className="col-span-2 px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => removeItemRow(index)}
                className="col-span-1 text-red-500 hover:text-red-700 flex items-center justify-center"
                disabled={form.items.length === 1}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="2"
            placeholder="Any special instructions..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default CreateStockRequest;