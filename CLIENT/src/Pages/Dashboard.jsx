import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useItems } from "../hooks/useItems";
import Sidebar from "../components/Dashboard/Sidebar";
import StatsCards from "../Components/Dashboard/StatsCards";
import ChartsSection from "../components/dashboard/ChartsSection";
import Widgets from "../components/dashboard/Widgets";
import ItemsTable from "../Components/Dashboard/ItemsTable";
import QuickActions from "../Components/Dashboard/QuickActions";
import AddItemModal from "../Components/Dashboard/AddItemModal";
import ItemDetailModal from "../Components/Dashboard/ItemDetailModal";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { items, addItem, deleteItem } = useItems();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        user={user}
        logout={logout}
      />
      <div className="flex-1 overflow-y-auto p-6">
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
      </div>
    </div>
  );
};

export default Dashboard;
