import Image from "next/image"
import { Phone, Mail } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/Untitled design (27).png"
                alt="Rome Fine Finishes"
                width={200}
                height={80}
                className="h-14 w-auto sm:h-16"
              />
            </div>
            <p className="text-sm opacity-90">Custom cabinetry, decking, and interior finishing since 2018.</p>
            <div className="pt-4 space-y-3">
              <a
                href="tel:515-903-7663"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity text-sm"
              >
                <Phone size={16} />
                (515) 903-ROME
              </a>
              <a
                href="mailto:Megan@RomeFineFinishes.com"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity text-sm"
              >
                <Mail size={16} />
                Megan@RomeFineFinishes.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Services</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <a href="#cabinet-refacing" className="hover:opacity-100 transition-opacity">
                  Cabinetry
                </a>
              </li>
              <li>
                <a href="#decks" className="hover:opacity-100 transition-opacity">
                  Decks
                </a>
              </li>
              <li>
                <a href="#interiors" className="hover:opacity-100 transition-opacity">
                  Interior Finishing
                </a>
              </li>
            </ul>
          </div>

          {/* Appointment */}
          <div className="space-y-4">
            <h4 className="font-semibold">Get Started</h4>
            <p className="text-sm opacity-90 leading-relaxed">Schedule your free estimate today.</p>
            <a
              href="https://romefinefinishes.dripjobs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-background text-foreground font-medium rounded hover:opacity-90 transition-opacity"
            >
              Schedule Now
            </a>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/ProjectPartnersDesign"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center transition-transform hover:scale-105"
                aria-label="Facebook"
              >
                <Image
                  src="/social-media-icon-facebook.png"
                  alt="Facebook logo"
                  width={48}
                  height={48}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                />
              </a>
              <a
                href="https://www.instagram.com/projectpartnersdsn/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center transition-transform hover:scale-105"
                aria-label="Instagram"
              >
                <Image
                  src="/social-media-icon-instagram.png"
                  alt="Instagram logo"
                  width={48}
                  height={48}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm opacity-80">
            <p>&copy; {currentYear} Rome Fine Finishes. All rights reserved.</p>
            <p className="mt-4 sm:mt-0">Crafted with excellence in Iowa</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
