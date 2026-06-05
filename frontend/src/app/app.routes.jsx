import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import SavePage from "../features/items/pages/SavePage";
import LibraryPage from "../features/items/pages/LibraryPage";
import ItemDetailPage from "../features/items/pages/ItemDetailPage";
import Navbar from "./components/Navbar";
import SearchPage from "../features/items/pages/SearchPage";
import HomePage from "./pages/HomePage";
import CollectionListPage from "../features/collections/pages/CollectionListPage";
import CollectionDetailPage from "../features/collections/pages/CollectionDetailPage";

import withAuth from "../features/auth/components/withAuth";
import withGuest from "../features/auth/components/withGuest";

const LayoutWrapper = () => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="min-h-screen bg-background">
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
const ProtectedCollectionsList = withAuth(CollectionListPage);
const ProtectedCollectionDetail = withAuth(CollectionDetailPage);
const GuestLogin = withGuest(Login);
const GuestRegister = withGuest(Register);

const routes = createBrowserRouter([
    {
        element: <LayoutWrapper />,
        children: [
            {
                path: "/",
                element: <HomePage />
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
            },
            {
                path: "/collections",
                element: <ProtectedCollectionsList />
            },
            {
                path: "/collections/:id",
                element: <ProtectedCollectionDetail />
            },
        ]
    }
]);

export default routes;