import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CreditCard,
  MapPin,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { useAdminBookings } from "@/hooks/useAdmin";
import { useAllCourts } from "@/hooks/useCourts";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  paid: "bg-primary text-primary-foreground",
  pending: "bg-accent text-accent-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminDashboard = () => {
  const { data: bookings, isLoading: bookingsLoading } = useAdminBookings();
  const { data: courts, isLoading: courtsLoading } = useAllCourts();

  const isLoading = bookingsLoading || courtsLoading;

  const totalBookings = bookings?.length || 0;
  const totalRevenue = bookings?.reduce((sum, b: any) => sum + Number(b.total_amount || 0), 0) || 0;
  const activeCourts = courts?.filter((c) => c.is_active)?.length || 0;
  const recentBookings = bookings?.slice(0, 5) || [];

  const stats = [
    { title: "Total Bookings", value: totalBookings.toString(), icon: Calendar },
    { title: "Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: CreditCard },
    { title: "Active Courts", value: activeCourts.toString(), icon: MapPin },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your courts.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bookings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Court</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking: any) => (
                      <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 font-mono text-sm text-foreground">{booking.reference_code || "—"}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{booking.courts?.name || "Unknown"}</td>
                        <td className="py-4 px-4 text-sm text-foreground">{format(new Date(booking.booking_date), "MMM d, yyyy")}</td>
                        <td className="py-4 px-4 font-semibold text-foreground">₱{booking.total_amount}</td>
                        <td className="py-4 px-4">
                          <Badge className={statusColors[booking.status] || ""}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
