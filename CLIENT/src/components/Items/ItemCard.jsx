const ItemCard = ({ item, onDelete }) => {
  const today = new Date();
  const expiry = new Date(item.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusColor = "text-green-600";
  let statusText = `${diffDays} days left`;
  let borderColor = "border-green-200";
  if (diffDays < 0) {
    statusColor = "text-red-600";
    statusText = `Expired ${Math.abs(diffDays)} days ago`;
    borderColor = "border-red-200";
  } else if (diffDays <= 3) {
    statusColor = "text-orange-500";
    statusText = ` ${diffDays} days left`;
    borderColor = "border-orange-200";
  }

  return (
    <div
      className={`bg-white border ${borderColor} rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
            <p className="text-xs text-gray-500">{item.category}</p>
          </div>
          <span className={`text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
          {item.purchaseDate && (
            <p>Purchased: {new Date(item.purchaseDate).toLocaleDateString()}</p>
          )}
        </div>
        {item.isAllergen && (
          <span className="inline-block mt-2 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            Allergen
          </span>
        )}
      </div>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={() => onDelete(item._id)}
          className="text-xs text-red-600 hover:text-red-800 font-medium transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
