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
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group"
      aria-label="Toggle theme"
      style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}
    >
      <span className="absolute inset-0 gold-shimmer opacity-30 group-hover:opacity-50 transition-opacity"></span>
      <span className="relative z-10">{isDark ? <Sun size={20} /> : <Moon size={20} />}</span>
    </button>
  )
}
