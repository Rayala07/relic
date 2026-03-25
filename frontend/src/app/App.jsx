import "./index.css"
import { RouterProvider } from "react-router-dom"
import routes from "./app.routes"

const App = () => {
  return (
    <RouterProvider router={routes} />
  )
}

export default App