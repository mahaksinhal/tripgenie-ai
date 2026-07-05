import { NavLink } from "react-router-dom"
import { LayoutDashboard, Compass, MessageSquare, Bookmark, Settings, User, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ isOpen, isCollapsed, onToggleCollapse }: SidebarProps) {
  const navItems = [
    { name: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
    { name: "My Trips", to: "/app/trips", icon: Compass },
    { name: "AI Optimizer", to: "/app/optimizer", icon: Sparkles },
    { name: "Genie Chat", to: "/app/chat", icon: MessageSquare },
    { name: "Saved Trips", to: "/app/saved", icon: Bookmark },
    { name: "Profile", to: "/app/profile", icon: User },
    { name: "Settings", to: "/app/settings", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 md:sticky",
        // Mobile toggle
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        // Width toggle based on collapsed state
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Brand / Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              TripGenie
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-border bg-popover hover:bg-accent text-foreground transition-colors"
          aria-label="Collapse sidebar"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>{item.name}</span>}
            
            {/* Tooltip on collapse */}
            {isCollapsed && (
              <span className="absolute left-16 rounded-md bg-popover border border-border px-2 py-1 text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap shadow-md z-50">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer info (only on expanded) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground font-medium">TripGenie Platform v1.0</p>
          <p className="text-[9px] text-muted-foreground/75">© 2026 TripGenie Inc.</p>
        </div>
      )}
    </aside>
  )
}
