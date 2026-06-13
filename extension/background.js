/**
 * background.js — Service Worker
 *
 * Acts as the API layer for the extension.
 *
 * WHY fetch here instead of popup.js?
 * ─────────────────────────────────────────────────────────────────
 * Chrome MV3 service workers share the browser's cookie jar for
 * origins listed in host_permissions. This means the browser will
 * automatically attach the HttpOnly 'token' cookie set by the
 * backend when the user logged in — without any manual cookie access.
 *
 * A popup page (chrome-extension:// origin) cannot send same-site
 * cookies even with withCredentials, because the browser treats
 * chrome-extension:// as a different site. The service worker does
 * not have this limitation when the host is in host_permissions.
 *
 * Backend API:
 *   POST http://localhost:5000/api/items/create
 *   Body: { title: string, url: string, type: "unknown" }
 *   Auth: HttpOnly cookie 'token' (set at login, sent automatically)
 */

// ── CONFIGURATION ────────────────────────────────────────────────────────────
// In production, change to your live API server URL.
const CONFIG = {
  API_BASE: "https://relic-backend-server.onrender.com/api"
};

const API_BASE = CONFIG.API_BASE;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SAVE_ITEM") {
    handleSaveItem(message.payload, message.token).then(sendResponse);
    // Returning true keeps the message channel open for the async response.
    return true;
  }
});

/**
 * Makes the authenticated POST request to create an item.
 * 
 * @param {{ title: string, url: string }} payload
 * @param {string} token
 * @returns {Promise<{ success: boolean, message?: string, status?: number }>}
 */
async function handleSaveItem(payload, token) {
  try {
    if (!token) {
      return {
        success: false,
        status: 401,
        message: "Auth error: Missing token."
      };
    }

    const response = await fetch(`${API_BASE}/items/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title: payload.title,
        url: payload.url,
        type: "unknown", // type field is required by backend; default since UI dropdown was removed
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || `Request failed with status ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message: "Cannot reach the server. Is the backend running?",
    };
  }
}
