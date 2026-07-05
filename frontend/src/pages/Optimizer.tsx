import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { api } from "@/services/api"
import { 
  Sparkles, DollarSign, IndianRupee, Compass, Leaf, Coins, Loader2,
  TrendingDown, AlertTriangle, CloudSun, Calendar,
  Briefcase, Camera, ShieldAlert, Trash2,
  HeartPulse, Navigation, Users, MapPin
} from "lucide-react"

interface TripData {
  id: string
  title: string
  destination: string
  source_city: string
  budget: number
  currency: string
}

interface Expense {
  id: string
  category: string
  amount: number
  description: string
}

export function Optimizer() {
  const [trips, setTrips] = useState<TripData[]>([])
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Tab control: "financials", "logistics", "insights", "kit"
  const [activeHub, setActiveHub] = useState("financials")

  // 1. Cost Optimizer slider state
  const [savingsLevel, setSavingsLevel] = useState(20) // % savings slider

  // 4. Currency Converter state
  const [usdAmount, setUsdAmount] = useState("100")
  const [targetCurrency, setTargetCurrency] = useState("INR")
  const exchangeRates: Record<string, number> = { INR: 83.5, EUR: 0.92, JPY: 158.4, GBP: 0.78, CAD: 1.36 }

  // 13. Expense Tracker state
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", category: "Flights", amount: 450, description: "EcoAir ticket booking" },
    { id: "2", category: "Hotels", amount: 320, description: "Grand Plaza lodging stay" }
  ])
  const [expCategory, setExpCategory] = useState("Food")
  const [expAmount, setExpAmount] = useState("")
  const [expDesc, setExpDesc] = useState("")

  // Packing checklist state (7. Packing Assistant)
  const [packList, setPackList] = useState([
    { text: "Universal Plug Adapter", category: "Electronics", checked: true },
    { text: "Waterproof outer shell", category: "Clothing", checked: false },
    { text: "Noise-cancelling headphones", category: "Leisure", checked: false },
    { text: "Mini first-aid kit", category: "Safety", checked: true }
  ])

  // Fetch trips on mount
  const fetchTrips = async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/trip")
      setTrips(res.data)
      if (res.data.length > 0) {
        setActiveTrip(res.data[0])
      }
    } catch (e) {
      console.error("Failed to load optimizer trips:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  // Expense management
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!expAmount || !expDesc.trim()) return
    const newExp: Expense = {
      id: Date.now().toString(),
      category: expCategory,
      amount: Number(expAmount) || 0,
      description: expDesc
    }
    setExpenses([...expenses, newExp])
    setExpAmount("")
    setExpDesc("")
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id))
  }

  // Calculations
  const convertedValue = (Number(usdAmount) || 0) * (exchangeRates[targetCurrency] || 1)
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
  const tripBudget = activeTrip?.budget || 2000
  const budgetPercent = Math.min(Math.round((totalExpenses / tripBudget) * 100), 100)
  
  // Cost Optimizer estimates
  const optimizedStaysSavings = Math.round(tripBudget * 0.40 * (savingsLevel / 100))
  const optimizedFlightSavings = Math.round(tripBudget * 0.35 * (savingsLevel / 100))
  const totalSavings = optimizedStaysSavings + optimizedFlightSavings

  // Render Loading
  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground">Opening optimizer workspace...</span>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-20">
        <Compass className="h-12 w-12 text-primary animate-pulse mx-auto" />
        <h2 className="text-2xl font-bold tracking-tight">No Active Trips Found</h2>
        <p className="text-muted-foreground text-sm">
          Please create a planned trip inside the travel wizard before configuring optimizer modules.
        </p>
      </div>
    )
  }

  const trip = activeTrip || trips[0]

  return (
    <div className="space-y-6">
      
      {/* Selector cover widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20 text-primary">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">AI Travel Optimizer</span>
            <select
              value={trip.id}
              onChange={(e) => {
                const selected = trips.find(t => t.id === e.target.value)
                if (selected) setActiveTrip(selected)
              }}
              className="block font-black text-lg bg-transparent border-none text-foreground focus:ring-0 cursor-pointer p-0 select-none"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id} className="bg-popover text-foreground text-sm font-semibold">
                  {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab hub controller */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: "financials", label: "Finance & Cost" },
            { id: "logistics", label: "Routing & Carbon" },
            { id: "insights", label: "Local Insights" },
            { id: "kit", label: "Travel Kit" }
          ].map((hub) => (
            <button
              key={hub.id}
              onClick={() => setActiveHub(hub.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeHub === hub.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {hub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized AI modules */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeHub}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid gap-4 md:grid-cols-2"
        >
          
          {/* HUB 1: Financials Hub */}
          {activeHub === "financials" && (
            <>
              {/* Tool 1: Cost Optimizer */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Cost Optimizer</span>
                    <TrendingDown className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold flex justify-between">
                      <span>Target Budget Savings</span>
                      <span className="text-primary font-bold">{savingsLevel}%</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={savingsLevel}
                      onChange={(e) => setSavingsLevel(Number(e.target.value))}
                      className="w-full accent-primary bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] font-bold text-primary uppercase">Estimated Savings</span>
                    <div className="grid grid-cols-2 text-xs font-semibold text-muted-foreground gap-2">
                      <p>Stay Offsets: <span className="text-foreground font-bold">{trip.currency} {optimizedStaysSavings}</span></p>
                      <p>Flight Offsets: <span className="text-foreground font-bold">{trip.currency} {optimizedFlightSavings}</span></p>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                      <strong>AI Tip:</strong> Shifting flights by 1 day and choosing stays 3 blocks away saves an estimated <strong>{trip.currency} {totalSavings}</strong>.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tool 4: Currency Converter */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Currency Converter</span>
                    <Coins className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">From (USD)</span>
                      <Input
                        type="number"
                        value={usdAmount}
                        onChange={(e) => setUsdAmount(e.target.value)}
                        className="h-9 border-white/10 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">To</span>
                      <select
                        value={targetCurrency}
                        onChange={(e) => setTargetCurrency(e.target.value)}
                        className="h-9 bg-popover border border-white/10 rounded-lg text-xs font-semibold px-2"
                      >
                        {Object.keys(exchangeRates).map(cur => (
                          <option key={cur} value={cur}>{cur}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                    <span className="text-[10px] font-bold uppercase text-primary">Converted Value</span>
                    <p className="text-xl font-black mt-0.5">{targetCurrency} {convertedValue.toFixed(2)}</p>
                    <span className="text-[9px] text-muted-foreground font-semibold">1 USD = {exchangeRates[targetCurrency]} {targetCurrency} (Cached rate)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tool 13: Expense Tracker */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Interactive Expense Tracker</span>
                    {trip.currency === "INR" ? (
                      <IndianRupee className="h-4 w-4 text-primary" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-primary" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  {/* Ledger Form */}
                  <form onSubmit={handleAddExpense} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Category</span>
                        <select
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value)}
                          className="w-full h-9 bg-popover border border-white/10 rounded-lg text-xs font-semibold px-2"
                        >
                          {["Flights", "Hotels", "Food", "Transit", "Activities", "Others"].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Amount ({trip.currency})</span>
                        <Input
                          type="number"
                          placeholder="45"
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value)}
                          required
                          className="h-9 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Description</span>
                      <Input
                        placeholder="Dinner at bistro"
                        value={expDesc}
                        onChange={(e) => setExpDesc(e.target.value)}
                        required
                        className="h-9 border-white/10"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full font-bold">Add Ledger Entry</Button>
                  </form>

                  {/* Allocation balance */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>Budget Cap Used: {trip.currency} {totalExpenses} / {trip.budget}</span>
                        <span>{budgetPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div style={{ width: `${budgetPercent}%` }} className="h-full bg-primary transition-all duration-300" />
                      </div>
                    </div>

                    {/* Expense items ledger */}
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-2">
                      {expenses.map(exp => (
                        <div key={exp.id} className="flex items-center justify-between text-xs p-2 border border-white/5 bg-white/5 rounded-lg font-semibold text-muted-foreground">
                          <div className="flex flex-col">
                            <span className="text-foreground">{exp.description}</span>
                            <span className="text-[9px] text-primary">{exp.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-mono">{trip.currency} {exp.amount}</span>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded-sm border-0 bg-transparent cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* HUB 2: Logistics Hub */}
          {activeHub === "logistics" && (
            <>
              {/* Tool 2: Route Optimizer */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Route Optimizer</span>
                    <Navigation className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <span className="text-[10px] font-bold text-primary uppercase block">Minimizing walking times</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs border border-white/5 bg-white/5 p-2 rounded-lg font-medium">
                      <span>1. Central Castle → Old Square</span>
                      <span className="text-[10px] text-green-500 font-bold">10 mins walk</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border border-white/5 bg-white/5 p-2 rounded-lg font-medium">
                      <span>2. Old Square → Botanical dome</span>
                      <span className="text-[10px] text-primary font-bold">15 mins by Tram</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border border-white/5 bg-white/5 p-2 rounded-lg font-medium">
                      <span>3. Botanical dome → Pier 4</span>
                      <span className="text-[10px] text-green-500 font-bold">8 mins walk</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                    <strong>Optimizer Report:</strong> Sequencing Castle before Botanic dome saves 1.5 hours of transit overlap.
                  </p>
                </CardContent>
              </Card>

              {/* Tool 3: Carbon Footprint */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Carbon Footprint</span>
                    <Leaf className="h-4 w-4 text-green-500 animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <span className="text-[10px] font-bold text-green-500 uppercase block">Eco Transit comparison</span>
                  <div className="space-y-2 text-xs font-semibold text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Flight segment: 450kg CO2</span>
                      <span className="text-destructive font-bold">High impact</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Rail connection: 32kg CO2</span>
                      <span className="text-green-500 font-bold">Eco friendly</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Walk/Tram segments: 0kg CO2</span>
                      <span className="text-green-500 font-bold">Zero footprint</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                    <p className="text-[10px] text-green-400 font-semibold leading-relaxed">
                      <strong>Carbon Offsetting:</strong> Offsetting this trip requires planting 3 trees. Join our green canopy project at checkout.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* HUB 3: Local Insights */}
          {activeHub === "insights" && (
            <>
              {/* Tool 5: Crowd Prediction */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Crowd Prediction</span>
                    <Users className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <span className="text-[10px] font-bold text-primary uppercase block">Louvre landmark density</span>
                  <div className="space-y-1.5 text-xs font-medium text-muted-foreground">
                    <div className="flex justify-between items-center">
                      <span>Morning (09:00 AM - 11:00 AM)</span>
                      <span className="text-green-500 font-bold text-[10px] uppercase">Quiet slot</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Afternoon (11:00 AM - 03:00 PM)</span>
                      <span className="text-destructive font-bold text-[10px] uppercase">Peak density</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Evening (03:00 PM - 06:00 PM)</span>
                      <span className="text-amber-500 font-bold text-[10px] uppercase">Moderate density</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    <strong>AI Recommendation:</strong> Visit the Castle at 9:00 AM to avoid the tour bus queues.
                  </p>
                </CardContent>
              </Card>

              {/* Tool 6: Travel Advisory */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Travel Advisory</span>
                    <ShieldAlert className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-2 border border-white/5 bg-white/5 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-muted-foreground">Country Safety Index</span>
                    <span className="text-green-500 font-black text-sm">Level 1 (Safe)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    No major alerts reported. High pocket vigilance advised in busy market halls and transit hubs. Ensure travel insurance documents copy uploaded.
                  </p>
                </CardContent>
              </Card>

              {/* Tool 12: Festival Recommendations */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Festival Recommendations</span>
                    <Calendar className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="p-3 border border-white/5 bg-white/5 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-primary uppercase">July Carnival</span>
                    <p className="font-bold text-foreground">Local Summer Arts Festival</p>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Open street music displays, craft markets, and free theater events.
                    </p>
                  </div>
                  <div className="p-3 border border-white/5 bg-white/5 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-primary uppercase">Food fair</span>
                    <p className="font-bold text-foreground">Riverside Food Truck Parade</p>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Regional food stalls gathering along the waterfront promenade.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* HUB 4: Travel Kit & Leisure */}
          {activeHub === "kit" && (
            <>
              {/* Tool 7: Packing Assistant */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Packing Assistant</span>
                    <Briefcase className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <span className="text-[10px] font-bold text-primary uppercase block">Weather-appropriate items</span>
                  <div className="space-y-2">
                    {packList.map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between text-xs cursor-pointer font-semibold select-none">
                        <span className={item.checked ? "line-through text-muted-foreground" : "text-foreground"}>
                          {item.text} ({item.category})
                        </span>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {
                            const updated = [...packList]
                            updated[idx].checked = !updated[idx].checked
                            setPackList(updated)
                          }}
                          className="rounded border-input text-primary focus:ring-ring h-3.5 w-3.5"
                        />
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tool 8: Hidden Gems */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Hidden Gems</span>
                    <MapPin className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 border border-white/5 bg-white/5 rounded-xl space-y-1">
                    <p className="font-bold text-foreground">The Sunken Garden Passage</p>
                    <p className="text-[10px] text-muted-foreground">
                      An overgrown 19th-century pedestrian path hidden behind the main museum gallery block. Completely quiet.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tool 9: Photography Spots */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Photography Spots</span>
                    <Camera className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs font-semibold">
                  <div className="p-2 border border-white/5 bg-white/5 rounded-lg flex justify-between items-center">
                    <span>Golden Hour Slot</span>
                    <span className="text-primary font-mono">05:45 PM - 06:30 PM</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong>Recommended vantage point:</strong> The top observation balcony of Castle tower yields 360-degree sunset angles with zero iron grill blockages.
                  </p>
                </CardContent>
              </Card>

              {/* Tool 10: Emergency Services */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Emergency Contacts</span>
                    <HeartPulse className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between border-b border-white/5 pb-1 text-muted-foreground">
                    <span>General Emergency</span>
                    <span className="font-mono text-primary">112</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 text-muted-foreground">
                    <span>Medical Hospital clinic</span>
                    <span className="font-mono text-primary">+1-202-555-0199</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tourist Help center</span>
                    <span className="font-mono text-primary">911-EXT</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tool 11: Weather Alerts */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-md md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Real-time Weather Alerts</span>
                    <CloudSun className="h-4 w-4 text-primary animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 py-1">
                  <div className="flex items-start gap-2 p-3 border border-amber-500/25 bg-amber-500/5 text-amber-400 rounded-xl text-xs font-semibold leading-relaxed">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 animate-bounce" />
                    <div>
                      <p>Active Ultraviolet (UV) Exposure Advisory</p>
                      <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                        UV indices projected at 9.0 during peak noon. Apply broad sunscreen protection and wear light protective layers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  )
}
export default Optimizer
