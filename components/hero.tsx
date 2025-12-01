import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative w-full min-h-[520px] md:min-h-[640px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: 'url("/Untitled design (2).svg")',
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 sm:px-4 max-w-5xl flex flex-col items-center">
        {/* Main Hero Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-white drop-shadow-lg">
          Rediscover the Beauty of YOUR Home with Our Custom Paint & Stain Finishes
        </h1>
        <p className="text-base sm:text-lg md:text-xl opacity-95 text-white">
          Specialists in Custom Cabinet Refinishing, Deck Renewal, Cabinet Refacing & Detailed Interior Finishes. – Proudly Serving the Des Moines Metro since 2018
        </p>
      </div>
    </section>
  )
}
