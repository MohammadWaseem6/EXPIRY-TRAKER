const BASE_URL = "https://expiry-traker.onrender.com/api";

export const apiClient = {
  // Auth
  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }).then((res) => res.json()),

  register: (userData) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
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

  updateItem: (token, itemId, itemData) =>
    fetch(`${BASE_URL}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
    }).then((res) => res.json()),
    
  releaseItem: (token, itemId) =>
    fetch(`${BASE_URL}/items/${itemId}/release`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()),
};