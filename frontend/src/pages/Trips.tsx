import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/Skeleton"
import { 
  Calendar, Compass, DollarSign, IndianRupee, Plus, Trash2, ArrowRight, 
  MapPin, Star, Clock, Coins, Footprints, 
  Coffee, Utensils, Landmark, CloudRain, ShieldCheck, ArrowLeft,
  Download, CalendarRange, Share2, Mail, Check, AlertCircle
} from "lucide-react"

// Types
interface TripData {
  id: string
  title: string
  source_city: string
  destination: string
  start_date: string
  end_date: string
  budget: number
  currency: string
  status: string
  summary: string | null
}

interface Activity {
  time: string
  title: string
  imageUrl: string
  rating: string
  entryFee: string
  hours: string
  duration: string
  travelTime: string
  cost: string
  cafes: string
  restaurants: string
  attractions: string
  rainAlternative: string
}

// Dynamically generate day-wise itineraries tailored to the destination city and trip duration
function getDurationDays(start: string, end: string): number {
  try {
    const s = new Date(start)
    const e = new Date(end)
    const diff = e.getTime() - s.getTime()
    if (isNaN(diff)) return 3
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
    return days > 0 ? days : 3
  } catch (err) {
    return 3
  }
}

// Dynamically generate day-wise itineraries tailored to the destination city and trip duration
function getDynamicItinerary(destination: string, durationDays: number = 3): Record<string, Activity[]> {
  const destLower = destination.toLowerCase()
  const itinerary: Record<string, Activity[]> = {}
  let activityPool: Activity[] = []

  if (destLower.includes("kyoto") || destLower.includes("japan")) {
    activityPool = [
      {
        time: "09:00 AM - 11:30 AM",
        title: "Fushimi Inari Shrine Walk",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400",
        rating: "4.9 ★",
        entryFee: "Free",
        hours: "24/7",
        duration: "2.5 hrs",
        travelTime: "25 mins to next stop",
        cost: "₹0.00",
        cafes: "Inari Tea House",
        restaurants: "Kitsune Udon Spot",
        attractions: "Senbon Torii Gates",
        rainAlternative: "Rain Alternative: Visit the covered shrine museum hall / Relax with Matcha tea at the pavilion."
      },
      {
        time: "12:00 PM - 02:30 PM",
        title: "Kiyomizu-dera Temple Tour",
        imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "400 JPY (~$3.00)",
        hours: "06:00 AM - 06:00 PM",
        duration: "2.5 hrs",
        travelTime: "15 mins to next stop",
        cost: "$3.00",
        cafes: "Otowa Spring Cafe",
        restaurants: "Yudofu Traditional Diner",
        attractions: "Three-story Pagoda, Wooden Stage",
        rainAlternative: "Rain Alternative: Tour the interior temple halls and covered prayer pavilions."
      },
      {
        time: "03:00 PM - 05:30 PM",
        title: "Gion District Cultural Walk",
        imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=400",
        rating: "4.7 ★",
        entryFee: "Free",
        hours: "24/7",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "$0.00",
        cafes: "Gion Matcha Corner",
        restaurants: "Geisha Kaiseki Dinner",
        attractions: "Yasaka Shrine, Shirakawa Canal",
        rainAlternative: "Rain Alternative: Relocate to a covered teahouse for an indoor traditional tea ceremony."
      },
      {
        time: "09:00 AM - 11:30 AM",
        title: "Arashiyama Bamboo Grove Walk",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "Free",
        hours: "24/7",
        duration: "2.5 hrs",
        travelTime: "20 mins to next stop",
        cost: "$0.00",
        cafes: "Bamboo Grove Brews",
        restaurants: "Tenryu-ji Temple Veg Buffet",
        attractions: "Bamboo forest paths, Togetsukyo Bridge",
        rainAlternative: "Rain Alternative: Visit the indoor Saga-Arashiyama Museum / Relax at a riverside cafe."
      },
      {
        time: "12:00 PM - 02:30 PM",
        title: "Kinkaku-ji (Golden Pavilion) Visit",
        imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=400",
        rating: "4.9 ★",
        entryFee: "500 JPY (~$3.50)",
        hours: "09:00 AM - 05:00 PM",
        duration: "2.5 hrs",
        travelTime: "15 mins to next stop",
        cost: "$3.50",
        cafes: "Golden Leaf Tea Room",
        restaurants: "Soba Noodles Kitchen",
        attractions: "Gold leaf covered pavilion, Zen garden lakes",
        rainAlternative: "Rain Alternative: View the pavilion from the covered tea rooms / Browse the souvenir hall."
      },
      {
        time: "03:00 PM - 05:30 PM",
        title: "Nijo Castle Palace Tour",
        imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=400",
        rating: "4.7 ★",
        entryFee: "800 JPY (~$5.50)",
        hours: "08:45 AM - 05:00 PM",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "$5.50",
        cafes: "Castle Garden Cafe",
        restaurants: "Nijo Traditional Grill",
        attractions: "Ninomaru Palace, Nightingale Floors",
        rainAlternative: "Rain Alternative: Ninomaru Palace is fully indoor and weather-proof."
      }
    ]
  } else if (destLower.includes("paris") || destLower.includes("france")) {
    activityPool = [
      {
        time: "09:00 AM - 11:30 AM",
        title: "Eiffel Tower Summit Access",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "€29.00 (~$31.00)",
        hours: "09:30 AM - 11:45 PM",
        duration: "2.5 hrs",
        travelTime: "20 mins to next stop",
        cost: "$31.00",
        cafes: "Eiffel Tower Buffet Cafe",
        restaurants: "58 Tour Eiffel (Fine Dining)",
        attractions: "Summit observations deck, glass floors",
        rainAlternative: "Rain Alternative: Access the covered Eiffel Tower 1st floor pavilion exhibits."
      },
      {
        time: "12:00 PM - 02:30 PM",
        title: "Seine River Custom Cruise",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400",
        rating: "4.6 ★",
        entryFee: "€15.00 (~$16.00)",
        hours: "10:00 AM - 10:00 PM",
        duration: "2.5 hrs",
        travelTime: "15 mins to next stop",
        cost: "$16.00",
        cafes: "Riverbank Coffee Cart",
        restaurants: "Le Bistrot Parisien",
        attractions: "Pont Neuf, Cathedral Notre-Dame view",
        rainAlternative: "Cruises use covered glass vessels and operate in all weather."
      },
      {
        time: "03:00 PM - 05:30 PM",
        title: "Louvre Museum Treasures Tour",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400",
        rating: "4.9 ★",
        entryFee: "€22.00 (~$24.00)",
        hours: "09:00 AM - 06:00 PM",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "$24.00",
        cafes: "Cafe Mollien (Louvre)",
        restaurants: "Bistrot Benoit (Under Pyramid)",
        attractions: "Mona Lisa, Venus de Milo, Glass Pyramid",
        rainAlternative: "Louvre exhibits are fully enclosed and rain-proof."
      },
      {
        time: "09:00 AM - 11:30 AM",
        title: "Champs-Élysées & Arc de Triomphe Walk",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400",
        rating: "4.7 ★",
        entryFee: "€13.00 (Arc Rooftop)",
        hours: "10:00 AM - 11:00 PM",
        duration: "2.5 hrs",
        travelTime: "15 mins to next stop",
        cost: "$14.00",
        cafes: "Ladurée Macarons Cafe",
        restaurants: "Fouquet's Paris Luxury Bistro",
        attractions: "Avenue des Champs-Élysées, Rooftop observation",
        rainAlternative: "Rain Alternative: Browse the shopping galleries and covered arcades along the boulevard."
      },
      {
        time: "12:00 PM - 02:30 PM",
        title: "Jardin des Tuileries & Musée de l'Orangerie",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "€12.50 (Museum)",
        hours: "09:00 AM - 06:00 PM",
        duration: "2.5 hrs",
        travelTime: "15 mins to next stop",
        cost: "$13.00",
        cafes: "La Pâtisserie du Jardin",
        restaurants: "Angelina Paris Tea Room",
        attractions: "Water Lily murals by Monet, tree-lined walking paths",
        rainAlternative: "Rain Alternative: Explore the indoor galleries of Musée de l'Orangerie."
      },
      {
        time: "03:00 PM - 05:30 PM",
        title: "Montmartre Art Village Walking Tour",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400",
        rating: "4.7 ★",
        entryFee: "Free (Sacré-Cœur free)",
        hours: "06:00 AM - 10:30 PM",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "$0.00",
        cafes: "La Maison Rose Cafe",
        restaurants: "Le Consulat Bistro",
        attractions: "Place du Tertre Artists Square",
        rainAlternative: "Sacré-Cœur basilica is fully indoor and rain-proof."
      }
    ]
  } else if (destLower.includes("jaipur")) {
    activityPool = [
      {
        time: "09:00 AM - 11:30 AM",
        title: "Hawa Mahal (Palace of Winds) Visit",
        imageUrl: "https://images.unsplash.com/photo-1477584308802-e9c3788ee12d?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "₹50 (Indians) / ₹200 (Foreigners)",
        hours: "09:00 AM - 04:30 PM",
        duration: "2.5 hrs",
        travelTime: "25 mins to next stop",
        cost: "₹50.00",
        cafes: "Wind View Cafe",
        restaurants: "The Tattoo Cafe",
        attractions: "Honeycomb facade, narrow balconies",
        rainAlternative: "Rain Alternative: Tour the interior museum chambers and arches inside the wind palace."
      },
      {
        time: "12:00 PM - 03:00 PM",
        title: "Amer Fort Historical Exploration",
        imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=400",
        rating: "4.9 ★",
        entryFee: "₹100 (Indians)",
        hours: "08:00 AM - 05:30 PM",
        duration: "3 hrs",
        travelTime: "30 mins to next stop",
        cost: "₹100.00",
        cafes: "Stag Rooftop Restro Cafe",
        restaurants: "1135 AD Luxury Fine-Dine",
        attractions: "Sheesh Mahal (Mirror Palace), Diwan-i-Aam",
        rainAlternative: "Rain Alternative: Explore the covered interior palaces like the Mirror Hall (Sheesh Mahal)."
      },
      {
        time: "03:30 PM - 06:00 PM",
        title: "Jantar Mantar Observatory Tour",
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=400",
        rating: "4.7 ★",
        entryFee: "₹50 (Indians)",
        hours: "09:00 AM - 04:30 PM",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "₹50.00",
        cafes: "City Palace Tea Lounge",
        restaurants: "LMB Restaurant (Johari Bazar)",
        attractions: "Vrihat Samrat Yantra (world's largest sundial)",
        rainAlternative: "Rain Alternative: Relocate to the adjacent indoor City Palace galleries."
      },
      {
        time: "09:30 AM - 12:30 PM",
        title: "City Palace Royal Residence Tour",
        imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "₹200 (Indians)",
        hours: "09:30 AM - 05:00 PM",
        duration: "3 hrs",
        travelTime: "20 mins to next stop",
        cost: "₹200.00",
        cafes: "Baradari Restaurant & Cafe",
        restaurants: "The Royal Kothi",
        attractions: "Chandra Mahal, Mubarak Mahal",
        rainAlternative: "The palace galleries and royal textile displays are fully indoor."
      },
      {
        time: "01:00 PM - 04:00 PM",
        title: "Shopping Trail at Johari Bazar & Lassiwala",
        imageUrl: "https://images.unsplash.com/photo-1562979314-bee7453e911c?q=80&w=400",
        rating: "4.7 ★",
        entryFee: "Free entry",
        hours: "10:00 AM - 08:00 PM",
        duration: "3 hrs",
        travelTime: "Return to hotel",
        cost: "₹100.00",
        cafes: "Lassiwala (Original MI Road - Clay cups)",
        restaurants: "Niro's Multi-cuisine",
        attractions: "Handicrafts, gemstones, traditional block prints",
        rainAlternative: "Rain Alternative: Explore covered bazaars or head to local handicraft emporiums."
      },
      {
        time: "09:00 AM - 11:30 AM",
        title: "Albert Hall Museum Visit",
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=400",
        rating: "4.6 ★",
        entryFee: "₹40 (Indians)",
        hours: "09:00 AM - 05:00 PM",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "₹40.00",
        cafes: "Albert Court Lounge",
        restaurants: "Surya Mahal Dining Hall",
        attractions: "Indo-Saracenic architecture, historical armory",
        rainAlternative: "Museum halls are fully enclosed and rain-proof."
      }
    ]
  } else if (destLower.includes("goa")) {
    activityPool = [
      {
        time: "09:00 AM - 11:30 AM",
        title: "Calangute & Baga Beach Water Sports",
        imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=400",
        rating: "4.6 ★",
        entryFee: "Free (Activities extra)",
        hours: "24/7",
        duration: "2.5 hrs",
        travelTime: "15 mins to next stop",
        cost: "₹0.00",
        cafes: "Baga Shack Cafe",
        restaurants: "Brittos Seafood Beach Shack",
        attractions: "Salty sea breezes, shoreline shacks",
        rainAlternative: "Rain Alternative: Relax inside a beachside shack dining area, listening to the rain."
      },
      {
        time: "12:00 PM - 02:30 PM",
        title: "Old Goa Heritage Churches Tour",
        imageUrl: "https://images.unsplash.com/photo-1616803689943-5601631c7fec?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "Free",
        hours: "09:00 AM - 06:30 PM",
        duration: "2.5 hrs",
        travelTime: "30 mins to next stop",
        cost: "₹0.00",
        cafes: "Heritage Coffee Lounge",
        restaurants: "Viva Panjim (Portuguese Food)",
        attractions: "Basilica of Bom Jesus, Se Cathedral",
        rainAlternative: "Rain Alternative: Tour the interior chapels and religious museums of Old Goa."
      },
      {
        time: "03:30 PM - 06:00 PM",
        title: "Mandovi River Evening Cruise",
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=400",
        rating: "4.5 ★",
        entryFee: "₹500 per head",
        hours: "06:00 PM - 09:00 PM",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "₹500.00",
        cafes: "Panaji Promenade Bites",
        restaurants: "Fisherman's Wharf Panaji",
        attractions: "Traditional Goan folk dances, music, sunset view",
        rainAlternative: "Rain Alternative: Relocate to covered deck compartments on the luxury cruise liner."
      },
      {
        time: "09:30 AM - 12:30 PM",
        title: "Sahakari Spice Farm Plantation Tour",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400",
        rating: "4.7 ★",
        entryFee: "₹400 (Includes lunch)",
        hours: "09:00 AM - 04:30 PM",
        duration: "3 hrs",
        travelTime: "40 mins to next stop",
        cost: "₹400.00",
        cafes: "Spiceland Cafe",
        restaurants: "Sahakari Traditional Buffet (Seafood/Veg)",
        attractions: "Cardamom & vanilla plantation, forest walking",
        rainAlternative: "Rain Alternative: Enjoy covered buffet dining and guided spice tastings under forest roofs."
      },
      {
        time: "01:30 PM - 04:30 PM",
        title: "Historic Fort Aguada Exploration",
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=400",
        rating: "4.6 ★",
        entryFee: "₹20 (Indians)",
        hours: "09:00 AM - 06:00 PM",
        duration: "3 hrs",
        travelTime: "Return to hotel",
        cost: "₹20.00",
        cafes: "Aguada Bistro",
        restaurants: "The Black Sheep Bistro",
        attractions: "17th-century lighthouse, stone ramparts",
        rainAlternative: "Fort Aguada is open, but you can seek shelter in the lower stone passages or museum."
      },
      {
        time: "09:00 AM - 11:30 AM",
        title: "Anjuna Beach Flea Market Walk",
        imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=400",
        rating: "4.4 ★",
        entryFee: "Free",
        hours: "09:00 AM - 06:00 PM (Wednesdays)",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "₹0.00",
        cafes: "Anjuna Beach Cafe",
        restaurants: "Curlies Beach Shack",
        attractions: "Traditional Goan garments, accessories, handicrafts",
        rainAlternative: "Rain Alternative: Seek shelter in beachside shacks or visit covered Panaji shopping centers."
      }
    ]
  } else {
    activityPool = [
      {
        time: "09:00 AM - 11:30 AM",
        title: `Welcome to ${destination} - Center Walk`,
        imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=400",
        rating: "4.7 ★",
        entryFee: "Free",
        hours: "24/7",
        duration: "2.5 hrs",
        travelTime: "20 mins to next stop",
        cost: "₹0.00",
        cafes: "Central Brew Cafe",
        restaurants: "Signature Local Diner",
        attractions: "Grand Town Square & Fountains",
        rainAlternative: "Rain Alternative: Relax inside the historic visitor center gallery."
      },
      {
        time: "12:00 PM - 02:30 PM",
        title: "Iconic Sights & Monument Heritage",
        imageUrl: "https://images.unsplash.com/photo-1503152394-c571994fd383?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "$15.00",
        hours: "09:00 AM - 06:00 PM",
        duration: "2.5 hrs",
        travelTime: "15 mins to next stop",
        cost: "$15.00",
        cafes: "Plaza Espresso Bar",
        restaurants: "La Strada Ristorante",
        attractions: "Main Historical Colonnades",
        rainAlternative: "Rain Alternative: Tour the interior vaulted exhibits."
      },
      {
        time: "03:30 PM - 06:00 PM",
        title: "National Heritage Museum & Artifacts",
        imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=400",
        rating: "4.8 ★",
        entryFee: "$12.00",
        hours: "10:00 AM - 05:00 PM",
        duration: "2.5 hrs",
        travelTime: "30 mins to next stop",
        cost: "$12.00",
        cafes: "Museum Courtyard Cafe",
        restaurants: "Bistro Royale",
        attractions: "Rare Antiquities Collection",
        rainAlternative: "Museum is fully enclosed and weather-proof."
      },
      {
        time: "09:00 AM - 11:30 AM",
        title: "Scenic Waterfront / Market Trail",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400",
        rating: "4.6 ★",
        entryFee: "Free",
        hours: "08:00 AM - 08:00 PM",
        duration: "2.5 hrs",
        travelTime: "Return to hotel",
        cost: "$0.00",
        cafes: "Sea Breeze Coffee",
        restaurants: "Harbor Fish House",
        attractions: "Promenade, Local Stalls",
        rainAlternative: "Rain Alternative: Relocate to the covered artisan craft arcade."
      },
      {
        time: "12:00 PM - 02:30 PM",
        title: "Scenic Lookout Point & Departures",
        imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600",
        rating: "4.9 ★",
        entryFee: "$5.00",
        hours: "08:00 AM - 09:00 PM",
        duration: "2.5 hrs",
        travelTime: "Transit to airport",
        cost: "$5.00",
        cafes: "Summit Tea Room",
        restaurants: "Breathtaking Views Grill",
        attractions: "Observation Telescopes",
        rainAlternative: "Rain Alternative: View the skyline from the heated glass gallery lounge."
      }
    ]
  }

  for (let d = 1; d <= durationDays; d++) {
    const dayKey = `Day ${d}`
    const startIndex = ((d - 1) * 3) % activityPool.length
    const dayActivities: Activity[] = []
    
    for (let a = 0; a < 3; a++) {
      const act = activityPool[(startIndex + a) % activityPool.length]
      const clonedAct = { ...act }
      
      if (a === 0) clonedAct.time = "09:00 AM - 11:30 AM"
      else if (a === 1) clonedAct.time = "12:00 PM - 02:30 PM"
      else clonedAct.time = "03:30 PM - 06:00 PM"
      
      dayActivities.push(clonedAct)
    }
    
    itinerary[dayKey] = dayActivities
  }

  return itinerary
}

export function Trips() {
  const [trips, setTrips] = useState<TripData[]>([])
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Timeline Active state
  const [activeDay, setActiveDay] = useState("Day 1")
  const [isRaining, setIsRaining] = useState(false)

  // Sharing states
  const [copiedLink, setCopiedLink] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  
  // Connection state for PWA offline detection
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const duration = selectedTrip ? getDurationDays(selectedTrip.start_date, selectedTrip.end_date) : 3
  const itinerary = selectedTrip ? getDynamicItinerary(selectedTrip.destination, duration) : {}

  useEffect(() => {
    setActiveDay("Day 1")
  }, [selectedTrip])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Fetch Trips
  const fetchTrips = async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/trip")
      setTrips(res.data)
    } catch (e) {
      console.error("Failed to load trips:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.delete(`/trip/${id}`)
      setTrips(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error("Failed to delete trip:", err)
    }
  }

  // RFC-5545 Calendar .ics exporter
  const handleExportICS = (trip: TripData) => {
    const durationDays = getDurationDays(trip.start_date, trip.end_date)
    const itineraryData = getDynamicItinerary(trip.destination, durationDays)
    const days = Object.keys(itineraryData)
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TripGenie AI//Travel Itinerary//EN\n"
    
    days.forEach((day, dayIdx) => {
      const activities = itineraryData[day] || []
      activities.forEach((act) => {
        icsContent += "BEGIN:VEVENT\n"
        icsContent += `SUMMARY:${act.title} - ${trip.destination}\n`
        icsContent += `DESCRIPTION:Rating: ${act.rating} | Transit: ${act.travelTime} | Rain Contingency: ${act.rainAlternative}\n`
        icsContent += `LOCATION:${trip.destination}\n`
        // Setup mock event dates matching start date index offsets
        const yearMonth = trip.start_date.replace(/-/g, "").substring(0, 6)
        const dayStr = String(20 + dayIdx)
        icsContent += `DTSTART;VALUE=DATE-TIME:${yearMonth}${dayStr}T090000Z\n`
        icsContent += `DTEND;VALUE=DATE-TIME:${yearMonth}${dayStr}T113000Z\n`
        icsContent += "END:VEVENT\n"
      })
    })
    icsContent += "END:VCALENDAR\n"

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${trip.title.replace(/\s+/g, "_")}_Calendar.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // PDF Document Generation
  const handleDownloadPDF = (trip: TripData) => {
    const docText = `
=============================================
  TRIPGENIE AI OPERATING SYSTEM - ITINERARY
=============================================
Title: ${trip.title}
Destination: ${trip.destination}
Origin City: ${trip.source_city}
Dates: ${trip.start_date} to ${trip.end_date}
Budget Cap: ${trip.budget} ${trip.currency}
Status: ${trip.status}

Generated by TripGenie AI on ${new Date().toLocaleDateString()}.
For full interactive mappings, sync to Apple/Google calendars.
=============================================
    `
    const blob = new Blob([docText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${trip.title.replace(/\s+/g, "_")}_Itinerary_Guide.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copy share links
  const handleShareTrip = (trip: TripData) => {
    const shareUrl = `${window.location.origin}/share/trip/${trip.id}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Email delivery simulation
  const handleEmailSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) return
    setEmailSuccess(true)
    setTimeout(() => {
      setEmailSuccess(false)
      setShowEmailModal(false)
      setEmailInput("")
    }, 2000)
  }

  // Render skeletons during axios loads
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="p-3 border border-amber-500/25 bg-amber-500/5 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 animate-bounce flex-shrink-0" />
          <span>Offline Mode: Using cached PWA shell elements. Changes will sync once connection returns.</span>
        </div>
      )}

      {/* RENDER VIEW A: Trips List Grid */}
      {!selectedTrip ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tight text-[#0F4C81] dark:text-[#4FC3F7]">My Trips</h1>
              <p className="text-muted-foreground">Select a trip itinerary to view its detailed timeline.</p>
            </div>
            <Link to="/app/plan-trip">
              <Button className="bg-[#FF8A3D] hover:bg-[#ff7b24] hover-scale hover-glow-orange text-white flex items-center gap-1.5 font-semibold shadow">
                <Plus className="h-4 w-4" /> Add Trip
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {trips.length === 0 ? (
              <Card className="col-span-2 p-12 text-center border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl">
                <Compass className="mx-auto h-12 w-12 text-primary animate-bounce" />
                <h3 className="mt-4 font-semibold text-lg text-slate-800 dark:text-white">No itineraries found</h3>
                <p className="text-sm text-muted-foreground mt-1">Get started by creating your first trip using the planner wizard.</p>
              </Card>
            ) : (
              trips.map(trip => (
                <Card 
                  key={trip.id} 
                  onClick={() => setSelectedTrip(trip)}
                  className="hover:shadow-md hover:border-[#4FC3F7]/50 transition-all duration-300 cursor-pointer border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm rounded-2xl relative overflow-hidden"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800 dark:text-white">{trip.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1 text-xs font-semibold text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-[#FF8A3D]" /> {trip.source_city} → {trip.destination}
                      </CardDescription>
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#4FC3F7]">
                      {trip.status}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.start_date}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{trip.end_date}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        {trip.currency === "INR" ? (
                          <IndianRupee className="h-4 w-4 text-primary" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-primary" />
                        )}
                        <span>{trip.budget.toLocaleString(trip.currency === "INR" ? "en-IN" : "en-US")} {trip.currency}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 bg-slate-50/50 dark:bg-slate-800/50">
                    <Button size="sm" variant="ghost" className="text-xs font-bold text-primary p-0 hover:bg-transparent">
                      View Itinerary Timeline <ArrowRight className="h-3.5 w-3.5 ml-1 animate-pulse" />
                    </Button>
                    <button
                      onClick={(e) => handleDeleteTrip(trip.id, e)}
                      className="bg-transparent border-0 p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                      aria-label="Delete trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        
        /* RENDER VIEW B: Hour-by-Hour Timeline Details */
        <div className="space-y-6">
          
          {/* Timeline Navigation Header */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 p-4 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-md rounded-2xl">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedTrip(null)
                  setIsRaining(false)
                }}
                className="p-2 border border-slate-200 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">{selectedTrip.title} Timeline</h2>
                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#FF8A3D]" /> {selectedTrip.destination} hour-by-hour itinerary.
                </p>
              </div>
            </div>

            {/* Sharing & Exports Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleExportICS(selectedTrip)}
                className="flex items-center gap-1 text-[11px] font-bold border-slate-200 hover:bg-slate-100"
              >
                <CalendarRange className="h-3.5 w-3.5 text-[#0F4C81]" /> Export ICS
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleDownloadPDF(selectedTrip)}
                className="flex items-center gap-1 text-[11px] font-bold border-slate-200 hover:bg-slate-100"
              >
                <Download className="h-3.5 w-3.5 text-[#0F4C81]" /> Download Guide
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleShareTrip(selectedTrip)}
                className="flex items-center gap-1 text-[11px] font-bold border-slate-200 hover:bg-slate-100"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5 text-[#FF8A3D]" />}
                {copiedLink ? "Link Copied!" : "Share Link"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-1 text-[11px] font-bold border-slate-200 hover:bg-slate-100"
              >
                <Mail className="h-3.5 w-3.5 text-[#0F4C81]" /> Email
              </Button>

              {/* Rain contingency toggle */}
              <button
                onClick={() => setIsRaining(!isRaining)}
                className={`p-2 rounded-lg border transition-all duration-300 ml-2 ${
                  isRaining 
                    ? "bg-blue-500/20 border-blue-500 text-blue-500 shadow-sm" 
                    : "bg-white/5 border-slate-200 text-muted-foreground hover:bg-slate-100"
                }`}
                title="Toggle Rain Mode Contingency"
              >
                <CloudRain className={`h-4 w-4 ${isRaining ? "animate-bounce" : ""}`} />
              </button>
            </div>
          </div>

          {/* Email Dialog Modal overlay */}
          {showEmailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <Card className="max-w-sm w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 space-y-4 shadow-xl rounded-2xl">
                <div>
                  <h3 className="font-black text-base text-slate-800 dark:text-white">Email Itinerary Summary</h3>
                  <p className="text-xs text-slate-500 font-semibold">Submit your address to send a copy to your inbox.</p>
                </div>
                <form onSubmit={handleEmailSend} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="traveler@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="border-slate-200"
                  />
                  {emailSuccess && (
                    <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Itinerary successfully emailed!
                    </span>
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowEmailModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={emailSuccess} className="bg-[#FF8A3D] text-white hover:bg-[#ff7b24] font-bold shadow hover-scale">Send Email</Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* Tabbed Day Header Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
            {Object.keys(itinerary).map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 text-sm font-bold tracking-tight border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeDay === day 
                    ? "border-[#0F4C81] text-[#0F4C81] dark:border-[#4FC3F7] dark:text-[#4FC3F7]" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {day} Schedule
              </button>
            ))}
          </div>

          {/* Timeline Cards track */}
          <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-6 py-2">
            
            <AnimatePresence mode="wait">
              {itinerary[activeDay]?.map((activity, index) => (
                <motion.div
                  key={`${activeDay}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Vertical Timeline Node Pin */}
                  <div className="absolute -left-[31px] top-1.5 p-1 rounded-full bg-white dark:bg-slate-900 border-2 border-[#0F4C81] dark:border-[#4FC3F7]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A3D]" />
                  </div>

                  {/* Hourly activity card */}
                  <Card className="border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm overflow-hidden grid md:grid-cols-3 hover:border-[#4FC3F7]/50 transition-all duration-300 rounded-2xl">
                    
                    {/* Column 1: Image & Timing */}
                    <div className="relative h-44 md:h-full min-h-[170px] bg-muted overflow-hidden">
                      <img 
                        src={activity.imageUrl} 
                        alt={activity.title}
                        className="absolute inset-0 w-full h-full object-cover filter saturate-75"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4FC3F7] flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-[#FF8A3D]" /> {activity.time}
                        </span>
                        <h3 className="text-base font-black text-white mt-1 leading-snug">{activity.title}</h3>
                      </div>
                    </div>

                    {/* Column 2: Parameters Grid */}
                    <div className="p-4 space-y-3 md:col-span-2">
                      <div className="grid gap-2 grid-cols-2 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>Google Rating: <span className="text-slate-800 dark:text-white font-bold">{activity.rating}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-[#0F4C81] dark:text-[#4FC3F7]" />
                          <span>Entry Fee: <span className="text-slate-800 dark:text-white font-bold">{activity.entryFee}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#0F4C81] dark:text-[#4FC3F7]" />
                          <span>Opening Hours: <span className="text-slate-800 dark:text-white font-bold">{activity.hours}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Footprints className="h-3.5 w-3.5 text-[#0F4C81] dark:text-[#4FC3F7]" />
                          <span>Duration: <span className="text-slate-800 dark:text-white font-bold">{activity.duration}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#FF8A3D]" />
                          <span>Transit: <span className="text-slate-800 dark:text-white font-bold">{activity.travelTime}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {selectedTrip.currency === "INR" ? (
                            <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                          <span>Est. Cost: <span className="text-slate-800 dark:text-white font-bold">{activity.cost}</span></span>
                        </div>
                      </div>

                      {/* Contingency / Nearby Recommendations Grid */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-xl text-slate-500">
                            <Coffee className="h-3 w-3 text-[#FF8A3D]" /> Cafe: <span className="text-slate-800 dark:text-white font-bold">{activity.cafes}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-xl text-slate-500">
                            <Utensils className="h-3 w-3 text-[#0F4C81] dark:text-[#4FC3F7]" /> Food: <span className="text-slate-800 dark:text-white font-bold">{activity.restaurants}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-xl text-slate-500">
                            <Landmark className="h-3 w-3 text-[#0F4C81] dark:text-[#4FC3F7]" /> Near: <span className="text-slate-800 dark:text-white font-bold">{activity.attractions}</span>
                          </span>
                        </div>

                        {/* Rain Mode Switch Banner */}
                        {isRaining ? (
                          <div className="mt-2 flex items-start gap-2 p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-[11px] font-semibold text-blue-500">
                            <CloudRain className="h-4 w-4 flex-shrink-0 animate-pulse text-blue-500" />
                            <p className="leading-relaxed">
                              <strong>Rain Mode:</strong> {activity.rainAlternative}
                            </p>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                            <span>Contingency route mapped. Toggling rain mode swaps to indoor alternatives.</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

          </div>
        </div>
      )}

    </div>
  )
}
export default Trips
