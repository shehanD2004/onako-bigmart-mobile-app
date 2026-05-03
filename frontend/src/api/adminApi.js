import API from "./axios";

// ========== INVENTORY (PRODUCTS) ==========

export const getAdminProducts = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.search) queryParams.append("search", params.search);
  if (params.limit) queryParams.append("limit", params.limit);
  return API.get(`/products?${queryParams.toString()}`);
};

export const getProductById = (id) => API.get(`/products/${id}`);

export const createProduct = (data) =>
  API.post("/products", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProduct = (id, data) =>
  API.put(`/products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const toggleProductStatus = (id) => API.patch(`/products/${id}/status`);

export const deleteProduct = (id) => API.delete(`/products/${id}`);

export const getCategories = () => API.get("/categories/flat");

// ========== ORDERS ==========

export const getAdminOrders = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.status) queryParams.append("orderStatus", params.status);
  return API.get(`/orders?${queryParams.toString()}`);
};

export const updateOrderStatus = (id, status, note = "") =>
  API.put(`/orders/${id}/status`, { status, note });

// ========== SUPPLIERS ==========

export const getAdminSuppliers = () => API.get("/suppliers");

export const createSupplier = (data) => API.post("/suppliers", data);

export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data);

export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// ========== FLEET & STAFF ==========

export const getAdminVehicles = () => API.get("/vehicles");
export const createVehicle = (data) => API.post("/vehicles", data);
export const updateVehicle = (id, data) => API.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => API.delete(`/vehicles/${id}`);

export const getAdminStaff = () => API.get("/staff");
export const createStaff = (data) => API.post("/staff", data);
export const updateStaff = (id, data) => API.put(`/staff/${id}`, data);
export const deleteStaff = (id) => API.delete(`/staff/${id}`);
