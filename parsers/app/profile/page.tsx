"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { User, LogOut, Mail, Calendar } from "lucide-react"

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
    if (user) {
      setUsername(user.username)
    }
  }, [user, isLoading, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Profile</h1>

          <Card className="p-8 mb-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-6 border-t border-border pt-6">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input value={user.email} disabled />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </label>
                <Input value={new Date(user.createdAt).toLocaleDateString()} disabled />
              </div>

              <div className="flex gap-4 pt-4">
                <Button disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-2">Account Information</h3>
            <p className="text-sm text-muted-foreground">
              Your account is secure and all your bookmarks and favorites are saved locally on your device.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
