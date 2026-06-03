import ReactDOM from "react-dom/client"
import App from "./app/App"
import { Provider } from "react-redux"
import store from "./app/store"
import { ClerkProvider } from "@clerk/clerk-react"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.querySelector("#root")).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <Provider store={store}>
      <App />
    </Provider>
  </ClerkProvider>
)