"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"

import galleryDataJson from "@/data/megan-gallery.json"
import { cn } from "@/lib/utils"

interface ServiceSection {
  id: string
  title: string
  description: string
  imageAlt: string
  cta: string
  ctaLink: string
  imagePosition: "left" | "right"
  images: string[]
  autoplayDelay: number
  autoplayOffset: number
}

type GalleryEntry = {
  file: string
  confidence: number
  source: string
}

type GalleryCategory = "cabinetry" | "decks" | "interiors" | "furniture-restoration"

const galleryData = galleryDataJson as Record<GalleryCategory, GalleryEntry[]>

const getGalleryImages = (category: GalleryCategory, limit = 6) => {
  const files = (galleryData[category] ?? []).map((entry) => entry.file)
  if (!files.length) {
    return ["/placeholder.svg"]
  }
  return limit > 0 ? files.slice(0, limit) : files
}

const services: ServiceSection[] = [
  {
    id: "cabinet-refacing",
    title: "Cabinet Refacing",
    description:
      "Refinish the cabinetry you already love! Whether it's your kitchen, bathroom or built-ins, your home should reflect your personal style. Cabinet refinishing is a cost-effective solution offering a large return without a full remodel. Our cabinet specialists and skilled craftsman will transform your space using high quality finishes, meticulous preparation for superior durability and leave you with a factory finish – flawless finish – all in about 1 week! Every cabinet refinishing project comes with a design & color consultation to ensure an expertly curated space. Looking to add a little more to your cabinet refinishing? Consider refacing your cabinetry with new cabinet door & drawer faces. Refacing can give a dated space a modern and custom look without replacing all your cabinets. This option is great for kitchens with \"good bones\" or clients that want to add a few cabinets to maximize the functionality of their space. Get started today with a free estimate.",
    imageAlt: "Cabinet refinishing and refacing project",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "left",
    images: getGalleryImages("cabinetry", 8),
    autoplayDelay: 7000,
    autoplayOffset: 3000,
  },
  {
    id: "decks",
    title: "Deck Refinishing",
    description:
      "Protect and revive your outdoor gathering space with deep cleaning, repairs, and premium stains. We specialize in weather-resistant coatings, careful sanding, and detail work that restores the warmth and richness of your deck.",
    imageAlt: "Refinished outdoor deck",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "right",
    images: getGalleryImages("decks", 6),
    autoplayDelay: 8000,
    autoplayOffset: 4500,
  },
  {
    id: "interiors",
    title: "Interior Finishes",
    description:
      "From floor to door to ceiling, we've got your home's interior painting covered! When it comes to your home, we understand the value in detailed care & attention. Our Paint Specialist uses high quality materials, the newest technology and skills in application methods and treats all projects with the professional craftsmanship your home deserves. Need help choosing the right color? We can do that too! Let our design team help find the perfect color to bring your vision to reality. Get started today by booking your free estimate!",
    imageAlt: "Interior refinishing project",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "left",
    images: getGalleryImages("interiors", 7),
    autoplayDelay: 9000,
    autoplayOffset: 6000,
  },
  {
    id: "furniture-restoration",
    title: "Furniture Restoration",
    description:
      "Give heirloom-quality pieces the respect they deserve. We repair damage, rebuild missing details, and apply hand-crafted, hand-finished coatings that protect daily use while showcasing the natural character of each piece.",
    imageAlt: "Furniture restoration project",
    cta: "Revive a Favorite Piece",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "right",
    images: getGalleryImages("furniture-restoration", 6),
    autoplayDelay: 8500,
    autoplayOffset: 5000,
  },
]

function ServiceGallery({
  images,
  imageAlt,
  autoplayDelay,
  autoplayOffset,
}: {
  images: string[]
  imageAlt: string
  autoplayDelay: number
  autoplayOffset: number
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const timeoutRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  const scrollNext = useCallback(() => {
    if (!emblaApi) return
    if (!emblaApi.canScrollNext()) {
      emblaApi.scrollTo(0)
      return
    }
    emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    onSelect()
    emblaApi.on("select", onSelect)

    const startAutoplay = () => {
      scrollNext()
      intervalRef.current = window.setInterval(scrollNext, autoplayDelay)
    }

    timeoutRef.current = window.setTimeout(startAutoplay, autoplayOffset)

    return () => {
      emblaApi.off("select", onSelect)
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [emblaApi, scrollNext, autoplayDelay, autoplayOffset])

  return (
    <div ref={emblaRef} className="group relative overflow-hidden rounded-lg shadow-lg">
      <div className="flex">
        {images.map((src, idx) => (
          <div key={src} className="relative shrink-0 grow-0 basis-full h-64 sm:h-80 md:h-[500px]">
            <Image
              src={src}
              alt={`${imageAlt} slide ${idx + 1}`}
              fill
              className={cn(
                "object-cover transition-transform duration-[4000ms] ease-out",
                selectedIndex === idx ? "scale-105" : "scale-100"
              )}
              sizes="(max-width: 768px) 100vw, 600px"
              priority={idx === 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ServiceCards() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-20">
          Finishing Services For Your Home
        </h2>

        <div className="space-y-24">
          {services.map((service, idx) => (
            <div key={service.id} id={service.id} className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image - Left or Right */}
              <div className={`${service.imagePosition === "right" ? "md:order-2" : "md:order-1"}`}>
                <ServiceGallery
                  images={service.images}
                  imageAlt={service.imageAlt}
                  autoplayDelay={service.autoplayDelay}
                  autoplayOffset={service.autoplayOffset}
                />
              </div>

              {/* Text Content */}
              <div className={`${service.imagePosition === "right" ? "md:order-1" : "md:order-2"} space-y-6`}>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">{service.title}</h3>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{service.description}</p>
                <a
                  href={service.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto px-8 py-3 bg-foreground text-background font-medium rounded hover:opacity-90 transition-opacity"
                >
                  {service.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
