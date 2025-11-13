"use client"

import { Star } from "lucide-react"

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
    author: "Sarah M.",
    rating: 5,
    text: "Absolutely fantastic work on our kitchen cabinets. The attention to detail was incredible!",
    platform: "google",
  },
  {
    id: 2,
    author: "James K.",
    rating: 5,
    text: "Built the most amazing deck for our backyard. Highly recommend Rome Fine Finishes!",
    platform: "facebook",
  },
  {
    id: 3,
    author: "Emily R.",
    rating: 5,
    text: "Professional team, beautiful results. Our interior transformation exceeded expectations.",
    platform: "google",
  },
]

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">What Clients Say</h2>
          <p className="text-lg text-muted-foreground">Trusted by homeowners across the region</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card p-8 rounded-lg border border-border space-y-4">
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
          ))}
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
