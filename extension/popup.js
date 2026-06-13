/**
 * popup.js
 * Handles isolated Supabase Auth and save functionality for the extension.
 */

const SUPABASE_URL = "https://pntwssletdrvlkcwoxqp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudHdzc2xldGRydmxrY3dveHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTE2MTEsImV4cCI6MjA5Njc2NzYxMX0.EniBXFzxcrp39hrHIGZulazrwOM3WiPgTMiZiNalbtQ";

// Initialize Supabase Client natively in the extension
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const globalLoading = document.getElementById("global-loading");
const appContent = document.getElementById("app-content");
const mainTitle = document.getElementById("main-title");

// Login View Elements
const loginView = document.getElementById("login-view");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const loginStatus = document.getElementById("login-status");

// Save View Elements
const saveView = document.getElementById("save-view");
const urlInput = document.getElementById("url-input");
const titleInput = document.getElementById("title-input");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");
const saveFooter = document.getElementById("save-footer");
const logoutBtn = document.getElementById("logout-btn");
const openRelicBtn = document.getElementById("open-relic-btn");

let currentTabUrl = "";

const CONFIG = {
  FRONTEND_URL: "https://relic-gamma.vercel.app/",
};
openRelicBtn.href = CONFIG.FRONTEND_URL;

// ── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  
  globalLoading.classList.add("hidden");
  appContent.classList.remove("hidden");

  if (session) {
    showSaveView();
  } else {
    showLoginView();
  }
}

function showLoginView() {
  mainTitle.textContent = "Login to use the Relic extension";
  loginView.classList.remove("hidden");
  saveView.classList.add("hidden");
  saveFooter.classList.add("hidden");
}

function showSaveView() {
  mainTitle.textContent = "Save a resource";
  loginView.classList.add("hidden");
  saveView.classList.remove("hidden");
  saveFooter.classList.remove("hidden");
  initTabUrl();
}

async function initTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabUrl = tab?.url ?? "";
  urlInput.value = currentTabUrl;
  saveBtn.disabled = !currentTabUrl;
}

// ── AUTH HANDLERS ────────────────────────────────────────────────────────────
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    loginStatus.textContent = "PLEASE ENTER EMAIL AND PASSWORD";
    loginStatus.className = "status error";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "LOGGING IN...";
  loginStatus.className = "status hidden";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  loginBtn.disabled = false;
  loginBtn.textContent = "LOGIN →";

  if (error) {
    loginStatus.textContent = error.message.toUpperCase();
    loginStatus.className = "status error";
  } else {
    showSaveView();
  }
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLoginView();
});

// ── SAVE HANDLER ─────────────────────────────────────────────────────────────
function setLoading(isLoading) {
  saveBtn.disabled = isLoading;
  saveBtn.textContent = isLoading ? "SAVING..." : "SAVE TO LIBRARY →";
  if (isLoading) {
    statusEl.textContent = "LOADING";
    statusEl.className = "status loading";
  } else {
    statusEl.className = "status hidden";
  }
}

saveBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();

  if (!url) {
    statusEl.textContent = "PLEASE ENTER A URL.";
    statusEl.className = "status error";
    return;
  }

  setLoading(true);

  // Get fresh token from extension's internal Supabase state
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    setLoading(false);
    statusEl.textContent = "SESSION EXPIRED. PLEASE RELOGIN.";
    statusEl.className = "status error";
    await supabase.auth.signOut();
    showLoginView();
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: "SAVE_ITEM",
    payload: {
      title: title,
      url: url,
    },
    token: session.access_token // Pass token to background.js
  });

  setLoading(false);

  if (response.success) {
    statusEl.textContent = "✓ SAVED SUCCESSFULLY!";
    statusEl.className = "status success";
    titleInput.value = "";
    urlInput.value = "";
  } else {
    statusEl.textContent = response.message || "SOMETHING WENT WRONG. TRY AGAIN.";
    statusEl.className = "status error";
  }
});

// Boot the app
init();
