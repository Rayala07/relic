import axios from "axios";

const API_URL = "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const itemService = {
  save: async ({ url, title }) => {
    const response = await apiClient.post("/items/create", { url, title });
    return response.data;
  },
  getAll: async (page = 1, limit = 12) => {
    const response = await apiClient.get(`/items/get?page=${page}&limit=${limit}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/items/get/${id}`);
    return response.data;
  },
  getRelated: async (id) => {
    const response = await apiClient.get(`/items/get/${id}/related`);
    return response.data;
  },
  getResurfaced: async () => {
    const response = await apiClient.get(`/resurface`);
    return response.data;
  }
};

export default itemService;
