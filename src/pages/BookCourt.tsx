import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Star, Users, Clock, CreditCard, CheckCircle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const courts = [
  {
    id: 1,
    name: "BGC Sports Center",
    location: "Bonifacio Global City, Taguig",
    rating: 4.9,
    reviews: 128,
    capacity: 4,
    price: 500,
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=500&fit=crop",
    amenities: ["Indoor", "AC", "Parking", "Shower", "Locker Room"],
    description: "Premium indoor pickleball courts with state-of-the-art facilities. Features professional-grade surfaces and climate control for optimal playing conditions.",
  },
  {
    id: 2,
    name: "Makati Arena",
    location: "Ayala Center, Makati",
    rating: 4.8,
    reviews: 95,
    capacity: 4,
    price: 600,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop",
    amenities: ["Indoor", "Pro Shop", "Locker Room", "Coaching", "Cafe"],
    description: "Premier sports facility in the heart of Makati's business district. Perfect for corporate events and competitive play.",
  },
];

const timeSlots = [
  { time: "06:00 AM", available: true },
  { time: "07:00 AM", available: true },
  { time: "08:00 AM", available: false },
  { time: "09:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "12:00 PM", available: true },
  { time: "01:00 PM", available: true },
  { time: "02:00 PM", available: true },
  { time: "03:00 PM", available: false },
  { time: "04:00 PM", available: true },
  { time: "05:00 PM", available: true },
  { time: "06:00 PM", available: true },
  { time: "07:00 PM", available: false },
  { time: "08:00 PM", available: true },
  { time: "09:00 PM", available: true },
];

const BookCourt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const court = courts.find((c) => c.id === Number(id)) || courts[0];

  const toggleSlot = (time: string) => {
    setSelectedSlots((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  };

  const totalPrice = selectedSlots.length * court.price;

  const handleProceedToPayment = () => {
    if (!selectedDate || selectedSlots.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a date and at least one time slot.",
        variant: "destructive",
      });
      return;
    }

    navigate("/checkout", {
      state: {
        court,
        date: selectedDate,
        slots: selectedSlots,
        totalPrice,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/courts" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Courts</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Court Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Court Image & Info */}
              <div className="rounded-2xl overflow-hidden border border-border bg-card">
                <div className="relative h-64 md:h-80">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge variant="default" className="text-sm">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {court.rating}
                    </Badge>
                    <Badge variant="secondary">{court.reviews} reviews</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {court.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{court.location}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {court.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {court.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm font-medium bg-muted rounded-lg text-muted-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Select Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Choose a Date</p>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                        className="rounded-lg border"
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">
                        Available Time Slots
                        {selectedDate && (
                          <span className="text-muted-foreground font-normal ml-2">
                            ({format(selectedDate, "MMM d, yyyy")})
                          </span>
                        )}
                      </p>
                      <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && toggleSlot(slot.time)}
                            disabled={!slot.available}
                            className={cn(
                              "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                              slot.available
                                ? selectedSlots.includes(slot.time)
                                  ? "gradient-primary text-primary-foreground shadow-md"
                                  : "bg-muted hover:bg-muted/80 text-foreground"
                                : "bg-muted/50 text-muted-foreground cursor-not-allowed line-through"
                            )}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{court.name}</p>
                      <p className="text-sm text-muted-foreground">Up to {court.capacity} players</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">
                        {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Slots</span>
                      <span className="font-medium text-foreground">
                        {selectedSlots.length > 0 ? `${selectedSlots.length} hour(s)` : "None selected"}
                      </span>
                    </div>
                    {selectedSlots.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedSlots.map((slot) => (
                          <Badge key={slot} variant="secondary" className="text-xs">
                            {slot}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate per Hour</span>
                      <span className="font-medium text-foreground">₱{court.price}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">₱{totalPrice}</span>
                  </div>

                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleProceedToPayment}
                    disabled={selectedSlots.length === 0}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Instant confirmation</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookCourt;
