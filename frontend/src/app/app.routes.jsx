import {createBrowserRouter} from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <p>Home</p>,
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    }
]);

export default routes