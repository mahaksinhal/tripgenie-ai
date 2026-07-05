import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { api } from "@/services/api"
import { 
  MessageSquare, Send, Sparkles, Plus, Trash2, Loader2,
  DollarSign, Hotel, Train, BookOpen, Beer, RefreshCw, Compass
} from "lucide-react"

interface Message {
  id: string
  sender: "user" | "assistant"
  content: string
  created_at: string
}

interface Conversation {
  id: string
  title: string
  trip_id: string | null
  updated_at: string
}

interface TripData {
  id: string
  title: string
  destination: string
}

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [trips, setTrips] = useState<TripData[]>([])
  
  const [inputText, setInputText] = useState("")
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations and trips on mount
  const fetchInitialData = async () => {
    setIsLoadingList(true)
    try {
      const [convRes, tripsRes] = await Promise.all([
        api.get("/conversations"),
        api.get("/trip")
      ])
      setConversations(convRes.data)
      setTrips(tripsRes.data)
      if (convRes.data.length > 0) {
        setActiveConvId(convRes.data[0].id)
      }
    } catch (e) {
      console.error("Failed to load initial advisor data:", e)
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([])
      return
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const res = await api.get(`/conversations/${activeConvId}`)
        setMessages(res.data.messages || [])
      } catch (err) {
        console.error("Failed to load conversation messages:", err)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [activeConvId])

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send message
  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim()
    if (!text || !activeConvId || isSending) return

    setIsSending(true)
    setInputText("")

    try {
      // 1. Post User message
      const res = await api.post(`/conversations/${activeConvId}/messages`, {
        sender: "user",
        content: text
      })
      
      // Append user message immediately
      setMessages(prev => [...prev, res.data])

      // 2. Fetch updated messages to retrieve assistant response
      setTimeout(async () => {
        try {
          const detailRes = await api.get(`/conversations/${activeConvId}`)
          setMessages(detailRes.data.messages || [])
        } catch (e) {
          console.error("Failed to sync assistant reply:", e)
        } finally {
          setIsSending(false)
        }
      }, 1200)

    } catch (e) {
      console.error("Failed to post message:", e)
      setIsSending(false)
    }
  }

  // Create new conversation linked to trip
  const handleNewConversation = async (tripId?: string, tripTitle?: string) => {
    try {
      const title = tripTitle ? `Chat for ${tripTitle}` : "New Trip Conversation"
      const res = await api.post("/conversations", {
        title,
        trip_id: tripId || null
      })
      setConversations(prev => [res.data, ...prev])
      setActiveConvId(res.data.id)
    } catch (e) {
      console.error("Failed to start conversation:", e)
    }
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.delete(`/conversations/${id}`)
      const updated = conversations.filter(c => c.id !== id)
      setConversations(updated)
      if (activeConvId === id) {
        setActiveConvId(updated.length > 0 ? updated[0].id : null)
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err)
    }
  }

  // Quick prompt presets
  const chatSuggestions = [
    { text: "Make it cheaper", icon: <DollarSign className="h-3.5 w-3.5" /> },
    { text: "Upgrade hotels", icon: <Hotel className="h-3.5 w-3.5" /> },
    { text: "Switch to train", icon: <Train className="h-3.5 w-3.5" /> },
    { text: "Replace museums", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { text: "Add nightlife", icon: <Beer className="h-3.5 w-3.5" /> },
    { text: "Regenerate Day 3", icon: <RefreshCw className="h-3.5 w-3.5" /> }
  ]

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 overflow-hidden shadow-md">
      
      {/* Sidebar - Threads list */}
      <div className="w-1/3 border-r border-slate-200/60 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/30 max-w-xs md:max-w-sm">
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight text-slate-700 dark:text-slate-300">Advisor Sessions</span>
          <Button size="icon" variant="outline" className="h-8 w-8 border-slate-200" onClick={() => handleNewConversation()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center h-44 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#0F4C81] dark:text-[#4FC3F7]" />
              <span className="text-xs">Loading sessions...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground space-y-4 flex flex-col items-center justify-center min-h-[220px]">
              <MessageSquare className="h-8 w-8 text-[#0F4C81] dark:text-[#4FC3F7] animate-bounce" />
              <p className="font-bold text-slate-600 dark:text-slate-400">No active sessions found</p>
              <Button 
                size="sm" 
                className="bg-[#0F4C81] hover:bg-[#0c3e69] text-white font-semibold rounded-xl text-xs py-2 px-4 shadow hover-scale"
                onClick={() => handleNewConversation()}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Start Chat Session
              </Button>
              {trips.length > 0 && (
                <div className="space-y-1.5 pt-4 w-full border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] uppercase tracking-wider block font-bold text-[#FF8A3D] mb-1">Or chat about planned trips</span>
                  {trips.slice(0, 3).map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleNewConversation(t.id, t.title)}
                      className="w-full text-left p-2 border border-slate-200/60 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 truncate cursor-pointer transition-all"
                    >
                      Trip to {t.destination}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors text-sm font-semibold ${
                  activeConvId === conv.id 
                    ? "bg-[#0F4C81] text-white" 
                    : "hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate font-bold">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className={`bg-transparent border-0 p-1.5 rounded-md transition-colors cursor-pointer ${
                    activeConvId === conv.id ? "text-white/75 hover:bg-white/10" : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  }`}
                  aria-label="Delete thread"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat viewport */}
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/10">
        
        {/* Active conversation title header */}
        <div className="h-14 px-6 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FF8A3D] animate-pulse" />
            <h2 className="font-black text-sm text-slate-800 dark:text-white">
              {conversations.find(c => c.id === activeConvId)?.title || "Genie AI Workspace"}
            </h2>
          </div>
          {activeConvId && conversations.find(c => c.id === activeConvId)?.trip_id && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Compass className="h-3 w-3" /> Linked to Itinerary
            </span>
          )}
        </div>

        {/* Chat message bubbles scroll window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#0F4C81]" />
              <span className="text-xs">Fetching conversation history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10 text-center space-y-2 max-w-sm mx-auto">
              <Sparkles className="h-8 w-8 text-[#FF8A3D] animate-pulse" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">AI Travel Assistant Active</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Issue commands to modify budget caps, change transit methods, swap activities, or upgrade hotels. Your itinerary will automatically compile and adjust.
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 shadow-sm text-sm border font-semibold ${
                    msg.sender === "user"
                      ? "bg-[#0F4C81] text-white border-[#0F4C81] rounded-tr-none"
                      : "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap font-bold">{msg.content}</p>
                  <span className="block text-[9px] mt-2 text-right opacity-60 font-bold uppercase tracking-wider">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-500 rounded-2xl rounded-tl-none p-3.5 text-sm flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0F4C81] dark:text-[#4FC3F7]" />
                <span className="font-bold text-xs animate-pulse">Genie Agent is rewriting itinerary...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion presets panel */}
        {activeConvId && (
          <div className="px-4 py-2 border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-wrap gap-1.5">
            {chatSuggestions.map(sug => (
              <Button
                key={sug.text}
                variant="outline"
                size="sm"
                disabled={isSending}
                onClick={() => handleSend(sug.text)}
                className="flex items-center gap-1 text-[11px] h-7 px-2.5 font-bold hover:bg-slate-100 hover-scale border-slate-200"
              >
                {sug.icon}
                <span>{sug.text}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Text Input Footer Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(inputText)
          }} 
          className="p-4 border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 flex gap-3"
        >
          <Input
            placeholder={
              activeConvId 
                ? "Instruct: 'upgrade hotels', 'make it cheaper', or custom requests..."
                : "Select or create an advisor session to begin"
            }
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            disabled={!activeConvId || isSending}
            className="flex-1 border-slate-200/60 focus-visible:ring-[#0F4C81] font-bold text-slate-700 dark:text-slate-200 rounded-xl"
          />
          <Button type="submit" size="icon" disabled={!activeConvId || isSending || !inputText.trim()} className="bg-[#FF8A3D] hover:bg-[#ff7b24] text-white font-bold hover-scale shadow">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
      </div>
    </div>
  )
}
export default Chat
