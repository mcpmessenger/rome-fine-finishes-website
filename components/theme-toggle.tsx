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
      className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
