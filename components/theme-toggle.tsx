"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only render after hydration to prevent server/client mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9 bg-transparent">
        <div className="w-4 h-4" /> {/* Placeholder to maintain layout */}
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="w-9 h-9 bg-transparent">
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}