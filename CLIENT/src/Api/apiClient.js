const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("⚠️ VITE_API_URL is not defined in .env file");
}

export const apiClient = {
  // ===== AUTH =====
  register: (userData) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }).then((res) => res.json()),

  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }).then((res) => res.json()),

  // ===== ITEMS =====
  getItems: (token) =>
    fetch(`${BASE_URL}/items`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()),

  createItem: (token, itemData) =>
    fetch(`${BASE_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
    }).then((res) => res.json()),

  deleteItem: (token, itemId) =>
    fetch(`${BASE_URL}/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()),

  updateItem: (token, itemId, data) =>
    fetch(`${BASE_URL}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then((res) => res.json()),

  // ===== USERS =====
  getUsers: (token) =>
    fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()),

  inviteUser: (token, userData) =>
    fetch(`${BASE_URL}/users/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }).then((res) => res.json()),

  updateUser: (token, userId, data) =>
    fetch(`${BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then((res) => res.json()),

  deleteUser: (token, userId) =>
    fetch(`${BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()),
};