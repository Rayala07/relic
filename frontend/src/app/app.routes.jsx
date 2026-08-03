import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import SavePage, { SavePageSkeleton } from "../features/items/pages/SavePage";
import LibraryPage, { LibraryPageSkeleton } from "../features/items/pages/LibraryPage";
import ItemDetailPage from "../features/items/pages/ItemDetailPage";
import Navbar from "./components/Navbar";
import SearchPage from "../features/items/pages/SearchPage";
import HomePage from "./pages/HomePage";
import CollectionListPage, { CollectionListPageSkeleton } from "../features/collections/pages/CollectionListPage";
import CollectionDetailPage, { CollectionDetailPageSkeleton } from "../features/collections/pages/CollectionDetailPage";

import BackendWakingNotice from "../components/ui/BackendWakingNotice";

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
      {/* Cross-cutting: a cold start can hit any route, so it lives in the shell */}
      <BackendWakingNotice />
    </div>
  );
};

// Wrap pages properly
const ProtectedSave = withAuth(SavePage, SavePageSkeleton);
const ProtectedLibrary = withAuth(LibraryPage, LibraryPageSkeleton);
const ProtectedItem = withAuth(ItemDetailPage);
const ProtectedSearch = withAuth(SearchPage);
const ProtectedCollectionsList = withAuth(CollectionListPage, CollectionListPageSkeleton);
const ProtectedCollectionDetail = withAuth(CollectionDetailPage, CollectionDetailPageSkeleton);
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