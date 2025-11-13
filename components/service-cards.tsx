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
    title: "Custom Cabinetry",
    description:
      "From floor to ceiling, we've got your home custom cabinetry covered. You can choose from our bespoke designs with premium wood selection and expert finishes. Let our expert craftspeople bring your vision to life.",
    imageAlt: "Custom cabinetry project",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "left",
  },
  {
    id: "decks",
    title: "Outdoor Decks",
    description:
      "Create your perfect outdoor living space with our custom deck designs. We specialize in weather-resistant construction, premium materials, and stunning finishes that will last for years. Transform your backyard into an entertainer's paradise.",
    imageAlt: "Beautiful outdoor deck",
    cta: "Schedule an Estimate",
    ctaLink: "https://romefinefinishes.dripjobs.com",
    imagePosition: "right",
  },
  {
    id: "interiors",
    title: "Interior Finishing",
    description:
      "Professional painting, textures, and interior finishing work that transforms any space. From subtle finishes to bold statements, our expert team brings your design vision to life with precision and artistry.",
    imageAlt: "Interior finishing project",
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
                <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-lg">
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
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{service.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{service.description}</p>
                <a
                  href={service.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 bg-foreground text-background font-medium rounded hover:opacity-90 transition-opacity"
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
