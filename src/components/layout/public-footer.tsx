'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { SocialMediaLinks } from '@/components/shared/social-media-links';

export function PublicFooter() {
  return (
    <footer className="py-8 sm:py-12 border-t bg-muted/50 border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-4 block">
              <Logo iconSize={28} textSize="md" />
            </Link>
            <p className="text-sm text-foreground/70 mt-4">
              Jouw persoonlijke datingcoach: altijd beschikbaar, veilig en eerlijk advies.
            </p>
          </div>
          
          {/* Links sections */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/cursussen" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Cursussen
                    </Link>
                  </li>
                  <li>
                    <Link href="/#programmas" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Prijzen
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Over ons</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/#over-ons" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Ons verhaal
                    </Link>
                  </li>
                  <li>
                    <Link href="/reviews" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Reviews
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacyverklaring" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/algemene-voorwaarden" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Voorwaarden
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/help" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/status" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                      Status
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Social Media & Copyright */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col items-center gap-6">
            {/* Social Media Links */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/70 font-medium">Volg ons:</span>
              <SocialMediaLinks size="md" />
            </div>

            {/* Copyright */}
            <p className="text-sm text-foreground/70 text-center">
              &copy; {new Date().getFullYear()} DatingAssistent.nl. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}