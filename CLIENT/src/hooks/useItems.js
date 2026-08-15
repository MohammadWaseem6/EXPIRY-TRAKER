import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../Api/apiClient";
import { useAuth } from "../Context/AuthContext";

export const useItems = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiClient.getItems(token);
      if (Array.isArray(data)) setItems(data);
    } catch (error) {
      console.error("Fetch items error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addItem = async (itemData) => {
    try {
      const data = await apiClient.createItem(token, itemData);
      if (data.item) {
        await fetchItems();
        return { success: true, message: "Item added!" };
      }
      return { success: false, error: data.error || "Failed to add" };
    } catch (error) {
      return { success: false, error: "Something went wrong" };
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await apiClient.deleteItem(token, itemId);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return { success: false };
    }
  };
  const updateItem = async (itemId, updatedData) => {
    try {
      const data = await apiClient.updateItem(token, itemId, updatedData);
      if (data.item) {
        setItems((prev) =>
          prev.map((item) => (item._id === itemId ? data.item : item)),
        );
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error("Update error:", error);
      return { success: false, error: "Something went wrong" };
    }
  };
  useEffect(() => {
    fetchItems();
  }, [token]);

  return { items, loading, fetchItems, addItem, deleteItem, updateItem };
};
