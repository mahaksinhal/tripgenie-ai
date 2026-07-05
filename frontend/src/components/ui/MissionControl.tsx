import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Compass, CloudSun, Plane, Hotel, Utensils, Sparkles, 
  DollarSign, Briefcase, ShieldAlert, Cpu, CheckCircle2, 
  Loader2, Terminal, AlertCircle
} from "lucide-react"

// Types
interface AgentData {
  id: string
  name: string
  icon: any
  status: "idle" | "running" | "success" | "error"
  task: string
  elapsed: number
  progress: number
}

interface MissionControlProps {
  formData: any
  onComplete: (tripId: string) => void
  onCancel: () => void
}

const AGENTS_LIST: Omit<AgentData, "status" | "task" | "elapsed" | "progress">[] = [
  { id: "planner", name: "Planner Agent", icon: Compass },
  { id: "weather", name: "Weather Agent", icon: CloudSun },
  { id: "flight", name: "Flight Agent", icon: Plane },
  { id: "hotel", name: "Hotel Agent", icon: Hotel },
  { id: "restaurant", name: "Restaurant Agent", icon: Utensils },
  { id: "experience", name: "Experience Agent", icon: Sparkles },
  { id: "budget", name: "Budget Agent", icon: DollarSign },
  { id: "packing", name: "Packing Agent", icon: Briefcase },
  { id: "visa", name: "Visa Agent", icon: ShieldAlert }
]

export function MissionControl({ formData, onComplete, onCancel }: MissionControlProps) {
  const [agents, setAgents] = useState<AgentData[]>(
    AGENTS_LIST.map(a => ({
      ...a,
      status: "idle",
      task: "Waiting to initiate...",
      elapsed: 0.0,
      progress: 0
    }))
  )
  const [logs, setLogs] = useState<string[]>([])
  const [globalElapsed, setGlobalElapsed] = useState(0.0)
  const [streamError, setStreamError] = useState<string | null>(null)
  
  const terminalEndRef = useRef<HTMLDivElement>(null)

  // Start global timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalElapsed(prev => prev + 0.1)
    }, 100)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll terminal log feed
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // Establish SSE connection
  useEffect(() => {
    const token = localStorage.getItem("tripgenie-access-token")
    const controller = new AbortController()
    
    async function readStream() {
      try {
        const response = await fetch("/api/v1/trip/generate-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(formData),
          signal: controller.signal
        })

        if (response.status === 401 || response.status === 403 || response.status === 404) {
          let triggerEviction = response.status !== 404;
          if (response.status === 404) {
            try {
              const clone = response.clone();
              const body = await clone.json();
              if (body?.detail === "User not found") {
                triggerEviction = true;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }

          if (triggerEviction) {
            localStorage.removeItem("tripgenie-access-token")
            localStorage.removeItem("tripgenie-refresh-token")
            localStorage.removeItem("tripgenie-user")
            window.location.href = "/login?error=Session expired. Please log in again."
            return;
          }
        }

        if (!response.ok) {
          throw new Error("HTTP connection failed. Check backend credentials.")
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("Stream reader not supported.")

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const rawData = line.substring(6)
              try {
                const parsed = JSON.parse(rawData)
                
                // Handle complete redirect
                if (parsed.event === "complete") {
                  setLogs(prev => [...prev, `[System]: Multi-agent compilation finished. Storing Trip ID: ${parsed.trip_id}`])
                  setTimeout(() => {
                    onComplete(parsed.trip_id)
                  }, 1200)
                  continue
                }

                // Handle system errors
                if (parsed.event === "error") {
                  setStreamError(parsed.message)
                  setLogs(prev => [...prev, `[Error]: ${parsed.message}`])
                  continue
                }

                // Update agent state cards
                const { agent, status, message, elapsed } = parsed
                setAgents(prev => prev.map(a => {
                  if (a.id === agent) {
                    let progress = 0
                    if (status === "running") progress = 45
                    else if (status === "success") progress = 100
                    
                    return {
                      ...a,
                      status,
                      task: message,
                      elapsed: parseFloat(elapsed.toFixed(1)),
                      progress
                    }
                  }
                  return a
                }))

                // Add log message
                setLogs(prev => [...prev, `[${agent.toUpperCase()}]: ${message} (${elapsed.toFixed(1)}s)`])

              } catch (e) {
                // Parsing error
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setStreamError(err.message || "Failed to establish SSE stream.")
        }
      }
    }

    readStream()

    return () => {
      controller.abort()
    }
  }, [formData])

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4FC3F7]/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#0F4C81] dark:text-[#4FC3F7] animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A3D]">Live Synthesis Engine</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">AI Mission Control</h2>
          <p className="text-xs text-slate-500 font-semibold">
            Coordinating parallel reasoning chains to structure itinerary, flights, and activities.
          </p>
        </div>

        <div className="flex items-center gap-4 z-10">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Elapsed Time</span>
            <span className="font-mono text-xl font-bold tracking-tight text-[#FF8A3D]">
              {globalElapsed.toFixed(1)}s
            </span>
          </div>
          <button 
            onClick={onCancel}
            className="rounded-xl border border-slate-200 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 cursor-pointer transition-colors"
          >
            Cancel Execution
          </button>
        </div>
      </div>

      {streamError && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>Error compiling: {streamError}</span>
        </div>
      )}

      {/* Agents Card Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const Icon = agent.icon
          
          return (
            <motion.div
              key={agent.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative overflow-hidden rounded-2xl border p-5 bg-white dark:bg-slate-800 transition-all duration-300 shadow-sm ${
                agent.status === "running"
                  ? "border-[#4FC3F7] shadow-md ring-1 ring-[#4FC3F7]/30"
                  : agent.status === "success"
                  ? "border-green-500/30 bg-green-500/[0.02]"
                  : "border-slate-200/60 dark:border-slate-800"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${
                    agent.status === "running"
                      ? "bg-[#0F4C81]/15 text-[#0F4C81] dark:text-[#4FC3F7]"
                      : agent.status === "success"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">{agent.name}</h4>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      elapsed: {agent.elapsed}s
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                {agent.status === "running" ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#FF8A3D] animate-pulse bg-[#FF8A3D]/10 px-2 py-0.5 rounded-full">
                    <Loader2 className="h-3 w-3 animate-spin" /> Active
                  </span>
                ) : agent.status === "success" ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    Idle
                  </span>
                )}
              </div>

              {/* Task Details text */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 line-clamp-2 h-8 font-semibold">
                {agent.task}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.progress}%` }}
                  transition={{ type: "spring", stiffness: 60 }}
                  className={`h-full rounded-full ${
                    agent.status === "success" ? "bg-green-500" : "bg-gradient-to-r from-[#FF8A3D] to-[#4FC3F7]"
                  }`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Terminal logs monitor */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono font-bold">
          <Terminal className="h-3.5 w-3.5 text-[#0F4C81] dark:text-[#4FC3F7]" />
          <span>TripGenie Output Console</span>
        </div>
        <div className="p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1.5 scrollbar-thin text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2 font-medium">
              <span className="text-slate-400 select-none">[{index + 1}]</span>
              <span>{log}</span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>

    </div>
  )
}
export default MissionControl
