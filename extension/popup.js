/**
 * popup.js
 *
 * Responsibilities:
 * 1. Capture the active tab URL and display it.
 * 2. Handle form submission by sending a message to background.js.
 *    (Background service worker makes the actual fetch so the browser
 *     automatically attaches the HttpOnly 'token' cookie via the
 *     extension's host_permissions grant — no manual cookie handling.)
 * 3. Reflect loading / success / error states in the UI.
 */

const titleInput = document.getElementById("title");
const urlText = document.getElementById("url-text");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");

let currentTabUrl = "";

// ── 1. Capture active tab URL ────────────────────────────────────────────────
async function initTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabUrl = tab?.url ?? "";
  urlText.textContent = currentTabUrl || "Unable to read URL";
  saveBtn.disabled = false;
}

initTabUrl();

// ── 2. UI helpers ────────────────────────────────────────────────────────────
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function setLoading(isLoading) {
  saveBtn.disabled = isLoading;
  saveBtn.textContent = isLoading ? "Saving..." : "Save";
}

// ── 3. Save handler ──────────────────────────────────────────────────────────
saveBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();

  if (!title) {
    showStatus("Please enter a title.", "error");
    return;
  }

  if (!currentTabUrl) {
    showStatus("Could not capture current tab URL.", "error");
    return;
  }

  setLoading(true);
  statusEl.className = "status hidden";

  // Delegate the API call to background.js (service worker).
  // The service worker's fetch inherits the browser cookie jar for the target
  // origin, so the HttpOnly 'token' cookie is sent automatically.
  const response = await chrome.runtime.sendMessage({
    type: "SAVE_ITEM",
    payload: {
      title,
      url: currentTabUrl,
    },
  });

  setLoading(false);

  if (response.success) {
    showStatus("✓ Saved successfully!", "success");
    titleInput.value = "";
  } else {
    // 401 → user is not logged in on the main site
    const isAuthError =
      response.status === 401 ||
      (response.message && response.message.toLowerCase().includes("auth"));
    showStatus(
      isAuthError
        ? "Please log in on the website first."
        : response.message || "Something went wrong. Try again.",
      "error"
    );
  }
});
