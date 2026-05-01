import axios from "axios";

const API = axios.create({
  baseURL: "https://your-backend.onrender.com/api",
});

export default API;