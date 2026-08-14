import { Outlet } from "react-router-dom";
import Sidebar from "../Dashboard/Sidebar";
import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const categories = ["All", "Dairy", "Meat", "Produce"]; // or make it dynamic later

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        categories={categories}
        selectedCategory={"All"}
        setSelectedCategory={() => {}}
        user={user}
        logout={logout}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
