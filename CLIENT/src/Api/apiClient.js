const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("⚠️ VITE_API_URL is not defined in .env file");
}

export const apiClient = {
  // ===== STOCK REQUESTS =====
createStockRequest: (token, data) =>
  fetch(`${BASE_URL}/stock-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()),

getPendingStockRequests: (token) =>
  fetch(`${BASE_URL}/stock-requests/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json()),

getMyStockRequests: (token) =>
  fetch(`${BASE_URL}/stock-requests/my`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json()),

approveStockRequest: (token, requestId) =>
  fetch(`${BASE_URL}/stock-requests/${requestId}/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json()),

rejectStockRequest: (token, requestId) =>
  fetch(`${BASE_URL}/stock-requests/${requestId}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json()),

completeStockRequest: (token, requestId) =>
  fetch(`${BASE_URL}/stock-requests/${requestId}/complete`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json()),
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

    // Stocking Requests
getStockingRequests: (token) =>
  fetch(`${BASE_URL}/stocking-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json()),

createStockingRequest: (token, data) =>
  fetch(`${BASE_URL}/stocking-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()),

acceptStockingRequest: (token, requestId) =>
  fetch(`${BASE_URL}/stocking-requests/${requestId}/accept`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json()),

completeStockingRequest: (token, requestId) =>
  fetch(`${BASE_URL}/stocking-requests/${requestId}/complete`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json()),

cancelStockingRequest: (token, requestId) =>
  fetch(`${BASE_URL}/stocking-requests/${requestId}/cancel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json()),
};