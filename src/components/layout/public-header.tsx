'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggleSimple } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/shared/logo';
import { useState, useEffect } from 'react';

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when resizing to larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-300 ${
      isScrolled ? 'bg-background/90 py-2' : 'bg-background/80 py-4'
    } border-border`} suppressHydrationWarning={true}>
      <div className="container mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between">
          <Link href="/" suppressHydrationWarning>
            <Logo iconSize={32} textSize="md" />
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3" suppressHydrationWarning>
            <ThemeToggleSimple />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={isMenuOpen ? 'Sluit menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm bg-foreground ${
                  isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                }`}></span>
                <span className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm bg-foreground mt-1 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm bg-foreground mt-1 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                }`}></span>
              </div>
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/features" className="transition-colors text-sm text-foreground/80 hover:text-primary">
              Features
            </Link>
            <Link href="/cursussen" className="transition-colors text-sm text-foreground/80 hover:text-primary">
              Cursussen
            </Link>
            <Link href="/prijzen" className="transition-colors text-sm text-foreground/80 hover:text-primary">
              Prijzen
            </Link>
            <Link href="/reviews" className="transition-colors text-sm text-foreground/80 hover:text-primary">
              Reviews
            </Link>
            <Link href="/over-ons" className="transition-colors text-sm text-foreground/80 hover:text-primary">
              Over Ons
            </Link>
            <Link href="/blog" className="transition-colors text-sm text-foreground/80 hover:text-primary">
              Blog & Tips
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4" suppressHydrationWarning>
            <ThemeToggleSimple />
            <Link href="/login" className="text-sm transition-colors text-foreground/80 hover:text-primary">
              Inloggen
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-3 py-2">
                Start Nu
              </Button>
            </Link>
          </div>
        </nav>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/features"
                className="transition-colors text-foreground/80 hover:text-primary py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/cursussen"
                className="transition-colors text-foreground/80 hover:text-primary py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cursussen
              </Link>
              <Link
                href="/prijzen"
                className="transition-colors text-foreground/80 hover:text-primary py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Prijzen
              </Link>
              <Link
                href="/reviews"
                className="transition-colors text-foreground/80 hover:text-primary py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                href="/over-ons"
                className="transition-colors text-foreground/80 hover:text-primary py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Over Ons
              </Link>
              <Link
                href="/blog"
                className="transition-colors text-foreground/80 hover:text-primary py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog & Tips
              </Link>
              <div className="flex items-center space-x-4 pt-4 border-t border-border">
                <Link 
                  href="/login" 
                  className="text-foreground/80 hover:text-foreground py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inloggen
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Start Nu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}