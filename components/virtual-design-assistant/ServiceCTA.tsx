"use client"

import { ArrowRight, Phone, Calendar } from "lucide-react"
import { SurfaceType } from "./SurfaceTypeDetector"

interface ServiceCTAProps {
  surfaceType: SurfaceType
}

const SERVICE_INFO: Record<string, { title: string; description: string; ctaText: string }> = {
  cabinets: {
    title: "Transform Your Cabinets",
    description:
      "Ready to bring your vision to life? Our expert team specializes in professional cabinet refinishing with meticulous attention to detail.",
    ctaText: "Schedule Cabinet Consultation",
  },
  fireplace: {
    title: "Modernize Your Fireplace",
    description:
      "Elevate your living space with a stunning fireplace makeover. We create beautiful, modern designs that become the centerpiece of your home.",
    ctaText: "Schedule Fireplace Consultation",
  },
  deck: {
    title: "Restore Your Deck",
    description:
      "Protect and enhance your outdoor space with premium deck refinishing. We use weather-resistant materials for lasting beauty.",
    ctaText: "Schedule Deck Consultation",
  },
  room: {
    title: "Refinish Your Space",
    description:
      "Transform your interior with professional finishing services. From walls to trim, we bring refined polish to every surface.",
    ctaText: "Schedule Interior Consultation",
  },
}

export default function ServiceCTA({ surfaceType }: ServiceCTAProps) {
  if (!surfaceType || !SERVICE_INFO[surfaceType]) {
    return null
  }

  const serviceInfo = SERVICE_INFO[surfaceType]
  const consultationLink = "https://romefinefinishes.dripjobs.com"

  return (
    <div className="w-full p-6 md:p-8 rounded-lg border border-border bg-gradient-to-br from-accent/10 to-accent/5">
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-serif font-bold mb-2">{serviceInfo.title}</h3>
          <p className="text-muted-foreground">{serviceInfo.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={consultationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded font-medium hover:opacity-90 transition-opacity"
          >
            <Calendar className="w-4 h-4" />
            {serviceInfo.ctaText}
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="tel:+1234567890"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded font-medium hover:bg-muted transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call Us
          </a>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Free estimates • Licensed & Insured • Established 2018
        </p>
      </div>
    </div>
  )
}

