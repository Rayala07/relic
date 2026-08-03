import axios from "axios";

import { supabase } from "../../../config/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// The backend runs on a free tier that sleeps after 15 minutes of inactivity and
// takes ~50s to spin back up. Without a bound, the first request of a cold visit
// hangs indefinitely; without retries, it fails outright. Both look like a broken
// app to a first-time visitor, so requests are bounded and retried instead.
const REQUEST_TIMEOUT_MS = 20000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

const IDEMPOTENT_METHODS = ["get", "head", "options"];

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

// Intercept all requests and attach the Supabase token dynamically
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ─── Cold-start signalling ───────────────────────────────────────────────────
// Lets the UI swap a stuck-looking spinner for an honest "waking up the server"
// state. Subscribe with onBackendWaking; it fires only on transitions.
const wakeListeners = new Set();
let backendWaking = false;

const setWaking = (waking) => {
  if (waking === backendWaking) return;
  backendWaking = waking;
  wakeListeners.forEach((listener) => listener(waking));
};

export const onBackendWaking = (listener) => {
  wakeListeners.add(listener);
  return () => wakeListeners.delete(listener);
};

export const isBackendWaking = () => backendWaking;

/**
 * Pre-warms the backend without blocking anything. Call it as the app mounts:
 * the static frontend paints instantly while the server spins up in the
 * background, so it is usually awake by the time the user navigates.
 */
export const warmBackend = () => {
  // Deliberately bare axios: /health sits outside the /api baseURL, needs no
  // auth token, and must not trip the retry logic. The long timeout matches the
  // worst-case spin-up; failure is ignored because this is best-effort only.
  const healthUrl = `${API_URL.replace(/\/api\/?$/, "")}/health`;
  axios.get(healthUrl, { timeout: 60000 }).catch(() => {});
};

// ─── Retry with exponential backoff ──────────────────────────────────────────
const isRetryable = (error) => {
  const config = error.config;
  if (!config) return false;

  // Never replay writes. A POST that timed out may still have been processed,
  // and re-sending it would silently create a duplicate item.
  if (!IDEMPOTENT_METHODS.includes((config.method || "get").toLowerCase())) return false;

  // No response at all — network failure, or a timeout during a cold start.
  if (!error.response) return true;

  // 5xx and 429 are transient; any other 4xx means the request itself is wrong.
  const { status } = error.response;
  return status >= 500 || status === 429;
};

apiClient.interceptors.response.use(
  (response) => {
    setWaking(false);
    return response;
  },
  async (error) => {
    const config = error.config;

    if (!isRetryable(error)) {
      setWaking(false);
      return Promise.reject(error);
    }

    config.__retryCount = (config.__retryCount || 0) + 1;

    if (config.__retryCount > MAX_RETRIES) {
      setWaking(false);
      return Promise.reject(error);
    }

    // A first failure against a sleeping backend is the common case, not an
    // outage — tell the UI to explain itself rather than show an error.
    setWaking(true);

    const backoff = RETRY_BASE_DELAY_MS * 2 ** (config.__retryCount - 1);
    const jitter = Math.random() * 250;
    await new Promise((resolve) => setTimeout(resolve, backoff + jitter));

    return apiClient(config);
  },
);

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
  },
  searchItems: async (query) => {
    const response = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  deleteItem: async (id) => {
    const response = await apiClient.delete(`/items/delete/${id}`);
    return response.data;
  },

  // ========================
  // COLLECTIONS ENDPOINTS
  // ========================
  getCollections: async () => {
    const response = await apiClient.get('/collections');
    return response.data;
  },
  getCollection: async (id) => {
    const response = await apiClient.get(`/collections/${id}`);
    return response.data;
  },
  getCollectionGaps: async (id) => {
    const response = await apiClient.get(`/collections/${id}/gaps`);
    return response.data.data;
  },
  createCollection: async (name, description) => {
    const response = await apiClient.post('/collections', { name, description });
    return response.data;
  },
  deleteCollection: async (id) => {
    const response = await apiClient.delete(`/collections/${id}`);
    return response.data;
  },
  addItemToCollection: async (collectionId, itemId) => {
    const response = await apiClient.post(`/collections/${collectionId}/items`, { itemId });
    return response.data;
  },

  // ========================
  // STATS ENDPOINTS
  // ========================
  getStats: async () => {
    const response = await apiClient.get("/stats");
    return response.data.data;
  },

};

export default itemService;
