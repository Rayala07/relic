import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import SavePage from "../features/items/pages/SavePage";
import LibraryPage from "../features/items/pages/LibraryPage";
import ItemDetailPage from "../features/items/pages/ItemDetailPage";
import Navbar from "./components/Navbar";
import SearchPage from "../features/items/pages/SearchPage";

import withAuth from "../features/auth/components/withAuth";
import withGuest from "../features/auth/components/withGuest";

const LayoutWrapper = () => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="min-h-screen bg-[#000000]">
      <Navbar />
      <div className={isAuthPage ? "" : "pt-[72px]"}>
        <Outlet />
      </div>
    </div>
  );
};

// Wrap pages properly
const ProtectedSave = withAuth(SavePage);
const ProtectedLibrary = withAuth(LibraryPage);
const ProtectedItem = withAuth(ItemDetailPage);
const ProtectedSearch = withAuth(SearchPage);
const GuestLogin = withGuest(Login);
const GuestRegister = withGuest(Register);

const routes = createBrowserRouter([
    {
        element: <LayoutWrapper />,
        children: [
            {
                path: "/",
                element: <ProtectedLibrary /> // Map base route to library matching the app scope
            },
            {
                path: "/register",
                element: <GuestRegister />
            },
            {
                path: "/login",
                element: <GuestLogin />
            },
            {
                path: "/save",
                element: <ProtectedSave />
            },
            {
                path: "/library",
                element: <ProtectedLibrary />
            },
            {
                path: "/search",
                element: <ProtectedSearch />
            },
            {
                path: "/items/:id",
                element: <ProtectedItem />
            }
        ]
    }
]);

export default routes;