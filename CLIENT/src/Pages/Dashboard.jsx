import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useItems } from "../hooks/useItems";
import StatsCards from "../Components/Dashboard/StatsCards";
import ChartsSection from "../Components/Dashboard/ChartsSection";
import Widgets from "../Components/Dashboard/Widgets";
import ItemsTable from "../Components/Dashboard/ItemsTable";
import QuickActions from "../Components/Dashboard/QuickActions";
import AddItemModal from "../Components/Dashboard/AddItemModal";
import ItemDetailModal from "../Components/Dashboard/ItemDetailModal";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { items, addItem, deleteItem } = useItems();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((i) => i.category === selectedCategory);

  const toggleFavorite = (itemId) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  return (
    <>
      <StatsCards items={items} />
      <ChartsSection items={items} selectedCategory={selectedCategory} />
      <Widgets items={items} favorites={favorites} />
      <ItemsTable
        items={filteredItems}
        onDelete={deleteItem}
        onView={(item) => {
          setSelectedItem(item);
          setShowDetailModal(true);
        }}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
      <QuickActions onAdd={() => setShowAddModal(true)} />
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addItem}
      />
      <ItemDetailModal
        isOpen={showDetailModal}
        item={selectedItem}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedItem(null);
        }}
      />
    </>
  );
};

export default Dashboard;
