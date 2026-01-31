import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, MapPin, Clock, Download, Share2, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { format } from "date-fns";

const Confirmation = () => {
  const location = useLocation();
  
  const bookingData = location.state || {
    court: { name: "BGC Sports Center", location: "Bonifacio Global City, Taguig" },
    date: new Date(),
    slots: ["09:00 AM", "10:00 AM"],
    totalPrice: 1000,
    customerName: "Juan Dela Cruz",
    customerEmail: "juan@example.com",
    referenceNumber: "PC12345678",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Animation */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full gradient-primary mb-6 animate-pulse-slow">
              <CheckCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your court reservation has been successfully confirmed. A confirmation email has been sent to {bookingData.customerEmail}.
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Reference Number */}
              <div className="text-center p-4 rounded-xl bg-muted/50 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                <p className="text-2xl font-bold font-mono text-foreground tracking-wider">
                  {bookingData.referenceNumber}
                </p>
              </div>

              {/* Booking Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{bookingData.court?.name}</p>
                    <p className="text-sm text-muted-foreground">{bookingData.court?.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                    <Calendar className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {bookingData.date ? format(new Date(bookingData.date), "EEEE, MMMM d, yyyy") : "Date"}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bookingData.slots?.map((slot: string) => (
                        <Badge key={slot} variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <span className="font-medium text-foreground">Total Paid</span>
                  <span className="text-2xl font-bold text-primary">₱{bookingData.totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Details
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/bookings" className="flex-1">
              <Button variant="hero" className="w-full">
                View My Bookings
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="heroOutline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Need help? Contact our support at{" "}
            <a href="mailto:support@picklecourt.ph" className="text-primary hover:underline">
              support@picklecourt.ph
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Confirmation;
