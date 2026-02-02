import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="The Pickle Box" className="h-10 w-auto" />
              <span className="text-xl font-bold">
                The Pickle <span className="text-sidebar-primary">Box</span>
              </span>
            </div>
            <p className="text-sm text-sidebar-foreground/70">
              Book premium pickleball courts with ease. Play your game, your way.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/courts" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                Browse Courts
              </Link>
              <Link to="/bookings" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                My Bookings
              </Link>
              <Link to="/pricing" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                Pricing
              </Link>
              <Link to="/faq" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <Phone className="h-4 w-4" />
                <span>+63 912 345 6789</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <Mail className="h-4 w-4" />
                <span>hello@picklecourt.ph</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <MapPin className="h-4 w-4" />
                <span>BGC, Taguig City, Philippines</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sidebar-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-sidebar-foreground/60">
              © 2026 The Pickle Box. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
