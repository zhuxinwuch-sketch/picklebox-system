import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Users, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const allCourts = [
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
    amenities: ["Indoor", "AC", "Parking"],
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
    amenities: ["Indoor", "Pro Shop", "Locker Room"],
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
    amenities: ["Outdoor", "Night Lights", "Parking"],
  },
  {
    id: 4,
    name: "Quezon City Courts",
    location: "Eastwood City, QC",
    rating: 4.6,
    reviews: 64,
    capacity: 4,
    price: 400,
    image: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=600&h=400&fit=crop",
    available: true,
    amenities: ["Indoor", "Cafe", "Wifi"],
  },
  {
    id: 5,
    name: "Alabang Sports Complex",
    location: "Alabang, Muntinlupa",
    rating: 4.8,
    reviews: 89,
    capacity: 4,
    price: 550,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    available: true,
    amenities: ["Indoor", "AC", "Shower"],
  },
  {
    id: 6,
    name: "Manila Bay Arena",
    location: "MOA Complex, Pasay",
    rating: 4.5,
    reviews: 112,
    capacity: 4,
    price: 480,
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop",
    available: true,
    amenities: ["Indoor", "Parking", "Restaurant"],
  },
];

const Courts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");

  const filteredCourts = allCourts.filter((court) => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceFilter === "all" ||
      (priceFilter === "under500" && court.price < 500) ||
      (priceFilter === "500to600" && court.price >= 500 && court.price <= 600) ||
      (priceFilter === "above600" && court.price > 600);
    
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Browse Courts
            </h1>
            <p className="text-muted-foreground">
              Find and book the perfect pickleball court for your next game
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by court name or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under500">Under ₱500</SelectItem>
                <SelectItem value="500to600">₱500 - ₱600</SelectItem>
                <SelectItem value="above600">Above ₱600</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredCourts.length} courts
          </p>

          {/* Courts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourts.map((court) => (
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
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{court.location}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {court.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-muted rounded-md text-muted-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
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

          {filteredCourts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No courts found matching your criteria.</p>
              <Button 
                variant="link" 
                onClick={() => { setSearchTerm(""); setPriceFilter("all"); }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courts;
