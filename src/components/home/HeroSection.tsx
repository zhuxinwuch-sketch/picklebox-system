import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-court.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Premium pickleball court"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl animate-slide-up">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Book Premium{" "}
            <span className="text-gradient">Pickleball Courts</span>{" "}
            in Seconds
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Find and reserve top-rated courts at The Pickle Box. Pay securely with GCash and get instant confirmation. Your next game is just a few taps away.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/courts">
              <Button variant="hero" size="xl">
                Book a Court
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button variant="heroOutline" size="xl">
              View Schedule
              <Calendar className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl glass-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Instant Booking</p>
                <p className="text-xs text-muted-foreground">Real-time availability</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl glass-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Shield className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Secure Payment</p>
                <p className="text-xs text-muted-foreground">GCash integrated</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl glass-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/50">
                <Calendar className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Easy Management</p>
                <p className="text-xs text-muted-foreground">Manage all bookings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
