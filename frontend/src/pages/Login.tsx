import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Button } from "@/components/ui/Button"
import { Sparkles, Mail, Lock, User, Github, Loader2 } from "lucide-react"

// Helper function to safely parse server errors without throwing json parsing exceptions
async function handleResponseError(res: Response, defaultMsg: string): Promise<never> {
  const contentType = res.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    try {
      const errData = await res.json()
      throw new Error(errData.detail || defaultMsg)
    } catch {
      throw new Error(defaultMsg)
    }
  } else {
    try {
      const rawText = await res.text()
      throw new Error(rawText || defaultMsg)
    } catch {
      throw new Error(defaultMsg)
    }
  }
}

export function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  // Listen for OAuth success redirects on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauth = params.get("oauth")
    const status = params.get("status")

    if (oauth && status === "success") {
      const emailVal = `${oauth}@tripgenie.ai`
      const passwordVal = `oauth_${oauth}_pass`
      const nameVal = `${oauth.charAt(0).toUpperCase() + oauth.slice(1)} Traveler`

      const performOAuthLogin = async () => {
        setLoading(true)
        try {
          // 1. Try to register mock OAuth user in database (handles error if user already exists)
          await fetch("/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailVal, password: passwordVal, full_name: nameVal })
          })
          
          // 2. Perform real login to retrieve signed JWT
          const formDetails = new URLSearchParams()
          formDetails.append("username", emailVal)
          formDetails.append("password", passwordVal)

          const loginRes = await fetch("/api/v1/auth/login/access-token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formDetails
          })

          if (!loginRes.ok) {
            await handleResponseError(loginRes, "Failed to sign OAuth session.")
          }

          const tokenData = await loginRes.json()

          // 3. Save real signed credentials to localstorage
          localStorage.setItem("tripgenie-access-token", tokenData.access_token)
          localStorage.setItem("tripgenie-refresh-token", tokenData.refresh_token)
          localStorage.setItem(
            "tripgenie-user",
            JSON.stringify({ email: emailVal, full_name: nameVal })
          )

          navigate("/app/dashboard")
        } catch (err: any) {
          setError(err.message || "Failed to log in via OAuth.")
        } finally {
          setLoading(false)
        }
      }

      performOAuthLogin()
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Please fill out all fields.")
      setLoading(false)
      return
    }

    try {
      if (isRegister) {
        // Registration Flow
        const regRes = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName || "Genie Traveler" })
        })
        if (!regRes.ok) {
          await handleResponseError(regRes, "Registration failed.")
        }
      }

      // Login Flow: Post URL-encoded form data to /auth/login/access-token
      const formDetails = new URLSearchParams()
      formDetails.append("username", email)
      formDetails.append("password", password)

      let loginRes = await fetch("/api/v1/auth/login/access-token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formDetails
      })

      // If logging in failed and we're on the login tab, let's try to automatically register them in case they don't exist yet!
      if (!loginRes.ok && !isRegister) {
        const autoReg = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName || "Genie Traveler" })
        })
        if (autoReg.ok) {
          loginRes = await fetch("/api/v1/auth/login/access-token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formDetails
          })
        }
      }

      if (!loginRes.ok) {
        await handleResponseError(loginRes, "Incorrect email or password.")
      }

      const tokenData = await loginRes.json()

      // Save valid signed JWT tokens
      localStorage.setItem("tripgenie-access-token", tokenData.access_token)
      localStorage.setItem("tripgenie-refresh-token", tokenData.refresh_token)
      localStorage.setItem(
        "tripgenie-user",
        JSON.stringify({ email, full_name: fullName || "Genie Traveler" })
      )

      navigate("/app/dashboard")

    } catch (err: any) {
      setError(err.message || "Authentication failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: string) => {
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/auth/${provider}/login`)
      if (!res.ok) {
        await handleResponseError(res, "Failed to initialize OAuth sequence.")
      }
      const data = await res.json()
      if (data.url) {
        // Redirect browser to URL specified in JSON response
        window.location.href = data.url
      } else {
        throw new Error("Redirect target omitted in JSON response.")
      }
    } catch (e: any) {
      setError(e.message || "Failed to initialize OAuth sequence.")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFBFC] dark:bg-slate-950 px-4">
      {/* Decorative Sunrise Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-[#4FC3F7]/10 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[#FF8A3D]/10 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-100 z-10 shadow-xl rounded-2xl animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#4FC3F7]">
            <Sparkles className="h-6 w-6 text-[#FF8A3D] animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
            {isRegister ? "Create an Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-semibold text-xs">
            {isRegister
               ? "Join TripGenie AI to start orchestrating custom travel plans."
               : "Access your dashboard to view upcoming trips and saved routes."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive font-bold leading-normal">
                {error}
              </div>
            )}

            {isRegister && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                    className="pl-9 bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus-visible:ring-[#0F4C81] rounded-xl"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus-visible:ring-[#0F4C81] rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="pl-9 bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus-visible:ring-[#0F4C81] rounded-xl"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF8A3D] hover:bg-[#ff7b24] hover-scale hover-glow-orange text-white shadow font-bold py-5 rounded-xl transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
              ) : isRegister ? "Sign Up" : "Log In"}
            </Button>

            {/* Divider */}
            <div className="relative flex py-1 w-full items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleOAuth("google")}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover-scale font-bold"
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleOAuth("github")}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover-scale font-bold"
              >
                <Github className="mr-2 h-4 w-4 text-slate-700 dark:text-slate-200" />
                GitHub
              </Button>
            </div>

            <div className="text-center text-xs mt-2 text-slate-500 font-semibold">
              {isRegister ? "Already have an account?" : "New to TripGenie AI?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#0F4C81] dark:text-[#4FC3F7] hover:underline font-bold bg-transparent border-0 cursor-pointer"
              >
                {isRegister ? "Log In" : "Create one now"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
export default Login
