"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"

import { cn } from "@/lib/utils"
import GoldLine from "@/components/gold-line"

interface ServiceSection {
  id: string
  title: string
  description: string
  imageAlt: string
  cta: string
  ctaLink: string
  imagePosition: "left" | "right"
  autoplayDelay: number
  autoplayOffset: number
}

// Helper function to get images from DEPLOY folders
// These functions automatically include all images from the respective folders
const getCabinetRefacingImages = (limit = 0) => {
  const images = [
    "/DEPLOY-cabinet-refacing/01979e11-9f9d-711e-8dd4-0cd0c23eae1a.JPG",
    "/DEPLOY-cabinet-refacing/IMG_0719.JPG",
    "/DEPLOY-cabinet-refacing/IMG_0721.JPG",
    "/DEPLOY-cabinet-refacing/IMG_0722.JPG",
    "/DEPLOY-cabinet-refacing/IMG_0973.JPG",
    "/DEPLOY-cabinet-refacing/IMG_1244.JPG",
    "/DEPLOY-cabinet-refacing/IMG_3636.JPG",
    "/DEPLOY-cabinet-refacing/IMG_6866.JPG",
    "/DEPLOY-cabinet-refacing/IMG_7040.JPG",
  ]
  return limit > 0 ? images.slice(0, limit) : images
}

const getCabinetRefinishingImages = (limit = 0) => {
  const images = [
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0342.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0343.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0507.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0508.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0509.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0510.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0512.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0513.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0514.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0540.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0577.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0605.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0637.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0664.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0722.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0726.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0746.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0874.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_0953.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_1245.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_1369.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_1598.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_1814.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_2098.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_2336.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_2500.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_3265.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_3591.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_3604.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_3638.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_3644.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_5448.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_6334.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_6621.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_6704.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_6820.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_6886.JPEG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_7584.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_7785.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_7786.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_7788.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_7985.JPG",
    "/DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair/IMG_8179.JPG",
  ]
  return limit > 0 ? images.slice(0, limit) : images
}

const getDecksImages = (limit = 0) => {
  const images = [
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_0974.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_0982.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_0988.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_2697.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_2711.JPEG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_2978.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_3064.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_3239.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_5621.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_5651.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_5652.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_5833.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_5890.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_7791.JPG",
    "/DEPLOY-decks/iCloud Photos from Megan Fair/IMG_7794.JPG",
  ]
  return limit > 0 ? images.slice(0, limit) : images
}

const getFurnitureRestorationImages = (limit = 0) => {
  const images = [
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_0685.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_2956.JPEG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_3341.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_3454.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_4867.JPEG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_6363.JPEG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_6615.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_6673.JPEG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_6698.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_7511.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_7512.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_7556.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_7560.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_7702.JPG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_7988.JPEG",
    "/DEPLOY-furniture-restoration/iCloud Photos from Megan Fair/IMG_8005.JPG",
  ]
  return limit > 0 ? images.slice(0, limit) : images
}

const services: ServiceSection[] = [
  {
    id: "cabinet-refinishing",
    title: "Cabinet Refinishing",
    description:
      "Refinish the cabinetry you already love! Whether it's your kitchen, bathroom or built-ins, your home should reflect your personal style. Cabinet refinishing is a cost-effective solution offering a large return without a full remodel. Our cabinet specialists will transform your space using high quality finishes, meticulous preparation for superior durability and leave you with a factory like - flawless finish – all in about 1 week! Every cabinet refinishing project comes with a design & color consultation to ensure an expertly curated space. Get started today with a free estimate.",
    imageAlt: "Cabinet refinishing project",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "left",
    autoplayDelay: 3500,
    autoplayOffset: 1500,
  },
  {
    id: "cabinet-refacing",
    title: "Cabinet Refacing",
    description:
      "Looking to add a little more to your cabinet refinishing? Consider refacing your cabinetry with new cabinet door & drawer faces. Refacing can give a dated space a modern and custom look without replacing all your cabinets. This option is great for kitchens with \"good bones\" or clients that want to add a few cabinets to maximize the functionality of their space.",
    imageAlt: "Cabinet refacing project",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "right",
    autoplayDelay: 3500,
    autoplayOffset: 1500,
  },
  {
    id: "decks",
    title: "Deck Refinishing",
    description:
      "Enjoy your outdoor space more when you're proud to show it off! Whether your deck is new or seasoned & well loved, our skilled deck technicians can make your outdoor space beautiful. We offer a variety of stain options and endless colors! Got bees or lots of insects? We can also add natural additives that deter carpenter bees and other pesky insects. Have rotten boards on your deck? We can replace those too! Not sure what kind of annual maintenance your deck needs? Our team does annual deck cleaning to lengthen the life of the stain and help keep boards from rotting! The process is typically only a few days, so you'll be back out there in no time!",
    imageAlt: "Refinished outdoor deck",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "right",
    autoplayDelay: 4000,
    autoplayOffset: 2000,
  },
  {
    id: "furniture-restoration",
    title: "Furniture Restoration",
    description:
      "When it comes to furniture, they \"just don't make it like they used to\". Getting that old furniture to look new again and represent your personal style and flare is essential to holding on to that quality piece or adding a new upcycled piece that speaks to your design aesthetic. We specialize in furniture restoration, including paint and stain. So, before you donate, consider refinishing. For those thrifters out there- we've got you covered too! Bring us your treasures and we will make them look extra special.",
    imageAlt: "Furniture restoration project",
    cta: "Revive a Favorite Piece",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "right",
    autoplayDelay: 4000,
    autoplayOffset: 2000,
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
  // Use static image lists - these will automatically include all images from DEPLOY folders
  // When new images are added to DEPLOY folders, update these lists
  const getServiceImages = (serviceId: string, limit: number) => {
    let images: string[] = []
    switch (serviceId) {
      case "cabinet-refinishing":
        images = getCabinetRefinishingImages()
        break
      case "cabinet-refacing":
        images = getCabinetRefacingImages()
        break
      case "decks":
        images = getDecksImages()
        break
      case "furniture-restoration":
        images = getFurnitureRestorationImages()
        break
      default:
        images = ["/placeholder.svg"]
    }
    return limit > 0 ? images.slice(0, limit) : images
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-20">
          Finishing Services For Your Home
        </h2>

        <div className="space-y-24">
          {services.map((service, idx) => {
            // Get images based on service ID
            const imageLimit = service.id === "cabinet-refinishing" ? 8 : 6
            const displayImages = getServiceImages(service.id, imageLimit)

            return (
              <div key={service.id} id={service.id} className="space-y-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Image - Left or Right */}
                <div className={`${service.imagePosition === "right" ? "md:order-2" : "md:order-1"}`}>
                  <ServiceGallery
                    images={displayImages}
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
                {/* Gold line separator */}
                <GoldLine className="mt-8" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
