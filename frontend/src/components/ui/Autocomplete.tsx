import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "./Input"
import { cn } from "@/lib/utils"

export interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggestions?: string[]
  className?: string
}

const DEFAULT_CITIES = [
  "New York, USA", "Los Angeles, USA", "Chicago, USA", "London, UK", "Paris, France",
  "Tokyo, Japan", "Kyoto, Japan", "Osaka, Japan", "Rome, Italy", "Florence, Italy",
  "Venice, Italy", "Milan, Italy", "Barcelona, Spain", "Madrid, Spain", "Berlin, Germany",
  "Munich, Germany", "Sydney, Australia", "Melbourne, Australia", "Singapore, Singapore",
  "Hong Kong, China", "Bangkok, Thailand", "Phuket, Thailand", "Bali, Indonesia",
  "Male, Maldives", "Dubai, UAE", "Cairo, Egypt", "Cape Town, South Africa",
  "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada", "Rio de Janeiro, Brazil",
  "Buenos Aires, Argentina", "Mumbai, India", "New Delhi, India", "Seoul, South Korea",
  "Amsterdam, Netherlands", "Vienna, Austria", "Prague, Czech Republic", "Budapest, Hungary",
  "Athens, Greece", "Santorini, Greece", "Lisbon, Portugal", "Istanbul, Turkey",
  "Zurich, Switzerland", "Geneva, Switzerland", "Reykjavik, Iceland", "Dublin, Ireland",
  "Stockholm, Sweden", "Copenhagen, Denmark", "Oslo, Norway", "Helsinki, Finland"
]

export function Autocomplete({
  value,
  onChange,
  placeholder = "Search cities...",
  suggestions = DEFAULT_CITIES,
  className
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [filtered, setFiltered] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep input value in sync with prop updates
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    onChange(val)

    if (val.trim().length > 0) {
      const matched = suggestions.filter(item =>
        item.toLowerCase().includes(val.toLowerCase())
      )
      setFiltered(matched)
      setIsOpen(true)
    } else {
      setFiltered([])
      setIsOpen(false)
    }
    setActiveIndex(-1)
  }

  const handleSelect = (selected: string) => {
    setInputValue(selected)
    onChange(selected)
    setFiltered([])
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1 < filtered.length ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        handleSelect(filtered[activeIndex])
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (inputValue.trim().length > 0) {
            const matched = suggestions.filter(item =>
              item.toLowerCase().includes(inputValue.toLowerCase())
            )
            setFiltered(matched)
            setIsOpen(true)
          }
        }}
      />
      
      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg z-50">
          {filtered.map((item, index) => (
            <li
              key={item}
              onClick={() => handleSelect(item)}
              className={cn(
                "cursor-pointer rounded-sm px-2 py-1.5 text-sm select-none transition-colors",
                index === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
