"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Project {
  id: number
  title: string
  category: string
  image: string
}

const projects: Project[] = [
  {
    id: 1,
    title: "Modern Kitchen Cabinetry",
    category: "Cabinetry",
    image: "/modern-kitchen-cabinetry.jpg",
  },
  {
    id: 2,
    title: "Spacious Outdoor Deck",
    category: "Decks",
    image: "/beautiful-outdoor-deck.jpg",
  },
  {
    id: 3,
    title: "Contemporary Interior Finish",
    category: "Interior",
    image: "/modern-interior-finishing.jpg",
  },
  {
    id: 4,
    title: "Custom Bathroom Vanity",
    category: "Cabinetry",
    image: "/luxury-bathroom-cabinetry.jpg",
  },
  {
    id: 5,
    title: "Deck with Finishing Details",
    category: "Decks",
    image: "/finished-deck-design.jpg",
  },
]

export default function ProjectsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const getVisibleProjects = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      visible.push(projects[(currentIndex + i) % projects.length])
    }
    return visible
  }

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Projects</h2>
            <p className="text-muted-foreground">Showcase of our finest work</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Previous project"
            >
              <ChevronLeft size={24} className="text-accent" />
            </button>
            <button
              onClick={next}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Next project"
            >
              <ChevronRight size={24} className="text-accent" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {getVisibleProjects().map((project) => (
            <div
              key={project.id}
              className="group rounded-lg overflow-hidden border border-border hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative h-64 overflow-hidden bg-muted">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-6 space-y-2">
                <div className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs font-semibold rounded">
                  {project.category}
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://romefinefinishes.dripjobs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Start Your Project
          </a>
        </div>
      </div>
    </section>
  )
}
