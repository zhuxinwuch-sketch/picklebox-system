import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

const courts = [
  {
    id: 1,
    name: "BGC Sports Center",
    location: "Bonifacio Global City, Taguig",
    rating: 4.9,
    reviews: 128,
    capacity: 4,
    price: 500,
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop",
    available: true,
  },
  {
    id: 2,
    name: "Makati Arena",
    location: "Ayala Center, Makati",
    rating: 4.8,
    reviews: 95,
    capacity: 4,
    price: 600,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",
    available: true,
  },
  {
    id: 3,
    name: "Ortigas Sports Hub",
    location: "Ortigas Center, Pasig",
    rating: 4.7,
    reviews: 76,
    capacity: 4,
    price: 450,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=400&fit=crop",
    available: false,
  },
];

export function CourtsPreview() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Featured Courts</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Popular Courts Near You
            </h2>
          </div>
          <Link to="/courts">
            <Button variant="outline">
              View All Courts
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <div
              key={court.id}
              className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={court.image}
                  alt={court.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant={court.available ? "default" : "secondary"}>
                    {court.available ? "Available" : "Booked"}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm">
                  <Star className="h-4 w-4 text-accent fill-accent" />
                  <span className="text-sm font-semibold text-foreground">{court.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-foreground mb-2">{court.name}</h3>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{court.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Up to {court.capacity}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {court.reviews} reviews
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-foreground">₱{court.price}</span>
                    <span className="text-sm text-muted-foreground">/hour</span>
                  </div>
                  <Link to={`/courts/${court.id}`}>
                    <Button size="sm" disabled={!court.available}>
                      {court.available ? "Book Now" : "Unavailable"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
