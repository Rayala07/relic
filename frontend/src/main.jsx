import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app/App"
import { Provider } from "react-redux"
import store from "./app/store"
import { ClerkProvider } from "@clerk/clerk-react"
import { ThemeProvider } from "./components/theme-provider.jsx"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <Provider store={store}>
          <App />
        </Provider>
      </ClerkProvider>
    </ThemeProvider>
  </React.StrictMode>
)