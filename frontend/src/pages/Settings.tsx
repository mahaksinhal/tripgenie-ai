import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Switch } from "@/components/ui/Switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Bell, Lock, Check } from "lucide-react"

export function Settings() {
  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [priceDrops, setPriceDrops] = useState(true)
  const [newsletters, setNewsletters] = useState(false)
  const [notifSuccess, setNotifSuccess] = useState(false)

  // Security password states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [secError, setSecError] = useState("")
  const [secSuccess, setSecSuccess] = useState(false)

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault()
    setNotifSuccess(true)
    setTimeout(() => setNotifSuccess(false), 2000)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setSecError("")
    setSecSuccess(false)

    if (newPassword !== confirmPassword) {
      setSecError("New passwords do not match.")
      return
    }

    if (newPassword.length < 6) {
      setSecError("Password must be at least 6 characters.")
      return
    }

    setSecSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => setSecSuccess(false), 2500)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Adjust notifications, platform security, and preferences.</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security & Login</TabsTrigger>
        </TabsList>

        {/* Notifications Tab Content */}
        <TabsContent value="notifications">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> Notification Dispatching
              </CardTitle>
              <CardDescription>Configure how and when TripGenie sends alerts to your email.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveNotifications}>
              <CardContent className="space-y-6">
                {notifSuccess && (
                  <div className="flex items-center justify-center gap-1.5 rounded-md bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-600 dark:text-green-400 font-semibold">
                    <Check className="h-4 w-4" /> Notification settings saved.
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifs">Email Itinerary Updates</Label>
                    <p className="text-xs text-muted-foreground">Get emails when Genie finishes generating itineraries.</p>
                  </div>
                  <Switch
                    id="email-notifs"
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <Label htmlFor="price-alerts">Price Drops Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get notified when flights/hotels in saved trips drop in price.</p>
                  </div>
                  <Switch
                    id="price-alerts"
                    checked={priceDrops}
                    onCheckedChange={setPriceDrops}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <Label htmlFor="newsletter">Monthly Inspiration & Offers</Label>
                    <p className="text-xs text-muted-foreground">Receive custom travel suggestions and coupon codes.</p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={newsletters}
                    onCheckedChange={setNewsletters}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border pt-4">
                <Button type="submit">Save Preferences</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab Content */}
        <TabsContent value="security">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> Credentials Update
              </CardTitle>
              <CardDescription>Keep your password updated to secure your travel account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                {secSuccess && (
                  <div className="flex items-center justify-center gap-1.5 rounded-md bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-600 dark:text-green-400 font-semibold">
                    <Check className="h-4 w-4" /> Password changed successfully.
                  </div>
                )}
                {secError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive-foreground">
                    {secError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="current-pw">Current Password</Label>
                  <Input
                    id="current-pw"
                    type="password"
                    value={currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-pw">New Password</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-pw">Confirm New Password</Label>
                  <Input
                    id="confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border pt-4">
                <Button type="submit">Update Password</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
