import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Tracks from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import Challenge from "./pages/Challenge";
import Rewards from "./pages/Rewards";
import Skills from "./pages/Skills";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes — redirect to /login if not signed in */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/tracks" element={<ProtectedRoute><Tracks /></ProtectedRoute>} />
        <Route path="/tracks/:slug" element={<ProtectedRoute><TrackDetail /></ProtectedRoute>} />
        <Route path="/challenge/:id" element={<ProtectedRoute><Challenge /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/user/:login" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}
