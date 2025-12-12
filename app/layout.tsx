import type React from "react"
import type { Metadata } from "next"
import { Lora, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Rome Fine Finishes | Custom Cabinetry, Decks & Interior Finishing",
  description:
    "Expert custom cabinetry, outdoor decking, and interior finishing services. Established 2018. Request your appointment today.",
  keywords: "Paint Specialists, Skilled Craftsman, Hand Crafted, Factory Finish, Flawless Finish, Curated Space, Paint, Painting, Painter, Paint Lady, Paint Guy, The Paint Lady, The Paint Guy, Cabinets, Cabinet Painting, Cabinet Finishing, Cabinet Refinishing, Cabinet Refacing, Refacing, Cabinet Paint, Cabinet Painter, Paint for Cabinets, Painting on Cabinets, Painted Cabinets, White Cabinets, Black Cabinets, Stained Cabinets, Cabinet Colors, Cabinet Design, Kitchen Cabinets, Bathroom Cabinets, Built in cabinets, Fireplace Cabinets, Oak Cabinets, Maple Cabinets, Interior painting, Wall painting, Ceiling painting, Trim painting, Door painting, Interior door painting, Interior wall painting, Front door painting, Exterior door painting, Crown molding painting, Wall Painter, Ceiling Painter, Trim Painter, Door Painter, Interior Painter, Exterior Painter, custom cabinetry, decking, interior finishing, home renovation, Iowa, Des Moines",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Rome Fine Finishes",
    description: "Custom cabinetry, decking, and interior finishing services",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
