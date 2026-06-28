import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import GameMap from "./pages/GameMap";
import Dashboard from "./pages/Dashboard";
import WorldDetail from "./pages/WorldDetail";
import Achievements from "./pages/Achievements";
import ProgressManager from "./pages/ProgressManager";
import RevisionQueue from "./pages/RevisionQueue";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useGameStore, setFirebaseSaveHandler } from "./store/gameStore";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LoadingScreen from "./components/LoadingScreen";

function FirebaseSync() {
  const { user, progress, progressLoading, saveProgress } = useAuth();
  const syncFromFirebase = useGameStore((s) => s.syncFromFirebase);
  const setFirebaseMode = useGameStore((s) => s.setFirebaseMode);

  useEffect(() => {
    setFirebaseSaveHandler(saveProgress);
  }, [saveProgress]);

  useEffect(() => {
    if (user && progress && !progressLoading) {
      syncFromFirebase(progress);
      setFirebaseMode(true);
    } else if (!user) {
      setFirebaseMode(false);
    }
  }, [user, progress, progressLoading, syncFromFirebase, setFirebaseMode]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const { user, loading } = useAuth();

  const showNav = user;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#070B14]">
      {showNav && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />

          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <GameMap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/world/:worldId"
            element={
              <ProtectedRoute>
                <WorldDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProgressManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/revision"
            element={
              <ProtectedRoute>
                <RevisionQueue />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FirebaseSync />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
