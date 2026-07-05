import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Button } from "@/components/ui/Button"
import { User, Mail, ShieldAlert, Check } from "lucide-react"

export function Profile() {
  const userString = localStorage.getItem("tripgenie-user")
  const initialUser = userString
    ? JSON.parse(userString)
    : { email: "traveler@tripgenie.ai", full_name: "Genie Traveler" }

  const [fullName, setFullName] = useState(initialUser.full_name)
  const [email, setEmail] = useState(initialUser.email)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(true)
    
    // Save updated credentials back to LocalStorage
    localStorage.setItem(
      "tripgenie-user",
      JSON.stringify({ email, full_name: fullName })
    )

    setTimeout(() => {
      setSuccess(false)
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Profile Details</h1>
        <p className="text-muted-foreground">Manage your credentials, login emails, and personal display.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Personal Profile Information</CardTitle>
          <CardDescription>Updates here will reflect across your travel itineraries.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-6">
            {success && (
              <div className="flex items-center justify-center gap-1.5 rounded-md bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-600 dark:text-green-400 font-semibold">
                <Check className="h-4 w-4" /> Profile saved successfully.
              </div>
            )}

            {/* Avatar Display Scaffold */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white shadow-md">
                {fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Display Photo</h4>
                <p className="text-xs text-muted-foreground">We fetch your Gravatar matching your email address.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="avatar">Custom Avatar URL (Optional)</Label>
              <Input
                id="avatar"
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Verify changes before saving.</span>
            </div>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
