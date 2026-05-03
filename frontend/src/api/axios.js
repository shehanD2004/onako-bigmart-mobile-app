import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ──────────────────────────────────────────────────────────
// IMPORTANT: Change this to YOUR computer's local IP address
// Find it by running `ipconfig` in terminal (look for IPv4)
// Both your phone and computer must be on the same WiFi
// ──────────────────────────────────────────────────────────
const BASE_URL = "https://onako-bigmart-mobile-app-production.up.railway.app/api";

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — inject Bearer token on every request
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // AsyncStorage read failed — continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — standardize error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract a clean error message for callers
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject({ ...error, message });
  }
);

export default API;