import Image from "next/image"

export default function AboutUs() {
  const aboutImages = [
    "/images/about us/1000007846.jpg",
    "/images/about us/Untitled design (38).png",
    "/images/about us/Untitled design (39).png",
    "/images/about us/Untitled design (40).png",
    "/images/about us/Untitled design (41).png",
  ]

  return (
    <section id="about-us" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-12">About Us</h2>
        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mb-12">
          <p>
            Rome Fine Finishes got its name from combining its Husband & Wife Owner names Rob & Megan. Open since 2018, Rob & Megan have been serving the Des Moines Metro making homes beautiful one project at a time! Although a small business their production capacity is large and they are able to take on all sized projects. Often collaborating with other trades, Designers, General Contractors & Project Managers.
          </p>
          <p>
            What makes Rome different from other painting companies? As a family business Rob & Megan bring passion & love of their craft to every project! Client happiness is their number one priority so expect to be treated like family! They guarantee their work longer than any other paint company in the metro and their quality & craftsmanship is second to none. If you're looking for a company that's committed to quality and dedicated to service schedule your free estimate for one of our services today!
          </p>
        </div>
        
        {/* Image Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {aboutImages.map((src, idx) => (
            <div 
              key={idx} 
              className={`relative overflow-hidden rounded-lg shadow-lg ${
                idx === 0 ? 'sm:col-span-2 lg:col-span-2 aspect-[2/1]' : 'aspect-square'
              }`}
            >
              <Image
                src={src}
                alt={`About Rome Fine Finishes ${idx + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}





