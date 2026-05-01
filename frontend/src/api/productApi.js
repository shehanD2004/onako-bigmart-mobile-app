import API from "./axios";

export const getProducts = () => API.get("/products");
export const getProductById = (id) => API.get(`/products/${id}`);