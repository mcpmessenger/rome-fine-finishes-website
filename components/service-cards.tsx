import Image from "next/image"

interface ServiceSection {
  id: string
  title: string
  description: string
  imageAlt: string
  cta: string
  ctaLink: string
  imagePosition: "left" | "right"
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
  },
]

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
                <div className="relative h-64 sm:h-80 md:h-[500px] rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={`/.jpg?height=500&width=500&query=${service.id} project showcase`}
                    alt={service.imageAlt}
                    fill
                    className="object-cover"
                  />
                </div>
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
