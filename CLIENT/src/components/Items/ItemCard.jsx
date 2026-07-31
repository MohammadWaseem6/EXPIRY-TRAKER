const ItemCard = ({ item, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-500">Category: {item.category}</p>
        <p className="text-sm text-gray-500">
          Expires: {new Date(item.expiryDate).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={() => onDelete(item._id)}
        className="py-1 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Delete
      </button>
    </div>
  );
};

export default ItemCard;  