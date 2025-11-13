export default function Hero() {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: 'url("/luxury-kitchen-cabinetry.jpg")',
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight text-balance">
          Rediscover the beauty of your home with fine finishes.
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-95">
          Specialists in cabinet refinishing, deck renewal, and detailed interior finishes since 2018.
        </p>
        <a
          href="https://romefinefinishes.dripjobs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-foreground text-background font-medium rounded hover:opacity-90 transition-opacity"
        >
          Schedule an Estimate
        </a>
      </div>
    </section>
  )
}
