import {createBrowserRouter} from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import SavePage from "../features/items/pages/SavePage";
import LibraryPage from "../features/items/pages/LibraryPage";
import ItemDetailPage from "../features/items/pages/ItemDetailPage";

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
    },
    {
        path: "/save",
        element: <SavePage />
    },
    {
        path: "/library",
        element: <LibraryPage />
    },
    {
        path: "/items/:id",
        element: <ItemDetailPage />
    }
]);

export default routes