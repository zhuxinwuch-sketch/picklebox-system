import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Shield, Smartphone, CheckCircle, Clock } from "lucide-react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBooking, useCreatePayment } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const createBooking = useCreateBooking();
  const createPayment = useCreatePayment();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const bookingData = location.state;

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!bookingData?.court || !bookingData?.date || !bookingData?.slots?.length) {
    return <Navigate to="/courts" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Convert 12h time slots to 24h for DB storage
  const convertTo24h = (time12h: string): string => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
  };

  const handleGCashPayment = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Sort slots and get start/end times
      const sortedSlots = [...bookingData.slots].sort();
      const startTime = convertTo24h(sortedSlots[0]);
      const lastSlot = sortedSlots[sortedSlots.length - 1];
      // End time is 1 hour after last slot
      const lastTime24 = convertTo24h(lastSlot);
      const endHour = parseInt(lastTime24.split(":")[0]) + 1;
      const endTime = `${endHour.toString().padStart(2, "0")}:00:00`;

      const bookingDate = format(new Date(bookingData.date), "yyyy-MM-dd");

      // Create booking in database
      const booking = await createBooking.mutateAsync({
        user_id: user.id,
        court_id: bookingData.court.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        total_amount: bookingData.totalPrice,
      });

      // Create payment record
      await createPayment.mutateAsync({
        booking_id: booking.id,
        user_id: user.id,
        amount: bookingData.totalPrice,
        payment_method: "gcash",
      });

      // Send booking confirmation notification (fire and forget)
      supabase.functions.invoke("send-booking-notification", {
        body: { bookingId: booking.id, type: "confirmation" },
      }).catch((err) => console.error("Notification error:", err));

      navigate("/confirmation", {
        state: {
          bookingId: booking.id,
        },
      });
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Booking</span>
          </button>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">Select</span>
            </div>
            <div className="h-px w-12 bg-primary" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-foreground">Payment</span>
            </div>
            <div className="h-px w-12 bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                3
              </div>
              <span className="text-sm text-muted-foreground">Confirm</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" name="fullName" placeholder="Juan Dela Cruz" value={formData.fullName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="juan@example.com" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+63 912 345 6789" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#007DFE]">
                        <Smartphone className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">GCash</p>
                        <p className="text-sm text-muted-foreground">Pay with your GCash wallet</p>
                      </div>
                      <Badge variant="default">Recommended</Badge>
                    </div>
                    <div className="absolute top-4 right-4 h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Your payment information is secured with 256-bit encryption</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-semibold text-foreground">{bookingData.court?.name || "Court"}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {bookingData.date ? format(new Date(bookingData.date), "MMM d, yyyy") : "Date"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Selected Time Slots:</p>
                    <div className="flex flex-wrap gap-1">
                      {bookingData.slots?.map((slot: string) => (
                        <Badge key={slot} variant="secondary" className="text-xs">{slot}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Court Fee ({bookingData.slots?.length || 0} hours)</span>
                      <span className="text-foreground">₱{bookingData.totalPrice || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="text-foreground">₱0</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">₱{bookingData.totalPrice || 0}</span>
                  </div>

                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleGCashPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Pay with GCash
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By completing this payment, you agree to our Terms of Service and Privacy Policy
                  </p>
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

export default Checkout;
