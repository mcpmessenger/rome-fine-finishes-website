"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Script from "next/script"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { CheckCircle, ArrowLeft } from "lucide-react"

export default function ThankYouPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Conversion Snippet */}
            <Script id="google-ads-conversion" strategy="afterInteractive">
                {`
          gtag('event', 'conversion', {'send_to': 'AW-17957773014/KI9rCJy81vkbENa99_JC'});
        `}
            </Script>

            <Navigation isDark={false} />

            <main className="flex-grow flex items-center justify-center py-24 px-4 bg-muted/30">
                <div className="max-w-2xl w-full text-center space-y-8 p-8 md:p-12 bg-background rounded-2xl border border-border shadow-soft">
                    <div className="flex justify-center">
                        <div className="bg-success/10 p-4 rounded-full">
                            <CheckCircle className="w-16 h-16 text-success" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                            Thank You!
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We've received your request and will reach out to you shortly to confirm your consultation.
                        </p>
                    </div>

                    <div className="pt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Return to Homepage
                        </Link>
                    </div>

                    <p className="text-sm text-muted-foreground italic">
                        Questions? Give us a call at <a href="tel:515-903-7663" className="text-accent underline hover:opacity-80">(515) 903-ROME</a>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
