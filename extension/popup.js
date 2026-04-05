/**
 * popup.js
 *
 * Responsibilities:
 * 1. Capture the active tab URL and display it.
 * 2. Handle form submission by sending a message to background.js.
 * 3. Reflect loading / success / error states in the UI.
 */

const openRelicBtn = document.getElementById("open-relic-btn");
const titleInput = document.getElementById("title-input");
const urlInput = document.getElementById("url-input");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");

let currentTabUrl = "";

// ── CONFIGURATION ────────────────────────────────────────────────────────────
// In production, change these to your live server URLs.
const CONFIG = {
  FRONTEND_URL: "http://localhost:5173",
};

openRelicBtn.href = CONFIG.FRONTEND_URL;

// ── 1. Capture active tab URL ────────────────────────────────────────────────
async function initTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabUrl = tab?.url ?? "";
  urlInput.value = currentTabUrl;
  saveBtn.disabled = !currentTabUrl;
}

initTabUrl();

// ── 2. UI helpers ────────────────────────────────────────────────────────────
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function setLoading(isLoading) {
  saveBtn.disabled = isLoading;
  saveBtn.textContent = isLoading ? "SAVING..." : "SAVE";
  if (isLoading) {
    showStatus("LOADING", "loading");
  } else {
    statusEl.className = "status hidden";
  }
}

// ── 3. Save handler ──────────────────────────────────────────────────────────
saveBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();

  if (!title) {
    showStatus("PLEASE ENTER A TITLE.", "error");
    return;
  }

  if (!url) {
    showStatus("PLEASE ENTER A URL.", "error");
    return;
  }

  setLoading(true);

  const response = await chrome.runtime.sendMessage({
    type: "SAVE_ITEM",
    payload: {
      title: title,
      url: url,
    },
  });

  setLoading(false);

  if (response.success) {
    showStatus("✓ SAVED SUCCESSFULLY!", "success");
    titleInput.value = "";
    urlInput.value = "";
  } else {
    const isAuthError =
      response.status === 401 ||
      (response.message && response.message.toLowerCase().includes("auth"));
    showStatus(
      isAuthError
        ? "PLEASE LOG IN ON THE WEBSITE FIRST."
        : response.message || "SOMETHING WENT WRONG. TRY AGAIN.",
      "error"
    );
  }
});
