"use client"

import Navigation from "@/components/navigation"
import ThemeToggle from "@/components/theme-toggle"
import Footer from "@/components/footer"
import VirtualDesignAssistant from "@/components/virtual-design-assistant/VirtualDesignAssistant"
import { useState, useEffect } from "react"

export default function VirtualDesignAssistantPage() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("rome-theme")
    const isDarkMode =
      savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(isDarkMode)
    updateTheme(isDarkMode)
  }, [])

  const updateTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem("rome-theme", newTheme ? "dark" : "light")
    updateTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation isDark={isDark} />
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      <main className="pt-24 pb-12">
        <VirtualDesignAssistant />
      </main>
      <Footer />
    </div>
  )
}

