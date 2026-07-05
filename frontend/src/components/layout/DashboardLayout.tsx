import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()

  // Scaffold user state and notifications hook
  // In real implementation, these pull from React Query + AuthContext
  const [user] = useState<{ email: string; full_name?: string } | null>(() => {
    const saved = localStorage.getItem("tripgenie-user")
    return saved ? JSON.parse(saved) : { email: "traveler@tripgenie.ai", full_name: "Genie Traveler" }
  })

  const [notifications, setNotifications] = useState([
    { id: "1", title: "Trip to Paris Planned", message: "Your trip itinerary to Paris is ready to view.", is_read: false },
    { id: "2", title: "Flight Price Drop Alert", message: "Flights to Tokyo have dropped by 12%. Check saved trips.", is_read: false },
    { id: "3", title: "Welcome to TripGenie!", message: "Explore and start building custom itineraries.", is_read: true }
  ])

  const handleLogout = () => {
    localStorage.removeItem("tripgenie-access-token")
    localStorage.removeItem("tripgenie-refresh-token")
    localStorage.removeItem("tripgenie-user")
    navigate("/login")
  }

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, is_read: true } : notif))
    )
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })))
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Panel Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationRead={handleMarkRead}
          onMarkAllNotificationsRead={handleMarkAllRead}
        />

        {/* Content Outlet scroll wrapper */}
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 bg-background/50">
          <Outlet />
        </main>
      </div>

      {/* Backdrop overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 md:hidden transition-opacity"
        />
      )}
    </div>
  )
}
