import { Sun, Moon, Laptop } from "lucide-react"
import { useTheme } from "./theme-provider"
import { useState, useRef, useEffect } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent text-foreground hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
        {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
        {theme === "system" && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-black/5 z-50">
          <button
            onClick={() => {
              setTheme("light")
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              setTheme("dark")
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => {
              setTheme("system")
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Laptop className="h-4 w-4" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  )
}
