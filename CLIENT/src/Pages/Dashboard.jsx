/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import ItemForm from "../components//Items/ItemForm"
import ItemList from "../components/items/ItemList";

const Dashboard = () => {
  const { token, user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({ name: "", category: "", expiryDate: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      apiClient.getItems(token).then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
    }
  }, [token]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const data = await apiClient.createItem(token, itemForm);
      if (data.item) {
        setMessage("Item added!");
        setItemForm({ name: "", category: "", expiryDate: "" });
        const updatedItems = await apiClient.getItems(token);
        setItems(updatedItems);
      } else {
        setMessage(data.error || "Failed to add");
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  const handleDeleteItem = async (itemId) => {
    await apiClient.deleteItem(token, itemId);
    setItems(items.filter((item) => item._id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Expiry Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name || "User"}!</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <ItemForm
          itemForm={itemForm}
          handleItemChange={(e) => setItemForm({ ...itemForm, [e.target.name]: e.target.value })}
          handleAddItem={handleAddItem}
          itemMessage={message}
        />

        <ItemList items={items} handleDeleteItem={handleDeleteItem} />
      </div>
    </div>
  );
};

export default Dashboard;