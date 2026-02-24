"use client"

import Image from "next/image"
import galleryDataJson from "@/data/megan-gallery.json"

export default function InteriorsAlbum() {
    const interiorImages = galleryDataJson.interiors || []

    if (interiorImages.length === 0) return null

    return (
        <section id="interiors-album" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Interiors Portfolio</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A curated collection of our fine interior finishing work, showcasing attention to detail from floor to ceiling.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {interiorImages.map((image, index) => (
                        <div
                            key={image.file}
                            className="group relative aspect-square overflow-hidden rounded-xl bg-muted shadow-sm hover:shadow-xl transition-all duration-500 ease-in-out"
                        >
                            <Image
                                src={image.file}
                                alt={`Interior finish detail ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white font-medium border border-white/40 px-4 py-2 rounded-full backdrop-blur-sm">
                                    View Detail
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
