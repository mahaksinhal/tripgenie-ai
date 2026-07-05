import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { Card, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import { Autocomplete } from "@/components/ui/Autocomplete"
import { MissionControl } from "@/components/ui/MissionControl"
import { 
  ArrowRight, ArrowLeft, Compass, Sparkles, Plane, ShieldAlert,
  Loader2, CheckCircle2, UserCheck, Accessibility, HeartPulse, Sparkle
} from "lucide-react"

// Define Zod Validation Schema
const wizardSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  source_city: z.string().min(1, "Source city is required"),
  destination: z.string().min(1, "Destination is required"),
  start_date: z.string().min(1, "Departure date is required"),
  end_date: z.string().min(1, "Return date is required"),
  flexible_dates: z.boolean(),
  
  adults: z.number().min(1, "At least 1 adult is required").int(),
  children: z.number().min(0, "Guests count cannot be negative").int(),
  senior_citizens: z.number().min(0, "Guests count cannot be negative").int(),
  budget: z.number().min(0, "Budget must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
  
  travel_style: z.string().min(1, "Travel style is required"),
  transportation_preference: z.string().min(1, "Transportation is required"),
  food_preference: z.string().min(1, "Food preference is required"),
  hotel_preference: z.string().min(1, "Hotel preference is required"),
  
  accessibility: z.string(),
  medical_needs: z.string(),
  activities: z.array(z.string()).min(1, "Select at least one activity"),
  
  passport_country: z.string().min(1, "Passport country is required"),
  nationality: z.string().min(1, "Nationality is required"),
  special_requests: z.string()
}).refine(data => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end >= start
}, {
  message: "Return date must be on or after departure date",
  path: ["end_date"]
})

type WizardFormValues = z.infer<typeof wizardSchema>

const DEFAULT_FORM_VALUES: WizardFormValues = {
  title: "",
  source_city: "Mumbai",
  destination: "Goa",
  start_date: "",
  end_date: "",
  flexible_dates: false,
  adults: 2,
  children: 0,
  senior_citizens: 0,
  budget: 35000,
  currency: "INR",
  travel_style: "Explorer",
  transportation_preference: "Flight",
  food_preference: "Vegetarian",
  hotel_preference: "Hotel",
  accessibility: "None",
  medical_needs: "None",
  activities: ["Sightseeing"],
  passport_country: "India",
  nationality: "Indian",
  special_requests: ""
}

const ACTIVITIES_LIST = [
  "Sightseeing", "Outdoors & Hiking", "Museums & Art Galleries", 
  "Beaches & Water Sports", "Food Tasting & Culinary", "Shopping", 
  "Nightlife", "Relaxation & Spa", "Theme Parks", "Local Festivals"
]

export function TripWizard() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isDraftRestored, setIsDraftRestored] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [wizardData, setWizardData] = useState<any>(null)
  
  const navigate = useNavigate()

  // Load draft values if they exist in LocalStorage
  const getInitialValues = (): WizardFormValues => {
    const draft = localStorage.getItem("tripgenie-wizard-draft")
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        return parsed
      } catch (e) {
        return DEFAULT_FORM_VALUES
      }
    }
    return DEFAULT_FORM_VALUES
  }

  const { register, control, handleSubmit, watch, trigger, formState: { errors } } = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: getInitialValues()
  })

  // Set visual cue that a draft was loaded
  useEffect(() => {
    const draft = localStorage.getItem("tripgenie-wizard-draft")
    if (draft) {
      setIsDraftRestored(true)
      // Hide feedback cue after 4 seconds
      const timer = setTimeout(() => setIsDraftRestored(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Watch values to execute Autosave
  const watchedValues = watch()
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      localStorage.setItem("tripgenie-wizard-draft", JSON.stringify(watchedValues))
    }, 1000) // Debounce autosave updates by 1 second

    return () => clearTimeout(debounceTimer)
  }, [watchedValues])

  const handleNext = async () => {
    // Validate current step fields before going forward
    let fieldsToValidate: Array<keyof WizardFormValues> = []
    
    if (step === 1) {
      fieldsToValidate = ["title", "source_city", "destination", "start_date", "end_date", "flexible_dates"]
    } else if (step === 2) {
      fieldsToValidate = ["adults", "children", "senior_citizens", "budget", "currency"]
    } else if (step === 3) {
      fieldsToValidate = ["travel_style", "transportation_preference", "food_preference", "hotel_preference"]
    } else if (step === 4) {
      fieldsToValidate = ["accessibility", "medical_needs", "activities"]
    } else if (step === 5) {
      fieldsToValidate = ["passport_country", "nationality", "special_requests"]
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: WizardFormValues) => {
    setIsSubmitting(true)
    try {
      // Structure nested preference object matching Backend expected schema
      const payload = {
        title: data.title,
        source_city: data.source_city,
        destination: data.destination,
        start_date: data.start_date,
        end_date: data.end_date,
        flexible_dates: data.flexible_dates,
        budget: data.budget,
        currency: data.currency,
        status: "planned",
        preferences: {
          adults: data.adults,
          children: data.children,
          senior_citizens: data.senior_citizens,
          travel_style: data.travel_style,
          pace: "Moderate", // default pace
          transportation_preference: data.transportation_preference,
          food_preference: data.food_preference,
          hotel_preference: data.hotel_preference,
          accessibility: data.accessibility,
          medical_needs: data.medical_needs,
          activities: data.activities,
          passport_country: data.passport_country,
          nationality: data.nationality,
          special_requests: data.special_requests
        }
      }

      setWizardData(payload)
      setIsGenerating(true)
    } catch (err) {
      console.error("Failed to prepare trip:", err)
      setIsSubmitting(false)
    }
  }

  const progressPercentage = (step / 5) * 100

  if (isGenerating && wizardData) {
    return (
      <MissionControl
        formData={wizardData}
        onComplete={(_tripId) => {
          localStorage.removeItem("tripgenie-wizard-draft")
          setSubmitSuccess(true)
          setTimeout(() => {
            navigate("/app/trips")
          }, 1500)
        }}
        onCancel={() => {
          setIsGenerating(false)
          setIsSubmitting(false)
        }}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-[#0F4C81] dark:text-[#4FC3F7]">
          Plan Your Next Adventure <Sparkles className="h-6 w-6 text-[#FF8A3D] animate-pulse" />
        </h1>
        <p className="text-slate-500 font-semibold text-sm">Genie multi-step builder details your route, accommodation and requirements.</p>
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
          <span>Step {step} of 5</span>
          <span className="text-[#FF8A3D]">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            style={{ width: `${progressPercentage}%` }} 
            className="h-full bg-gradient-to-r from-[#FF8A3D] to-[#4FC3F7] rounded-full transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Draft restoration toast banner */}
      {isDraftRestored && (
        <div className="flex items-center gap-2 rounded-md bg-accent/60 border border-primary/20 px-4 py-2.5 text-xs font-semibold text-primary animate-fade-in shadow-sm">
          <Sparkle className="h-4 w-4 text-primary animate-spin" />
          <span>Resumed draft details from autosave.</span>
        </div>
      )}

      {/* Card Wizard Form Wrapper */}
      <Card className="shadow-lg relative overflow-hidden transition-all duration-300">
        
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <span className="font-semibold text-sm">Saving your adventure to TripGenie...</span>
          </div>
        )}

        {/* Success Overlay */}
        {submitSuccess && (
          <div className="absolute inset-0 bg-background z-50 flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="h-14 w-14 text-green-500 animate-bounce" />
            <span className="font-bold text-lg">Itinerary Created!</span>
            <p className="text-xs text-muted-foreground">Redirecting to your trips dashboard...</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* STEP 1: Flight Route & Dates */}
          {step === 1 && (
            <div className="space-y-4 p-6">
              <h3 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" /> 1. Route & Dates
              </h3>
              
              <div className="space-y-1.5">
                <Label htmlFor="title">Trip Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Paris Summer Getaway" 
                  {...register("title")} 
                />
                {errors.title && <p className="text-xs text-destructive font-medium">{errors.title.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="source_city">Departing From (Source City)</Label>
                  <Controller
                    name="source_city"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search source city..."
                      />
                    )}
                  />
                  {errors.source_city && <p className="text-xs text-destructive font-medium">{errors.source_city.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="destination">Destination City</Label>
                  <Controller
                    name="destination"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search destination city..."
                      />
                    )}
                  />
                  {errors.destination && <p className="text-xs text-destructive font-medium">{errors.destination.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="start_date">Departure Date</Label>
                  <Input id="start_date" type="date" {...register("start_date")} />
                  {errors.start_date && <p className="text-xs text-destructive font-medium">{errors.start_date.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end_date">Return Date</Label>
                  <Input id="end_date" type="date" {...register("end_date")} />
                  {errors.end_date && <p className="text-xs text-destructive font-medium">{errors.end_date.message}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border mt-2">
                <div className="space-y-1">
                  <Label htmlFor="flexible_dates">Flexible Dates</Label>
                  <p className="text-xs text-muted-foreground">Check if your travel dates are flexible by +/- 3 days.</p>
                </div>
                <Controller
                  name="flexible_dates"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="flexible_dates"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Guests & Budget */}
          {step === 2 && (
            <div className="space-y-4 p-6">
              <h3 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> 2. Travelers & Budget
              </h3>

              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="adults">Adults (18+)</Label>
                  <Input 
                    id="adults" 
                    type="number" 
                    {...register("adults", { valueAsNumber: true })} 
                  />
                  {errors.adults && <p className="text-xs text-destructive font-medium">{errors.adults.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="children">Children (0-17)</Label>
                  <Input 
                    id="children" 
                    type="number" 
                    {...register("children", { valueAsNumber: true })} 
                  />
                  {errors.children && <p className="text-xs text-destructive font-medium">{errors.children.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seniors">Seniors (65+)</Label>
                  <Input 
                    id="seniors" 
                    type="number" 
                    {...register("senior_citizens", { valueAsNumber: true })} 
                  />
                  {errors.senior_citizens && <p className="text-xs text-destructive font-medium">{errors.senior_citizens.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="budget">Total Estimated Budget</Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    {...register("budget", { valueAsNumber: true })} 
                  />
                  {errors.budget && <p className="text-xs text-destructive font-medium">{errors.budget.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    {...register("currency")}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="USD" className="bg-popover text-foreground">USD ($)</option>
                    <option value="EUR" className="bg-popover text-foreground">EUR (€)</option>
                    <option value="GBP" className="bg-popover text-foreground">GBP (£)</option>
                    <option value="JPY" className="bg-popover text-foreground">JPY (¥)</option>
                    <option value="CAD" className="bg-popover text-foreground">CAD ($)</option>
                  </select>
                  {errors.currency && <p className="text-xs text-destructive font-medium">{errors.currency.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Accommodation & Logistics */}
          {step === 3 && (
            <div className="space-y-4 p-6">
              <h3 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" /> 3. Style & Comfort
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="travel_style">Travel Style</Label>
                  <select
                    id="travel_style"
                    {...register("travel_style")}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="Explorer">Explorer (Moderate / Active)</option>
                    <option value="Backpacker">Backpacker (Budget / Social)</option>
                    <option value="Luxury">Luxury (Premium / Relaxed)</option>
                    <option value="Business">Business (Fast / Productive)</option>
                  </select>
                  {errors.travel_style && <p className="text-xs text-destructive font-medium">{errors.travel_style.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="transportation">Transportation Preference</Label>
                  <select
                    id="transportation"
                    {...register("transportation_preference")}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="Flight">Flights (Default)</option>
                    <option value="Train">Trains & Rail</option>
                    <option value="Rental Car">Rental Car</option>
                    <option value="Public Transit">Public Transportation</option>
                  </select>
                  {errors.transportation_preference && <p className="text-xs text-destructive font-medium">{errors.transportation_preference.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="food_preference">Food Preference</Label>
                  <select
                    id="food_preference"
                    {...register("food_preference")}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="Vegetarian">Vegetarian (Pure Veg)</option>
                    <option value="Jain">Jain (Pure Veg, no root vegetables)</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="No Restrictions">No Restrictions (Any)</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                  </select>
                  {errors.food_preference && <p className="text-xs text-destructive font-medium">{errors.food_preference.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hotel_preference">Accommodation Type</Label>
                  <select
                    id="hotel_preference"
                    {...register("hotel_preference")}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="Hotel">Standard Hotel</option>
                    <option value="Hostel">Backpacker Hostel</option>
                    <option value="Airbnb">Apartment / Airbnb</option>
                    <option value="Resort">Resort & Spa</option>
                    <option value="Villa">Private Villa</option>
                  </select>
                  {errors.hotel_preference && <p className="text-xs text-destructive font-medium">{errors.hotel_preference.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Accessibility, Health & Activities */}
          {step === 4 && (
            <div className="space-y-4 p-6">
              <h3 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" /> 4. Health & Activities
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="accessibility" className="flex items-center gap-1.5">
                    Accessibility Needs
                  </Label>
                  <Input 
                    id="accessibility" 
                    placeholder="e.g. Wheelchair access, elevator" 
                    {...register("accessibility")} 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="medical" className="flex items-center gap-1.5">
                    <HeartPulse className="h-3.5 w-3.5 text-destructive" /> Medical Needs
                  </Label>
                  <Input 
                    id="medical" 
                    placeholder="e.g. Dialysis access, refrigeration for insulin" 
                    {...register("medical_needs")} 
                  />
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <Label>Travel Activities (Select at least one)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {ACTIVITIES_LIST.map(act => (
                    <Controller
                      key={act}
                      name="activities"
                      control={control}
                      render={({ field }) => {
                        const isChecked = field.value?.includes(act)
                        return (
                          <label className="flex items-center gap-2 rounded-md border border-border p-2.5 hover:bg-accent/40 cursor-pointer text-xs transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const newValue = isChecked
                                  ? field.value.filter((v: string) => v !== act)
                                  : [...field.value, act]
                                field.onChange(newValue)
                              }}
                              className="rounded border-input text-primary focus:ring-ring h-4 w-4"
                            />
                            <span>{act}</span>
                          </label>
                        )
                      }}
                    />
                  ))}
                </div>
                {errors.activities && <p className="text-xs text-destructive font-medium mt-1">{errors.activities.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 5: Travel Documents & Special Requests */}
          {step === 5 && (
            <div className="space-y-4 p-6">
              <h3 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> 5. Documentation & Requests
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="passport">Passport Country</Label>
                  <Input 
                    id="passport" 
                    placeholder="e.g. United States" 
                    {...register("passport_country")} 
                  />
                  {errors.passport_country && <p className="text-xs text-destructive font-medium">{errors.passport_country.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input 
                    id="nationality" 
                    placeholder="e.g. American" 
                    {...register("nationality")} 
                  />
                  {errors.nationality && <p className="text-xs text-destructive font-medium">{errors.nationality.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="requests">Special Requests / Custom Notes</Label>
                <textarea
                  id="requests"
                  rows={4}
                  placeholder="Tell us about specific flight constraints, seat choices or special anniversaries..."
                  {...register("special_requests")}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          {/* Dynamic AI Tip Panel */}
          <div className="mx-6 mb-6 p-4 rounded-xl bg-[#0F4C81]/5 border border-[#0F4C81]/10 text-slate-700 dark:text-slate-200 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-[#FF8A3D] shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#0F4C81] dark:text-[#4FC3F7] font-poppins">Genie Advisor Suggestions</span>
              <p className="text-xs font-semibold leading-relaxed">
                {step === 1 && "Genie Suggestion: Traveling in shoulder seasons (May/Sept) reduces accommodation and flight costs by up to 25% while maintaining ideal weather conditions."}
                {step === 2 && "Genie Suggestion: Selecting a moderate budget allows the agent to reserve boutique hotels and include high-speed rail passes for intercity transits."}
                {step === 3 && "Genie Suggestion: The 'Explorer' travel style schedules a balanced mix of cultural landmarks and hidden local dining options."}
                {step === 4 && "Genie Suggestion: If you specify medical or accessibility needs, our Route Agent automatically prioritizes low-barrier access walking trails."}
                {step === 5 && "Genie Suggestion: Entering your passport country allows the Visa Agent to query the latest consular API for immediate travel Advisory status."}
              </p>
            </div>
          </div>

          {/* Wizard Navigation Footer */}
          <CardFooter className="flex items-center justify-between border-t border-border p-6 bg-background/50">
            <div>
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
            </div>

            <div>
              {step < 5 ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                  className="flex items-center gap-1.5"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit"
                  className="bg-[#FF8A3D] hover:bg-[#ff7b24] hover-scale hover-glow-orange flex items-center gap-1.5 font-semibold text-white shadow"
                >
                  <Sparkles className="h-4 w-4" /> Save Travel Plan
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
