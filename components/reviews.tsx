"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

interface Review {
  id: number
  author: string
  rating: number
  text: string
  platform: "google" | "facebook"
}

const reviews: Review[] = [
  {
    id: 1,
    author: "Nancy Ann",
    rating: 5,
    text: "We had several quotes for our kitchen cabinets, after meeting with Megan we knew she would be painting for us. She helped us pick out the colors. Our cabinets and island turned out perfect. Megan and Rob are great painters and do not waste your time getting quotes. They are the best. Their quote was very reasonable but what really matters is the quality, being on schedule and listen to what you want. I give them 10 out of 5 stars and I admit we are very picky and want the high quality and we got it!",
    platform: "facebook",
  },
  {
    id: 2,
    author: "Cathy Beauchamp",
    rating: 5,
    text: "Megan & Rob were both great to work with! Megan really listened & offered ideas when I questioned my choices. She is meticulous with her work & has excellent communication! So far they have painted all the cabinetry in my kitchen, living room, 2 full bathrooms & a half bath along with some doors. I'm looking forward to her finishing my kitchen with a tiled backsplash and hopefully more projects to come!",
    platform: "facebook",
  },
  {
    id: 3,
    author: "Angie Neumeyer",
    rating: 5,
    text: "Megan painted my kitchen cabinets. They look amazing! It made such a difference in my kitchen and it's now so bright and beautiful. I highly recommend Project Partners Design for any of your painting projects. You won't be disappointed.",
    platform: "facebook",
  },
  {
    id: 4,
    author: "Elizabeth Hailey Hansen",
    rating: 5,
    text: "Project Partners Design of Ankeny are responsive, thorough and accommodating. They worked around the weather to stain our deck. I think we have even become friends with them. Hard working and meticulous. Would highly recommend them to everyone. They even came back this morning to bid another project.",
    platform: "facebook",
  },
  {
    id: 5,
    author: "Lindsay Marie Masker",
    rating: 5,
    text: "Megan was wonderful! She was so professional and kind. She went above and beyond! We love our updated kitchen cabinets. The kitchen looks brand new! You will not be disappointed, she is fabulous! Thank you for making our house feel like home now!",
    platform: "facebook",
  },
  {
    id: 6,
    author: "Leesa Jon",
    rating: 5,
    text: "Megan saved my kitchen! She saved me tens of thousands of dollars and added a sense of richness to it. She was like having a long lost friend over and under promised and over delivered! Have recommended her to several people and will continue to do so. Thank you so much Megan. You gave me the kitchen of my dreams and my wallet!",
    platform: "facebook",
  },
]

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const getVisibleReviews = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % reviews.length
      visible.push({ review: reviews[index], position: i })
    }
    return visible
  }

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const visibleReviews = getVisibleReviews()

  return (
    <section id="reviews" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">What Clients Say</h2>
          <p className="text-lg text-muted-foreground">Trusted by homeowners across the region</p>
        </div>

        {/* Desktop: Stacked Cards with Navigation */}
        <div className="hidden md:block relative mb-12 min-h-[600px] flex items-center justify-center">
          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-4 z-50 p-3 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-4 z-50 p-3 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
            aria-label="Next review"
          >
            <ChevronRight size={24} className="text-foreground" />
          </button>

          <div className="relative w-full max-w-4xl mx-auto">
            {visibleReviews.map(({ review, position }) => {
              const rotation = position === 0 ? -2 : position === 1 ? 1 : 2
              const translateX = position === 0 ? -20 : position === 1 ? 0 : 20
              const translateY = position === 0 ? -10 : position === 1 ? 0 : 10
              const zIndex = 3 - position
              const opacity = position === 0 ? 1 : position === 1 ? 0.95 : 0.9
              const scale = position === 0 ? 1 : position === 1 ? 0.98 : 0.96

              return (
                <div
                  key={`${review.id}-${currentIndex}`}
                  className="absolute top-1/2 left-1/2 w-full max-w-md bg-card p-8 rounded-lg border border-border space-y-4 shadow-xl transition-all duration-500 hover:scale-105 hover:z-50 hover:opacity-100"
                  style={{
                    transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) rotate(${rotation}deg) scale(${scale})`,
                    zIndex: zIndex,
                    opacity: opacity,
                  }}
                >
                  {/* Rating Stars */}
                  <div className="flex gap-1">
                    {Array(review.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} size={16} className="fill-accent text-accent" />
                      ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-foreground leading-relaxed">"{review.text}"</p>

                  {/* Author & Platform */}
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold text-foreground">{review.author}</p>
                    <p className="text-xs text-muted-foreground capitalize">{review.platform} Review</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dots Indicator for Desktop */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-accent w-6" : "bg-muted-foreground/30"
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Single Card with Navigation */}
        <div className="md:hidden relative mb-12 min-h-[400px] flex items-center justify-center">
          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-2 z-50 p-2 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-2 z-50 p-2 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
            aria-label="Next review"
          >
            <ChevronRight size={20} className="text-foreground" />
          </button>

          <div className="relative w-full max-w-sm mx-auto px-12">
            <div className="bg-card p-6 rounded-lg border border-border space-y-4 shadow-xl">
              {/* Rating Stars */}
              <div className="flex gap-1">
                {Array(reviews[currentIndex].rating)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} size={16} className="fill-accent text-accent" />
                  ))}
              </div>

              {/* Review Text */}
              <p className="text-foreground leading-relaxed text-sm">"{reviews[currentIndex].text}"</p>

              {/* Author & Platform */}
              <div className="pt-4 border-t border-border">
                <p className="font-semibold text-foreground">{reviews[currentIndex].author}</p>
                <p className="text-xs text-muted-foreground capitalize">{reviews[currentIndex].platform} Review</p>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-accent w-6" : "bg-muted-foreground/30"
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA Links */}
        <div className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">Read more reviews and see our work</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.facebook.com/ProjectPartnersDesign"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-foreground text-background font-medium rounded hover:opacity-90 transition-opacity"
            >
              Visit Facebook Page
            </a>
            <a
              href="https://www.google.com/search?q=Rome+Fine+Finishes+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 border-2 border-foreground text-foreground font-medium rounded hover:bg-foreground hover:text-background transition-colors"
            >
              Google Reviews
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
