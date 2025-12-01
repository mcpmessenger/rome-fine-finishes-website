"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Introduction from "@/components/introduction"
import ServiceCards from "@/components/service-cards"
import Reviews from "@/components/reviews"
import Footer from "@/components/footer"
import ThemeToggle from "@/components/theme-toggle"

export default function Home() {
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
      <Hero />
      <Introduction />
      <ServiceCards />
      <Reviews />
      <Footer />
      {/* Hidden SEO Keywords Section */}
      <div className="sr-only" aria-hidden="true">
        <p>
          Paint Specialists, Skilled Craftsman, Hand Crafted, Factory Finish, Flawless Finish, Curated Space, Paint, Painting, Painter, Paint Lady, Paint Guy, The Paint Lady, The Paint Guy, Cabinets, Cabinet Painting, Cabinet Finishing, Cabinet Refinishing, Cabinet Refacing, Refacing, Cabinet Paint, Cabinet Painter, Paint for Cabinets, Painting on Cabinets, Painted Cabinets, White Cabinets, Black Cabinets, Stained Cabinets, Cabinet Colors, Cabinet Design, Kitchen Cabinets, Bathroom Cabinets, Built in cabinets, Fireplace Cabinets, Oak Cabinets, Maple Cabinets, Interior painting, Wall painting, Ceiling painting, Trim painting, Door painting, Interior door painting, Interior wall painting, Front door painting, Exterior door painting, Crown molding painting, Wall Painter, Ceiling Painter, Trim Painter, Door Painter, Interior Painter, Exterior Painter
        </p>
      </div>
    </div>
  )
}
