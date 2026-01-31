import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, MoreVertical, Eye, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";

const bookings = [
  {
    id: 1,
    court: "BGC Sports Center",
    location: "Bonifacio Global City, Taguig",
    date: "2026-02-05",
    time: "09:00 AM - 11:00 AM",
    status: "confirmed" as BookingStatus,
    price: 1000,
    reference: "PC12345678",
  },
  {
    id: 2,
    court: "Makati Arena",
    location: "Ayala Center, Makati",
    date: "2026-02-10",
    time: "02:00 PM - 04:00 PM",
    status: "pending" as BookingStatus,
    price: 1200,
    reference: "PC12345679",
  },
  {
    id: 3,
    court: "Ortigas Sports Hub",
    location: "Ortigas Center, Pasig",
    date: "2026-01-20",
    time: "06:00 PM - 08:00 PM",
    status: "completed" as BookingStatus,
    price: 900,
    reference: "PC12345670",
  },
  {
    id: 4,
    court: "Quezon City Courts",
    location: "Eastwood City, QC",
    date: "2026-01-15",
    time: "10:00 AM - 12:00 PM",
    status: "cancelled" as BookingStatus,
    price: 800,
    reference: "PC12345671",
  },
];

const statusColors: Record<BookingStatus, string> = {
  confirmed: "bg-primary text-primary-foreground",
  pending: "bg-accent text-accent-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const Bookings = () => {
  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  const BookingCard = ({ booking }: { booking: typeof bookings[0] }) => (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{booking.court}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{booking.location}</span>
            </div>
          </div>
          <Badge className={statusColors[booking.status]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(booking.date).toLocaleDateString("en-US", { 
              weekday: "short", 
              month: "short", 
              day: "numeric",
              year: "numeric"
            })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{booking.time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Reference: {booking.reference}</p>
            <p className="text-lg font-bold text-foreground">₱{booking.price}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {(booking.status === "confirmed" || booking.status === "pending") && (
                <DropdownMenuItem className="text-destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Booking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              My Bookings
            </h1>
            <p className="text-muted-foreground">
              Manage your court reservations and view booking history
            </p>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                    <Button asChild>
                      <a href="/courts">Book a Court</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No past bookings</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Bookings;
