"use client"

import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-8 right-8 z-40 p-3 rounded-full gold-shimmer text-accent-foreground shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <span className="relative z-10">{isDark ? <Sun size={20} /> : <Moon size={20} />}</span>
    </button>
  )
}
