import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { api } from "@/services/api"
import { 
  Compass, Calendar, DollarSign, IndianRupee, MessageSquare, Star, 
  Sparkles, CloudSun, Plane, Hotel, Utensils, MapPin, 
  ShieldAlert, PhoneCall, Activity, CheckSquare, 
  Map, HelpCircle, RefreshCw, Plus, Compass as TransitIcon,
  Wifi, ShieldCheck, Luggage, Coffee
} from "lucide-react"

// Types matching Database Models
interface TripPreference {
  adults: number
  children: number
  senior_citizens: number
  travel_style: string
  pace: string
  transportation_preference: string
  food_preference: string
  hotel_preference: string
  accessibility: string
  medical_needs: string
  activities: string[]
  passport_country: string
  nationality: string
  special_requests: string
}

interface TripData {
  id: string
  title: string
  source_city: string
  destination: string
  start_date: string
  end_date: string
  flexible_dates: boolean
  budget: number
  currency: string
  status: string
  summary: string | null
  preferences: TripPreference | null
  created_at: string
}

export function Dashboard() {
  const [trips, setTrips] = useState<TripData[]>([])
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [packingList, setPackingList] = useState<{ id: number; text: string; checked: boolean }[]>([
    { id: 1, text: "Passport & Visa copies", checked: true },
    { id: 2, text: "Universal power adapter", checked: false },
    { id: 3, text: "Comfortable walking shoes", checked: false },
    { id: 4, text: "Weather-appropriate layers", checked: false },
    { id: 5, text: "Prescription medications", checked: true }
  ])

  // Fetch Trips on mount
  const fetchTrips = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/trip")
      const data = response.data
      setTrips(data)
      if (data.length > 0) {
        setActiveTrip(data[0])
      }
    } catch (e) {
      console.error("Failed to load dashboard trips:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  // Toggle packing list items
  const handleToggleCheck = (id: number) => {
    setPackingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  // Calculate checked percentage
  const checkedCount = packingList.filter(item => item.checked).length
  const checklistPercent = Math.round((checkedCount / packingList.length) * 100)

  // Empty state when traveler has not created any trips yet
  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
        <RefreshCw className="h-10 w-10 text-[#0F4C81] dark:text-[#4FC3F7] animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground">Loading workspace details...</span>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-20">
        <div className="p-4 bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#4FC3F7] rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">No Active Trips Found</h2>
        <p className="text-muted-foreground text-sm">
          Welcome to TripGenie AI. Complete the travel planning wizard to generate a multi-agent itinerary compiled inside PostgreSQL.
        </p>
        <Link to="/app/plan-trip">
          <Button className="mt-2 bg-[#FF8A3D] hover:bg-[#ff7b24] hover-scale hover-glow-orange text-white flex items-center gap-1.5 shadow font-semibold">
            <Plus className="h-4 w-4" /> Plan a New Trip
          </Button>
        </Link>
      </div>
    )
  }

  const trip = activeTrip || trips[0]
  const prefs = trip.preferences || {
    adults: 1,
    children: 0,
    senior_citizens: 0,
    travel_style: "Explorer",
    pace: "Moderate",
    transportation_preference: "Flight",
    food_preference: "No Restrictions",
    hotel_preference: "Hotel",
    accessibility: "None",
    medical_needs: "None",
    activities: ["Sightseeing"],
    passport_country: "United States",
    nationality: "American",
    special_requests: ""
  }

  // Budget allocations for visual SVG chart
  const flightAlloc = Math.round(trip.budget * 0.35)
  const hotelAlloc = Math.round(trip.budget * 0.40)

  // Motion grid stagger definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome & Trip Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#0F4C81]/15 text-[#0F4C81] dark:text-[#4FC3F7]">
            <Compass className="h-6 w-6 text-[#0F4C81] dark:text-[#4FC3F7] animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A3D]">Current Workspace</span>
            <select
              value={trip.id}
              onChange={(e) => {
                const selected = trips.find(t => t.id === e.target.value)
                if (selected) setActiveTrip(selected)
              }}
              className="block font-black text-xl bg-transparent border-none text-[#0F4C81] dark:text-[#4FC3F7] focus:ring-0 cursor-pointer p-0 select-none"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id} className="bg-popover text-foreground text-sm font-semibold">
                  {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/app/plan-trip">
            <Button className="bg-[#FF8A3D] hover:bg-[#ff7b24] hover-scale hover-glow-orange text-white flex items-center gap-1.5 shadow font-semibold">
              <Sparkles className="h-4 w-4 text-white" /> Plan New Trip
            </Button>
          </Link>
          <Button 
            variant="outline"
            onClick={fetchTrips}
            className="flex items-center gap-1.5 border-slate-200 hover:bg-slate-100"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Sync
          </Button>
        </div>
      </div>

      {/* Redesigned 17-Card Dashboard Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        
        {/* CARD 1: Trip Summary */}
        <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-2">
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4FC3F7]/10 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="pb-2">
              <span className="text-[10px] font-bold text-[#FF8A3D] uppercase tracking-wider font-poppins">Itinerary Cover</span>
              <CardTitle className="text-xl font-black text-slate-800 dark:text-white font-poppins">{trip.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1 text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5 text-[#FF8A3D]" /> {trip.source_city} → {trip.destination}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-4 leading-relaxed font-medium">
                {trip.summary || "No multi-agent LangGraph analysis summary compiled for this trip. Trigger a plan generation stream."}
              </p>
              <div className="flex gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#0F4C81] dark:text-[#4FC3F7]" /> {trip.start_date}</span>
                <span className="flex items-center gap-1 font-bold">
                  {trip.currency === "INR" ? (
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  {trip.budget.toLocaleString(trip.currency === "INR" ? "en-IN" : "en-US")} {trip.currency}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 2: Live Weather */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Live Weather</span>
                <CloudSun className="h-4 w-4 text-[#FF8A3D] animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center space-y-2">
              <span className="text-4xl font-black text-[#0F4C81] dark:text-[#4FC3F7]">22°C</span>
              <span className="text-xs font-bold text-[#FF8A3D] uppercase tracking-wider font-poppins">Clear Skies</span>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 px-2 font-medium">Averages 20-25°C. Pleasant conditions for day walking.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 3: Hourly Forecast */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-white font-poppins">Hourly Forecast</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>12:00 PM</span>
                <span className="text-slate-800 dark:text-white">24°C Sunny</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>03:00 PM</span>
                <span className="text-slate-800 dark:text-white">25°C Sunny</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>06:00 PM</span>
                <span className="text-slate-800 dark:text-white">21°C Clear</span>
              </div>
              <div className="flex items-center justify-between py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>09:00 PM</span>
                <span className="text-[#0F4C81] dark:text-[#4FC3F7]">18°C Breezy</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 4: 7-Day Forecast */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-white font-poppins">7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="flex items-center justify-between py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-16">Mon</span>
                <span className="text-[#FF8A3D] font-bold">22°C</span>
                <span className="text-[10px] text-muted-foreground font-normal">Clear</span>
              </div>
              <div className="flex items-center justify-between py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-16">Tue</span>
                <span className="text-[#FF8A3D] font-bold">23°C</span>
                <span className="text-[10px] text-muted-foreground font-normal">Sunny</span>
              </div>
              <div className="flex items-center justify-between py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-16">Wed</span>
                <span className="text-[#FF8A3D] font-bold">21°C</span>
                <span className="text-[10px] text-muted-foreground font-normal">Cloudy</span>
              </div>
              <div className="flex items-center justify-between py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-16">Thu</span>
                <span className="text-[#FF8A3D] font-bold">19°C</span>
                <span className="text-[10px] text-muted-foreground font-normal">Rain</span>
              </div>
              <div className="flex items-center justify-between py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-16">Fri</span>
                <span className="text-[#FF8A3D] font-bold">20°C</span>
                <span className="text-[10px] text-muted-foreground font-normal">Cloudy</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 5: Flights (with Airline Details, Baggage, Meals, Booking Link) */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Flight Logistics</span>
                <Plane className="h-4 w-4 text-[#0F4C81] dark:text-[#4FC3F7]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-1">
              <div className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded bg-[#0F4C81]/15 text-[#0F4C81] dark:text-[#4FC3F7] flex items-center justify-center font-bold text-[10px] font-mono">EA</span>
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#FF8A3D] font-poppins">EcoAir • Direct</span>
                    <p className="text-[10px] font-bold">EA-402 (8h 15m)</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0F4C81] dark:text-[#4FC3F7] font-mono">{trip.currency} {flightAlloc}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><Luggage className="h-3 w-3 text-slate-400" /> Luggage: 23kg</span>
                <span className="flex items-center gap-1"><Coffee className="h-3 w-3 text-slate-400" /> Hot Meals Inc.</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <a href="https://www.google.com/travel/flights" target="_blank" rel="noreferrer" className="w-full">
                <Button size="sm" className="w-full bg-[#FF8A3D] text-white hover:bg-[#ff7b24] text-xs font-bold shadow hover-scale">
                  Book Departure Flight
                </Button>
              </a>
            </CardFooter>
          </Card>
        </motion.div>

        {/* CARD 6: Top Hotels (with Rating, Amenities, Booking Link) */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Top Stays</span>
                <Hotel className="h-4 w-4 text-[#0F4C81] dark:text-[#4FC3F7]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-1 flex-1">
              <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-700 pb-1.5 text-slate-600 dark:text-slate-400">
                <div>
                  <p className="truncate w-36 text-[11px] font-bold">1. Grand Plaza stay</p>
                  <div className="flex gap-1 mt-0.5">
                    <span className="text-[8px] bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-400 flex items-center gap-0.5"><Wifi className="h-2 w-2" /> WiFi</span>
                    <span className="text-[8px] bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-400">Pool</span>
                  </div>
                </div>
                <span className="text-amber-500 font-bold flex items-center gap-0.5 text-[10px]"><Star className="h-3 w-3 fill-amber-500" /> 4.8</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-700 pb-1.5 text-slate-600 dark:text-slate-400">
                <div>
                  <p className="truncate w-36 text-[11px] font-bold">2. Central stay Inn</p>
                  <span className="text-[8px] bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-400">Gym</span>
                </div>
                <span className="text-amber-500 font-bold flex items-center gap-0.5 text-[10px]"><Star className="h-3 w-3 fill-amber-500" /> 4.5</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold pb-1 text-slate-600 dark:text-slate-400">
                <div>
                  <p className="truncate w-36 text-[11px] font-bold">3. Riverside Suites</p>
                  <span className="text-[8px] bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-400">Spa</span>
                </div>
                <span className="text-amber-500 font-bold flex items-center gap-0.5 text-[10px]"><Star className="h-3 w-3 fill-amber-500" /> 4.4</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <a href="https://www.booking.com" target="_blank" rel="noreferrer" className="w-full">
                <Button size="sm" variant="outline" className="w-full border-slate-200 hover:bg-slate-100 text-xs font-bold hover-scale">
                  Compare Stay Offers
                </Button>
              </a>
            </CardFooter>
          </Card>
        </motion.div>

        {/* CARD 7: Restaurants */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Dining Spots</span>
                <Utensils className="h-4 w-4 text-[#0F4C81] dark:text-[#4FC3F7]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-1">
              <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-700 pb-1.5 text-slate-600 dark:text-slate-400">
                <div>
                  <span className="truncate w-36 block text-[11px]">1. Cafe Bistro & Green</span>
                  <span className="text-[8px] text-slate-400 font-semibold">Hours: 08 AM - 10 PM</span>
                </div>
                <span className="text-green-500 font-bold text-[8px] uppercase">Veg Friendly</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-700 pb-1.5 text-slate-600 dark:text-slate-400">
                <div>
                  <span className="truncate w-36 block text-[11px]">2. Spice Road grill</span>
                  <span className="text-[8px] text-slate-400 font-semibold">Hours: 12 PM - 11 PM</span>
                </div>
                <span className="text-[#FF8A3D] font-bold text-[8px] uppercase">Traditional</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold pb-1 text-slate-600 dark:text-slate-400">
                <div>
                  <span className="truncate w-36 block text-[11px]">3. Central Food Market</span>
                  <span className="text-[8px] text-slate-400 font-semibold">Hours: 10 AM - 08 PM</span>
                </div>
                <span className="text-muted-foreground text-[8px]">Street Food</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 8: Top Attractions */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Sights & Landmarks</span>
                <Activity className="h-4 w-4 text-[#0F4C81] dark:text-[#4FC3F7]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs py-1">
              {prefs.activities.map(act => (
                <div key={act} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A3D]" />
                    <span>{act}</span>
                  </div>
                  <span className="text-[8px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 font-mono">2.5 hrs</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 9: Interactive Map stub */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Interactive Map</span>
                <Map className="h-4 w-4 text-[#0F4C81] dark:text-[#4FC3F7]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-44 bg-muted/20 relative">
              <div className="absolute inset-0 bg-cover bg-center filter saturate-75 opacity-70" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1 text-xs text-white font-bold">
                    <MapPin className="h-4 w-4 text-[#FF8A3D]" />
                    <span>Active Coordinates: {trip.destination}</span>
                  </div>
                  <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur">Routes Optimized</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 10: Budget Analytics SVG Donut Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-white font-poppins">Budget Analytics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-1 space-y-3 flex-1">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="rgba(0,0,0,0.05)" strokeWidth="8" fill="transparent" />
                  <circle cx="48" cy="48" r="38" stroke="#0F4C81" strokeWidth="8" fill="transparent"
                          strokeDasharray="95.5 238.7" strokeDashoffset="0" />
                  <circle cx="48" cy="48" r="38" stroke="#4FC3F7" strokeWidth="8" fill="transparent"
                          strokeDasharray="83.5 238.7" strokeDashoffset="-95.5" />
                  <circle cx="48" cy="48" r="38" stroke="#FF8A3D" strokeWidth="8" fill="transparent"
                          strokeDasharray="59.7 238.7" strokeDashoffset="-179" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Cap</span>
                  <p className="text-xs font-black font-mono text-slate-800 dark:text-white">{trip.budget}</p>
                </div>
              </div>

              <div className="w-full space-y-1 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0F4C81]" /> Stays</span>
                  <span>40% ({trip.currency} {hotelAlloc})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4FC3F7]" /> Flights</span>
                  <span>35% ({trip.currency} {flightAlloc})</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-2 mx-4 mb-4">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>AI Saving Tip: Re-route via trains to save {trip.currency === "INR" ? "₹10,000" : "$120"}.</span>
            </CardFooter>
          </Card>
        </motion.div>

        {/* CARD 11: Packing Checklist */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Checklist</span>
                <CheckSquare className="h-4 w-4 text-[#0F4C81] dark:text-[#4FC3F7]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div style={{ width: `${checklistPercent}%` }} className="h-full bg-[#FF8A3D] transition-all duration-300" />
              </div>
              <div className="text-[10px] text-slate-500 font-bold flex justify-between uppercase">
                <span>Packing list</span>
                <span className="text-[#FF8A3D]">{checklistPercent}% done</span>
              </div>
              <div className="space-y-1.5 mt-2">
                {packingList.map(item => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleCheck(item.id)}
                      className="rounded border-input text-[#0F4C81] focus:ring-[#0F4C81] h-3.5 w-3.5"
                    />
                    <span className={item.checked ? "line-through text-slate-400 font-medium" : "font-semibold text-slate-700 dark:text-slate-300"}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 12: Visa Information */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Visa & Documents</span>
                <ShieldAlert className="h-4 w-4 text-[#0F4C81] dark:text-[#4FC3F7]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs py-1">
              <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-[#FF8A3D] uppercase">Passport Limit</span>
                <p className="font-extrabold text-slate-800 dark:text-white">{prefs.passport_country} Holder</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  90-day visa-free tourist entry permitted. Ensure passport valid 6 months.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 13: Emergency Contacts */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Emergencies</span>
                <PhoneCall className="h-4 w-4 text-primary animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
                <span>General Police</span>
                <span className="font-mono text-[#FF8A3D]">112 / 911</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
                <span>Medical Aid</span>
                <span className="font-mono text-[#FF8A3D]">119</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate w-24">US Embassy</span>
                <span className="font-mono text-[#FF8A3D]">+1-202-555</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 14: Local Experiences */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Local Guides</span>
                <Star className="h-4 w-4 text-[#FF8A3D]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-1 text-xs">
              <p className="text-slate-500 font-bold text-[11px] leading-relaxed">
                Immersive cultural tips for {trip.destination}:
              </p>
              <div className="space-y-1 font-bold text-slate-600 dark:text-slate-400">
                <p>• Book tickets for city temples early.</p>
                <p>• Respect local customs and attire.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 15: Transportation */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Transit</span>
                <TransitIcon className="h-4 w-4 text-[#0F4C81] dark:text-[#4FC3F7]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs py-1">
              <div className="p-2 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[9px] font-bold text-[#FF8A3D] uppercase">Transit choice</span>
                <p className="font-extrabold text-slate-800 dark:text-white">{prefs.transportation_preference}</p>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
                  City rail or walkable routes are highly recommended.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 16: Travel Tips */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 dark:text-white font-poppins">
                <span>Tips & Sockets</span>
                <HelpCircle className="h-4 w-4 text-primary animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[11px] text-slate-500 leading-relaxed py-1 font-bold">
              <p>• <span className="text-slate-800 dark:text-white">Sockets:</span> Type A/B or C/F (220V).</p>
              <p>• <span className="text-slate-800 dark:text-white">Water:</span> Tap water safe, bottled preferred in markets.</p>
              <p>• <span className="text-slate-800 dark:text-white">Tipping:</span> 10% standard in restaurants if not included.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* NEW CARD 17: Genie AI Decision Insights (Mandatory Requirement) */}
        <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-4">
          <Card className="border-slate-200/60 dark:border-slate-800 bg-[#0F4C81] text-white shadow-lg rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#4FC3F7]/10 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="pb-2">
              <span className="text-[10px] font-bold text-[#FF8A3D] uppercase tracking-widest font-poppins">Intelligence Layer</span>
              <CardTitle className="text-base font-black flex items-center gap-1.5 text-white font-poppins">
                <Sparkles className="h-4 w-4 text-[#FF8A3D] animate-pulse" /> Genie AI Decision Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 text-xs leading-relaxed text-slate-200 space-y-2 font-medium">
              <p>
                To optimize your travel budget of <strong className="text-white">{trip.budget} {trip.currency}</strong>, we scheduled your outdoor sight tours during the clear morning weather window. Stays were clustered around central rail transit zones to eliminate unnecessary private taxi expenses.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="bg-white/10 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Budget Optimized</span>
                <span className="bg-white/10 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Weather-Sequenced</span>
                <span className="bg-white/10 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Transit Mapped</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 18: Quick Actions Panel */}
        <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-4">
          <Card className="border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-white font-poppins">Quick Actions Dashboard Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 py-2">
              <Link to="/app/trips">
                <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold">
                  <Calendar className="h-3.5 w-3.5 text-[#0F4C81] dark:text-[#4FC3F7]" /> View Timeline Schedule
                </Button>
              </Link>
              <Link to="/app/optimizer">
                <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> View Expense Ledgers
                </Button>
              </Link>
              <Link to="/app/chat">
                <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold">
                  <MessageSquare className="h-3.5 w-3.5 text-[#FF8A3D]" /> Chat with Genie AI
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

    </div>
  )
}
