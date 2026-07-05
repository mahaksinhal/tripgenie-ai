import { Navigate, Route, Routes } from "react-router-dom"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Dashboard } from "../pages/Dashboard"
import { Trips } from "../pages/Trips"
import { Chat } from "../pages/Chat"
import { SavedTrips } from "../pages/SavedTrips"
import { Profile } from "../pages/Profile"
import { Settings } from "../pages/Settings"
import { Login } from "../pages/Login"
import { TripWizard } from "../pages/TripWizard"
import { Optimizer } from "../pages/Optimizer"
import { Landing } from "../pages/Landing"

// Guard wrapper to redirect unauthenticated requests
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem("tripgenie-access-token")
  
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Authenticated Dashboard Shell Nested Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="trips" element={<Trips />} />
        <Route path="chat" element={<Chat />} />
        <Route path="saved" element={<SavedTrips />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="plan-trip" element={<TripWizard />} />
        <Route path="optimizer" element={<Optimizer />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default AppRoutes
