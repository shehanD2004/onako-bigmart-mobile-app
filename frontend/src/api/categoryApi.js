import API from "./axios";

/**
 * Maps to web: storeApiSlice.getPublicCategories
 * GET /store/categories
 */
export const getPublicCategories = () => API.get("/store/categories");
