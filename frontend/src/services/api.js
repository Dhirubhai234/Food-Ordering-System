const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Token helpers
export const getToken = () => localStorage.getItem("foodie_token");
export const setToken = (token) => localStorage.setItem("foodie_token", token);
export const removeToken = () => localStorage.getItem("foodie_token") && localStorage.removeItem("foodie_token");

/**
 * Universal API Request Wrapper with Auto JWT Injection & Error Parsing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// 1. Authentication APIs
export const authAPI = {
  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    }),

  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),

  getMe: () =>
    request("/auth/me", {
      method: "GET"
    }),

  // Admin only
  getAllUsers: () =>
    request("/auth/users", {
      method: "GET"
    })
};

// 2. Food Menu APIs
export const foodAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.search) query.append("search", params.search);
    if (params.isVeg !== undefined) query.append("isVeg", params.isVeg);
    if (params.all) query.append("all", "true");

    const queryString = query.toString();
    return request(`/food${queryString ? `?${queryString}` : ""}`, {
      method: "GET"
    });
  },

  getById: (id) =>
    request(`/food/${id}`, {
      method: "GET"
    }),

  // Admin only: Add new food item
  create: (foodData) =>
    request("/food", {
      method: "POST",
      body: JSON.stringify(foodData)
    }),

  // Admin only: Update existing food item
  update: (id, foodData) =>
    request(`/food/${id}`, {
      method: "PUT",
      body: JSON.stringify(foodData)
    }),

  // Admin only: Delete food item
  delete: (id) =>
    request(`/food/${id}`, {
      method: "DELETE"
    })
};

// 3. Orders APIs
export const orderAPI = {
  create: (orderData) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData)
    }),

  getMyOrders: () =>
    request("/orders/myorders", {
      method: "GET"
    }),

  getById: (id) =>
    request(`/orders/${id}`, {
      method: "GET"
    }),

  // Admin only: Get all customer orders
  getAllOrders: () =>
    request("/orders", {
      method: "GET"
    }),

  // Admin only: Update order fulfillment status
  updateStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    })
};
