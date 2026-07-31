const ItemForm = ({ itemForm, handleItemChange, handleAddItem, itemMessage }) => {
  return (
    <>
      <form onSubmit={handleAddItem} className="mt-4 space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Item name"
          value={itemForm.name}
          onChange={handleItemChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="text"
          name="category"
          placeholder="Category (e.g., Dairy)"
          value={itemForm.category}
          onChange={handleItemChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="date"
          name="expiryDate"
          value={itemForm.expiryDate}
          onChange={handleItemChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          Add Item
        </button>
      </form>
      {itemMessage && <p className="mt-2 text-sm text-green-600">{itemMessage}</p>}
    </>
  );
};

export default ItemForm;  