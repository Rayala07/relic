import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app/App"
import { Provider } from "react-redux"
import store from "./app/store"
import { ThemeProvider } from "./components/theme-provider.jsx"
import { AuthProvider } from "./features/auth/components/AuthProvider.jsx"
import { warmBackend } from "./features/items/services/item.service.js"

// Fired before React mounts. The static bundle paints immediately while the
// free-tier backend spins up in the background, so it is usually awake by the
// time the visitor actually navigates somewhere that needs it.
warmBackend()

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)