import API from "./axios";

/**
 * Maps to web: storeApiSlice order endpoints
 */

export const createOrder = (orderData) => API.post("/orders", orderData);

export const getMyOrders = () => API.get("/orders/my");

export const trackOrder = (orderNumber) =>
  API.get(`/orders/track/${orderNumber}`);
