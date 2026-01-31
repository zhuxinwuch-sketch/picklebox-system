import { Calendar, CreditCard, Clock, Bell, Shield, Users } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Real-Time Availability",
    description: "See court availability instantly. Our calendar updates in real-time so you never double-book.",
  },
  {
    icon: CreditCard,
    title: "GCash Payment",
    description: "Pay securely through GCash. Quick, easy, and no hidden fees. Get instant payment confirmation.",
  },
  {
    icon: Clock,
    title: "Flexible Time Slots",
    description: "Choose from hourly slots that fit your schedule. Morning, afternoon, or evening games.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Receive booking confirmations and reminders. Never miss your scheduled game again.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is protected with enterprise-grade security. Book with confidence.",
  },
  {
    icon: Users,
    title: "Group Bookings",
    description: "Organize tournaments or group sessions. Easy coordination for multiple players.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Everything You Need to Play
          </h2>
          <p className="text-muted-foreground">
            We've built the ultimate court booking experience with features designed for players who want simplicity and reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover-lift"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
