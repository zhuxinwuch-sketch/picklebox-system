import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import court1Image from "@/assets/court-1.png";
import court2Image from "@/assets/court-2.png";
import court3Image from "@/assets/court-3.png";

const allCourts = [
  {
    id: 1,
    name: "Court 1",
    capacity: 4,
    price: 500,
    image: court1Image,
    available: true,
  },
  {
    id: 2,
    name: "Court 2",
    capacity: 4,
    price: 500,
    image: court2Image,
    available: true,
  },
  {
    id: 3,
    name: "Court 3",
    capacity: 4,
    price: 500,
    image: court3Image,
    available: true,
  },
];

const Courts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              The Pickle Box Courts
            </h1>
            <p className="text-muted-foreground">
              Book your favorite court for your next game
            </p>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            {allCourts.length} courts available
          </p>

          {/* Courts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourts.map((court) => (
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
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{court.name}</h3>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Up to {court.capacity} players</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">₱{court.price}</span>
                      <span className="text-sm text-muted-foreground">/hour</span>
                    </div>
                    <Link to={`/book/${court.id}`}>
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
      </main>

      <Footer />
    </div>
  );
};

export default Courts;
