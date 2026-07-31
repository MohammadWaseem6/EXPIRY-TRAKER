const BASE_URL = "http://127.0.0.1:5001/api";

export const apiClient = {
    // Auth
    register: (userData) =>
        fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData),
        }).then((res) => res.json()),
    login: (credentials) =>
        fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials),
        }).then((res) => res.json()),

    // Items (authenticated)
    getItems: (token) =>
        fetch(`${BASE_URL}/items`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
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
            headers: {
                Authorization: `Bearer ${token}`
            },
        }).then((res) => res.json()),
};