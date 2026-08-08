import { ShoppingBag, PlusCircle } from "lucide-react";

const QuickActions = ({ onAdd }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              Inventory Actions
            </h3>
            <p className="text-xs text-gray-400">
              Add items or view order history
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Add New Item
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">
            <ShoppingBag className="w-4 h-4" /> Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
