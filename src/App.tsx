import { createHashRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Tracks from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import Challenge from "./pages/Challenge";
import Rewards from "./pages/Rewards";
import BossArena from "./pages/BossArena";
import Skills from "./pages/Skills";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

// Data router (createHashRouter) — required by useBlocker, which the
// Boss Arena uses to trap players inside an active raid.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      /* Public routes */
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },

      /* Protected routes — redirect to /login if not signed in */
      { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "/leaderboard", element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },
      { path: "/tracks", element: <ProtectedRoute><Tracks /></ProtectedRoute> },
      { path: "/tracks/:slug", element: <ProtectedRoute><TrackDetail /></ProtectedRoute> },
      { path: "/challenge/:id", element: <ProtectedRoute><Challenge /></ProtectedRoute> },
      { path: "/rewards", element: <ProtectedRoute><Rewards /></ProtectedRoute> },
      { path: "/boss", element: <ProtectedRoute><BossArena /></ProtectedRoute> },
      { path: "/skills", element: <ProtectedRoute><Skills /></ProtectedRoute> },
      { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "/user/:login", element: <ProtectedRoute><UserProfile /></ProtectedRoute> },
      { path: "/settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },

      /* Fallback */
      { path: "*", element: <Home /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
