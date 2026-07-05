import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { 
  Sparkles, MapPin, Star, ArrowRight, Quote
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

export function Landing() {
  const stats = [
    { value: "15K+", label: "Trips Planned", desc: "Across 140+ countries" },
    { value: "99.8%", label: "Satisfaction", desc: "Top-tier traveler rating" },
    { value: "12+", label: "AI Agents", desc: "Working concurrently" },
    { value: "24/7", label: "Agent Audits", desc: "Live weather/flight sync" }
  ]

  const destinations = [
    {
      city: "Goa",
      country: "India",
      image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600",
      rating: "4.8",
      desc: "Beautiful sandy beaches, Portuguese heritage, and vibrant coastal dining."
    },
    {
      city: "Jaipur",
      country: "India",
      image: "https://images.unsplash.com/photo-1477584308802-e9c3788ee12d?q=80&w=600",
      rating: "4.9",
      desc: "Royal fortresses, astronomical observatories, and rich Rajasthani heritage."
    },
    {
      city: "Kyoto",
      country: "Japan",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600",
      rating: "4.9",
      desc: "Traditional tea ceremonies, cherry blossoms, and historic bamboo groves."
    }
  ]

  const testimonials = [
    {
      name: "Sophia Chen",
      role: "Solo Backpacker",
      quote: "The weather rain-contingency feature saved my Tokyo trip! When it poured, Genie automatically switched to indoor museum slots.",
      avatar: "SC"
    },
    {
      name: "Marcus Vance",
      role: "Family Traveler",
      quote: "Managing flight rates, stays, and budget allocations in one workspace was so refreshing. It's the ultimate travel operating system.",
      avatar: "MV"
    }
  ]

  // Micro animations stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Sticky Premium Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[#FF8A3D] animate-pulse" />
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#0F4C81] to-[#4FC3F7] bg-clip-text text-transparent">
            TripGenie AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="font-bold text-sm">Sign In</Button>
          </Link>
          <Link to="/login">
            <Button className="bg-[#FF8A3D] hover:bg-[#ff7b24] text-white hover-scale hover-glow-orange font-bold text-sm shadow">
              Plan a New Trip
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center overflow-hidden">
        <div className="lg:col-span-7 space-y-6 text-left">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#4FC3F7] text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="h-3.5 w-3.5" /> Next-Generation Itineraries
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-tight"
          >
            Your Journey Begins at{" "}
            <span className="bg-gradient-to-r from-[#FF8A3D] to-[#4FC3F7] bg-clip-text text-transparent">
              Sunrise.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl font-medium max-w-xl leading-relaxed"
          >
            TripGenie's parallel AI agent engine maps out flight rates, topstays, local dining, and hourly weather forecasts to compile an optimized travel plan in seconds.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/login">
              <Button size="lg" className="bg-[#FF8A3D] hover:bg-[#ff7b24] text-white hover-scale hover-glow-orange font-bold text-base px-8 py-6 rounded-2xl shadow-md">
                Launch Itinerary Wizard <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Floating cards graphics */}
        <div className="lg:col-span-5 relative h-96 flex items-center justify-center">
          <div className="absolute inset-0 bg-sunrise-gradient rounded-full filter blur-3xl pointer-events-none" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative p-6 max-w-xs w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 space-y-4 hover-scale"
          >
            <div className="h-44 bg-cover bg-center rounded-2xl filter saturate-75" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1477584308802-e9c3788ee12d?q=80&w=400')" }} />
            <div>
              <span className="text-[10px] font-bold text-[#FF8A3D] uppercase tracking-widest">Active Plan</span>
              <h3 className="text-base font-black text-slate-800 dark:text-white mt-1">Heritage Tour of Jaipur</h3>
              <p className="text-xs text-slate-500 mt-0.5">4-Day Custom Itinerary</p>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#FF8A3D]" /> Jaipur, IN</span>
              <span className="text-emerald-500 font-extrabold">₹15,000</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Statistics Counter Banner */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#0F4C81] dark:text-[#4FC3F7]">{stat.value}</span>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{stat.label}</p>
              <p className="text-[11px] text-slate-500">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Destinations Showcase */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Explore Trending Sights</h2>
          <p className="text-slate-500 text-sm font-semibold">
            Genie agents parse live places metadata to recommend local cafes, hotels, and photo spots matching your style.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {destinations.map((dest, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="bg-white dark:bg-slate-800/40 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300 flex flex-col text-left group"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={dest.image} 
                  alt={dest.city} 
                  className="w-full h-full object-cover filter saturate-75 group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1 shadow-sm">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {dest.rating}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-[#FF8A3D]" /> {dest.city}, {dest.country}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{dest.desc}</p>
                </div>
                <Link to="/login" className="pt-2">
                  <Button size="sm" variant="ghost" className="text-[#0F4C81] dark:text-[#4FC3F7] p-0 font-bold hover:bg-transparent">
                    Plan this Route <ArrowRight className="h-3.5 w-3.5 ml-1 animate-pulse" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Customer Testimonials Carousel */}
      <section className="bg-slate-100/50 dark:bg-slate-800/20 border-t border-slate-200/50 dark:border-slate-800/50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Loved by AI-First Travelers</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real stories from the road</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((test, idx) => (
              <Card key={idx} className="p-6 border-slate-200/50 dark:border-slate-800/50 text-left bg-white dark:bg-slate-800/40 relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
                <CardContent className="space-y-4 p-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                    "{test.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-[#0F4C81]/15 text-[#0F4C81] dark:text-[#4FC3F7] flex items-center justify-center font-bold text-sm">
                      {test.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{test.name}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{test.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Immersive CTA Footer Banner */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-sunrise-gradient opacity-30 pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Plan Your Next Travel Adventure?
          </h2>
          <p className="text-slate-500 text-sm font-semibold max-w-lg mx-auto leading-relaxed">
            Register your travel dates, target budgets, and accommodation parameters. Let Genie AI orchestrate the rest.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-[#FF8A3D] hover:bg-[#ff7b24] text-white hover-scale hover-glow-orange font-bold text-base px-8 py-6 rounded-2xl shadow-md">
              Plan My Itinerary Now
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
export default Landing
