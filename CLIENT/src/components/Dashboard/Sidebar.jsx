/* eslint-disable no-unused-vars */
import { LayoutDashboard, Package, ShoppingBag, Users, Star, Calendar, Settings, HelpCircle, LogOut } from "lucide-react";

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  user, 
  logout 
}) => {
  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300`}>
      <div className="p-6 border-b border-gray-100 flex items-center gap-2">
        <span className="text-2xl">📦</span>
        {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">Expiry</h1>}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarOpen && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</div>}
        
        <a href="#" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 ${!sidebarOpen && "justify-center"}`}>
          <LayoutDashboard className="w-4 h-4 mr-3" />
          {sidebarOpen && "Dashboard"}
        </a>
        <a href="#" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}>
          <Package className="w-4 h-4 mr-3" />
          {sidebarOpen && "Items"}
        </a>
        <a href="#" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}>
          <ShoppingBag className="w-4 h-4 mr-3" />
          {sidebarOpen && "Orders"}
        </a>
        <a href="#" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}>
          <Users className="w-4 h-4 mr-3" />
          {sidebarOpen && "Team"}
        </a>
        <a href="#" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}>
          <Star className="w-4 h-4 mr-3" />
          {sidebarOpen && "Favorites"}
        </a>

        {sidebarOpen && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Other</div>}
        
        <a href="#" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}>
          <Calendar className="w-4 h-4 mr-3" />
          {sidebarOpen && "Calendar"}
        </a>
        <a href="#" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}>
          <Settings className="w-4 h-4 mr-3" />
          {sidebarOpen && "Settings"}
        </a>

        {/* Categories */}
        {sidebarOpen && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Categories</div>}
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-lg transition ${
              selectedCategory === cat ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            } ${!sidebarOpen && "justify-center"}`}
          >
            <span className="mr-3">#</span>
            {sidebarOpen && (
              <>
                {cat}
                <span className="ml-auto text-xs text-gray-400">
                  {cat === "All" ? categories.length - 1 : "..."}
                </span>
              </>
            )}
          </button>
        ))}
      </nav>

      {sidebarOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{user?.email || "admin@company.com"}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition w-full px-2 py-1 rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <p className="text-xs text-gray-400 mt-3">© 2026 Expiry Tracker</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;