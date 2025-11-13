"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import Image from "next/image"

export default function Navigation({ isDark }: { isDark: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "#cabinetry", label: "Cabinetry" },
    { href: "#decks", label: "Decks" },
    { href: "#interiors", label: "Interiors" },
    { href: "#reviews", label: "Reviews" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/main-20logo-1.jpg"
              alt="Rome Fine Finishes"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-serif font-bold text-lg hidden sm:inline text-foreground group-hover:text-accent transition-colors">
              Rome Fine Finishes
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-accent transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="https://romefinefinishes.dripjobs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block px-6 py-2 bg-foreground text-background rounded font-medium hover:opacity-90 transition-opacity"
          >
            Schedule Estimate
          </a>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-muted rounded transition-colors">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-foreground hover:bg-muted rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://romefinefinishes.dripjobs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 bg-foreground text-background rounded font-medium hover:opacity-90 transition-opacity"
            >
              Schedule Estimate
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
