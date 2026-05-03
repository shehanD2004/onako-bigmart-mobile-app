import API from "./axios";

/**
 * Maps to web: authApiSlice endpoints
 */

export const loginUser = (credentials) =>
  API.post("/auth/login", credentials);

export const registerUser = (userData) =>
  API.post("/auth/register", userData);

export const logoutUser = () => API.post("/auth/logout");

export const getMe = () => API.get("/auth/me");

export const updateProfile = (data) => API.put("/auth/profile", data);

export const updatePassword = (data) => API.put("/auth/password", data);

export const getAddresses = () => API.get("/auth/addresses");

export const addAddress = (data) => API.post("/auth/addresses", data);

export const deleteAddress = (id) => API.delete(`/auth/addresses/${id}`);

export const setDefaultAddress = (id) => API.put(`/auth/addresses/${id}/default`);