import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock as ClockIcon, Calendar, Clock, Home, AlertCircle } from "lucide-react";
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
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary mb-6">
              <ClockIcon className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Booking Submitted!</h1>
            <p className="text-muted-foreground">
              Your booking is pending admin verification of your GCash payment.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-foreground">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>The admin will verify your GCash payment using your reference number</li>
                <li>Once verified, your booking status will be updated to <strong className="text-foreground">Paid</strong></li>
                <li>Your time slot is reserved while verification is in progress</li>
                <li>If denied, the slot will be released for others to book</li>
              </ul>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center p-4 rounded-xl bg-muted/50 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                <p className="text-2xl font-bold font-mono text-foreground tracking-wider">
                  {booking.reference_code || "—"}
                </p>
                <Badge variant="outline" className="mt-2">Pending Verification</Badge>
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
