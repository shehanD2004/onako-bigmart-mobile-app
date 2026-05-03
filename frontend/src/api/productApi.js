import API from "./axios";

/**
 * Get public products with optional filters.
 * Maps to web: storeApiSlice.getPublicProducts
 * GET /store/products?page=&category=&search=&sort=
 */
export const getPublicProducts = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.category) queryParams.append("category", params.category);
  if (params.search) queryParams.append("search", params.search);
  if (params.sort) queryParams.append("sort", params.sort);
  return API.get(`/store/products?${queryParams.toString()}`);
};

/**
 * Get a single product by slug.
 * Maps to web: storeApiSlice.getProductBySlug
 * GET /store/products/:slug
 */
export const getProductBySlug = (slug) => API.get(`/store/products/${slug}`);

/**
 * Get featured / deal products.
 * Maps to web: storeApiSlice.getFeaturedProducts
 * GET /store/featured
 */
export const getFeaturedProducts = () => API.get("/store/featured");