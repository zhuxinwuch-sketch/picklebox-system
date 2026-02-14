import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Calendar, Clock, Download, Share2, Home } from "lucide-react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { useBooking } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";

const Confirmation = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const bookingId = location.state?.bookingId;
  const { data: booking, isLoading } = useBooking(bookingId);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!bookingId) return <Navigate to="/courts" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-8">
              <Skeleton className="h-20 w-20 rounded-full mx-auto mb-6" />
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!booking) return <Navigate to="/courts" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full gradient-primary mb-6 animate-pulse-slow">
              <CheckCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your court reservation has been successfully created.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center p-4 rounded-xl bg-muted/50 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                <p className="text-2xl font-bold font-mono text-foreground tracking-wider">
                  {booking.reference_code || "—"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{(booking as any).courts?.name || "Court"}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.booking_date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                    <Clock className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Time</p>
                    <Badge variant="secondary" className="text-xs">
                      {booking.start_time} - {booking.end_time}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <span className="font-medium text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₱{booking.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
