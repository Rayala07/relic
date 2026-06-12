import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app/App"
import { Provider } from "react-redux"
import store from "./app/store"
import { ThemeProvider } from "./components/theme-provider.jsx"
import { AuthProvider } from "./features/auth/components/AuthProvider.jsx"

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