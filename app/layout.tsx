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
  keywords: "custom cabinetry, decking, interior finishing, home renovation, Iowa",
  icons: {
    icon: "/favicon.svg",
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
