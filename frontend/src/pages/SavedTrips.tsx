import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Bookmark, Compass, DollarSign, IndianRupee, Trash2, Calendar } from "lucide-react"

interface SavedTrip {
  id: string
  title: string
  destination: string
  budget: number
  currency: string
  description: string
}

export function SavedTrips() {
  const [savedList, setSavedList] = useState<SavedTrip[]>([
    { id: "s1", title: "Goa Beach Resort Escape", destination: "Goa, India", budget: 25000, currency: "INR", description: "A beautiful 4-day escape to beachside resorts, spice plantations, and historic forts." },
    { id: "s2", title: "Jaipur Royal Heritage Route", destination: "Jaipur, India", budget: 15000, currency: "INR", description: "Explore the Hawa Mahal, Amer Fort Mirror Hall, and local bazaars with traditional dining." },
    { id: "s3", title: "Maldives Luxury Overwater Stay", destination: "Maldives", budget: 120000, currency: "INR", description: "Private water villas, guided snorkeling sessions, and luxury dining by the sea." }
  ])

  const handleRemove = (id: string) => {
    setSavedList(savedList.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Saved Trips</h1>
        <p className="text-muted-foreground">Keep track of curated recommendations from your chat interactions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedList.length === 0 ? (
          <Card className="col-span-full p-12 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground animate-bounce" />
            <h3 className="mt-4 font-semibold text-lg">No saved trips</h3>
            <p className="text-sm text-muted-foreground mt-1">Bookmark trip offers directly from your Genie chats.</p>
          </Card>
        ) : (
          savedList.map(trip => (
            <Card key={trip.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="relative">
                <CardTitle className="text-base font-bold pr-6">{trip.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Compass className="h-3.5 w-3.5 text-primary" /> {trip.destination}
                </CardDescription>
                <button
                  onClick={() => handleRemove(trip.id)}
                  className="absolute top-6 right-6 bg-transparent border-0 p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {trip.description}
                </p>
                <div className="flex items-center gap-1.5">
                  {trip.currency === "INR" ? (
                    <IndianRupee className="h-4 w-4 text-primary" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-bold text-foreground">
                    {trip.currency === "INR" ? "₹" : "$"}
                    {trip.budget.toLocaleString(trip.currency === "INR" ? "en-IN" : "en-US")}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border pt-3 flex gap-2 w-full">
                <Button size="sm" className="w-full flex items-center justify-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Book Itinerary
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
