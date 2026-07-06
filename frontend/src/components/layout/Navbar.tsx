import { useState, useRef, useEffect } from "react"
import { Bell, User, Settings, Menu } from "lucide-react"
import { ThemeToggle } from "../theme/theme-toggle"

import { Link } from "react-router-dom"

interface NavbarProps {
  onToggleSidebar: () => void
  user: { full_name?: string; email: string } | null
  notifications: Array<{ id: string; title: string; message: string; is_read: boolean }>
  onMarkNotificationRead: (id: string) => void
  onMarkAllNotificationsRead: () => void
}

export function Navbar({
  onToggleSidebar,
  user,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent text-foreground hover:bg-accent md:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            TripGenie AI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent text-foreground hover:bg-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-xs text-primary hover:underline font-medium bg-transparent border-0 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto p-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`flex flex-col gap-0.5 rounded-sm px-3 py-2 text-left text-sm cursor-pointer hover:bg-accent transition-colors ${
                        !notif.is_read ? "bg-accent/40 font-medium" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {notif.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            aria-label="Profile menu"
          >
            <User className="h-5 w-5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-black/5 z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-semibold truncate">
                  {user?.full_name || "TripGenie Traveler"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "traveler@tripgenie.ai"}
                </p>
              </div>
              <div className="p-1">
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                {/* Log out removed for open-access */}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
