import { Star, Eye, MoreVertical } from "lucide-react";
import { useState } from "react";

const ItemsTable = ({ items, onDelete, onView, favorites, toggleFavorite }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleMarkUsed = (itemId) => {
    onDelete(itemId);
    setActiveDropdown(null);
  };

  const handleEdit = (item) => {
    alert(`Edit item: ${item.name}`);
    setActiveDropdown(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Recent Items</h3>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">View All</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-blue-600 font-medium">Export</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                Item
              </th>
              <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                Category
              </th>
              <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                Expiry
              </th>
              <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                Price
              </th>
              <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                Status
              </th>
              <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-400">
                  No items yet
                </td>
              </tr>
            ) : (
              items.slice(0, 4).map((item) => {
                const days = Math.ceil(
                  (new Date(item.expiryDate) - new Date()) /
                    (1000 * 60 * 60 * 24),
                );
                let status = "Fresh";
                let statusColor = "text-green-500 bg-green-50";
                if (days < 0) {
                  status = "Expired";
                  statusColor = "text-red-500 bg-red-50";
                } else if (days <= 3) {
                  status = "Expiring Soon";
                  statusColor = "text-orange-500 bg-orange-50";
                }

                const isFavorite = favorites.includes(item._id);

                return (
                  <tr
                    key={item._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-3 font-medium text-gray-700 flex items-center gap-2">
                      {item.name}
                      <button
                        onClick={() => toggleFavorite(item._id)}
                        className="text-gray-300 hover:text-yellow-400 transition"
                      >
                        <Star
                          className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{item.category}</td>
                    <td className="py-3 px-3 text-gray-500">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      ${item.price || "0"}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${statusColor}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(item)}
                          className="text-gray-400 hover:text-blue-500 transition"
                          title="Quick View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === item._id ? null : item._id,
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeDropdown === item._id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => handleEdit(item)}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleMarkUsed(item._id)}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                ✅ Mark Used
                              </button>
                              <button
                                onClick={() => {
                                  onDelete(item._id);
                                  setActiveDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemsTable;
