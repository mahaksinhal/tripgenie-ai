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

import { useState, useEffect } from "react"

// Guard wrapper to redirect unauthenticated requests and perform silent auto-login
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("tripgenie-access-token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      setLoading(false)
      return
    }

    const autoLogin = async () => {
      try {
        const email = "test@example.com"
        const password = "password123"

        // 1. Try login
        const formDetails = new URLSearchParams()
        formDetails.append("username", email)
        formDetails.append("password", password)

        let loginRes = await fetch("/api/v1/auth/login/access-token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formDetails
        })

        // 2. If login fails, try auto-register, then login
        if (!loginRes.ok) {
          const autoReg = await fetch("/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, full_name: "Genie Traveler" })
          })
          if (autoReg.ok) {
            loginRes = await fetch("/api/v1/auth/login/access-token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: formDetails
            })
          }
        }

        if (loginRes.ok) {
          const tokenData = await loginRes.json()
          localStorage.setItem("tripgenie-access-token", tokenData.access_token)
          localStorage.setItem("tripgenie-refresh-token", tokenData.refresh_token)
          localStorage.setItem(
            "tripgenie-user",
            JSON.stringify({ email, full_name: "Genie Traveler" })
          )
          setToken(tokenData.access_token)
        }
      } catch (err) {
        console.error("Auto login failed:", err)
      } finally {
        setLoading(false)
      }
    }

    autoLogin()
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF8A3D] border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-400">Initializing TripGenie OS...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
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
