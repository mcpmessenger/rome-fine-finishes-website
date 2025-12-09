"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import Image from "next/image"

export default function Navigation({ isDark }: { isDark: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "#cabinet-refinishing", label: "Cabinetry" },
    { href: "#decks", label: "Decks" },
    { href: "#interiors", label: "Interiors" },
    { href: "#furniture-restoration", label: "Furniture" },
    { href: "#reviews", label: "Reviews" },
    { href: "#about-us", label: "About Us" },
    { href: "/virtual-design-assistant", label: "Preview" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-white backdrop-blur border-b-2 border-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Untitled design (27).png"
              alt="Rome Fine Finishes logo"
              width={200}
              height={80}
              className="h-14 w-auto sm:h-16 lg:h-20"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-900 dark:text-gray-900 hover:text-accent transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-900 dark:text-gray-900 hover:text-accent transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="https://romefinefinishes.dripjobs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block px-6 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded font-medium hover:opacity-90 transition-opacity"
          >
            Schedule Estimate
          </a>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded transition-colors text-gray-900 dark:text-gray-900">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => (
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-gray-900 dark:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-gray-900 dark:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              )
            ))}
            <a
              href="https://romefinefinishes.dripjobs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded font-medium hover:opacity-90 transition-opacity"
            >
              Schedule Estimate
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
