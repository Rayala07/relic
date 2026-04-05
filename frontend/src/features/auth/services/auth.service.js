import axios from "axios";


const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_URL = `${BASE_URL}/auth`;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const authService = {
  register: async (userData) => {
    const response = await apiClient.post("/register", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await apiClient.post("/login", credentials);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post("/logout");
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get("/get-me");
    return response.data;
  },
};

export default authService;
