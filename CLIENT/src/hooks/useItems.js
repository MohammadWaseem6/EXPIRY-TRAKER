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

  useEffect(() => {
    fetchItems();
  }, [token]);

  return { items, loading, fetchItems, addItem, deleteItem };
};
