import { useState, useEffect } from "react";
import "./App.css";

const BASE_URL = "http://127.0.0.1:5001/api";

function App() {
  // Auth state
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  // Item state
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({ name: "", category: "", expiryDate: "" });
  const [itemMessage, setItemMessage] = useState("");

  // Fetch items when token changes
  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${BASE_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setItems(data);
      } else {
        console.error("Fetch items error:", data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  // Auth handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage("");
    setToken("");
    setForm({ name: "", email: "", password: "" });
    setItems([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await fetch(`${BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessage(data.message);
      setToken(data.token);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Item handlers
  const handleItemChange = (e) => {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add item");
      setItemMessage("Item added successfully!");
      setItemForm({ name: "", category: "", expiryDate: "" });
      fetchItems(); // refresh list
    } catch (error) {
      setItemMessage(error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await fetch(`${BASE_URL}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(items.filter((item) => item._id !== itemId));
      } else {
        console.error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleLogout = () => {
    setToken("");
    setItems([]);
    setMessage("");
  };

  return (
    <div className="App">
      <h1>Expiry Tracker</h1>

      {!token ? (
        // Auth forms
        <>
          <h2>{isLogin ? "Login" : "Register"}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit">{isLogin ? "Login" : "Register"}</button>
          </form>
          <button onClick={toggleMode} style={{ marginTop: "10px", background: "#6c757d" }}>
            Switch to {isLogin ? "Register" : "Login"}
          </button>
          {message && <p style={{ marginTop: "10px" }}>{message}</p>}
        </>
      ) : (
        // Authenticated - show items
        <>
          <button onClick={handleLogout} style={{ float: "right", background: "#dc3545" }}>
            Logout
          </button>
          <h2>Your Items</h2>

          {/* Add item form */}
          <form onSubmit={handleAddItem} style={{ marginBottom: "20px" }}>
            <input
              type="text"
              name="name"
              placeholder="Item name"
              value={itemForm.name}
              onChange={handleItemChange}
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category (e.g., Dairy)"
              value={itemForm.category}
              onChange={handleItemChange}
              required
            />
            <input
              type="date"
              name="expiryDate"
              value={itemForm.expiryDate}
              onChange={handleItemChange}
              required
            />
            <button type="submit">Add Item</button>
          </form>
          {itemMessage && <p>{itemMessage}</p>}

          {/* Item list */}
          {items.length === 0 ? (
            <p>No items yet. Add one above!</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {items.map((item) => (
                <li
                  key={item._id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>{item.name}</strong> ({item.category}) – Expires:{" "}
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    style={{ background: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px" }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;