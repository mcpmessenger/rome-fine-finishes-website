 "use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"

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

const services: ServiceSection[] = [
  {
    id: "cabinetry",
    title: "Cabinet Refinishing",
    description:
      "Refresh the cabinets you already love with meticulous prep, repair, and hand-applied finishes. We handle stripping, sanding, color matching, and durable topcoats that leave every door and drawer looking brand new.",
    imageAlt: "Cabinet refinishing project",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "left",
    images: [
      "/images/cabinetry/top.jpg",
      "/images/cabinetry/middle.jpg",
      "/images/cabinetry/lighten.jpg",
      "/images/cabinetry/kitchen.jpg",
    ],
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
    images: [
      "/images/decks/deck.jpg",
      "/images/decks/stair.jpg",
      "/images/decks/490696987_1252399580226629_4455734148705608591_n.jpg",
    ],
    autoplayDelay: 8000,
    autoplayOffset: 4500,
  },
  {
    id: "interiors",
    title: "Interior Fine Finishes",
    description:
      "From wall coatings to trim and built-ins, we elevate surfaces with artisan painting, specialty textures, and glazing. Every finish is tailored to complement your décor and bring refined polish to your living spaces.",
    imageAlt: "Interior refinishing project",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "left",
    images: [
      "/images/interiors/fireplace.jpg",
      "/images/interiors/bathroom.jpg",
      "/images/interiors/cutout.jpg",
    ],
    autoplayDelay: 9000,
    autoplayOffset: 6000,
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
