const ItemDetailModal = ({ isOpen, item, onClose }) => {
  if (!isOpen || !item) return null;

  const days = Math.ceil(
    (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  let statusText = "Fresh";
  let statusColor = "text-green-500";
  if (days < 0) {
    statusText = "Expired";
    statusColor = "text-red-500";
  } else if (days <= 3) {
    statusText = "Expiring Soon";
    statusColor = "text-orange-500";
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Category:</span> {item.category}
          </p>
          <p>
            <span className="font-medium">Expiry:</span>{" "}
            {new Date(item.expiryDate).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Purchased:</span>{" "}
            {item.purchaseDate
              ? new Date(item.purchaseDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <span className="font-medium">Price:</span> ${item.price || "0"}
          </p>
          <p>
            <span className="font-medium">Allergen:</span>{" "}
            {item.isAllergen ? "⚠️ Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span className={statusColor}>{statusText}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ItemDetailModal;
