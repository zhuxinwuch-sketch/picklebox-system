import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CreditCard,
  TrendingUp,
  Users,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Bookings",
    value: "1,284",
    change: "+12.5%",
    trend: "up",
    icon: Calendar,
  },
  {
    title: "Revenue",
    value: "₱584,320",
    change: "+8.2%",
    trend: "up",
    icon: CreditCard,
  },
  {
    title: "Active Courts",
    value: "24",
    change: "+2",
    trend: "up",
    icon: MapPin,
  },
  {
    title: "Total Users",
    value: "5,847",
    change: "+15.3%",
    trend: "up",
    icon: Users,
  },
];

const recentBookings = [
  {
    id: 1,
    customer: "Maria Santos",
    court: "BGC Sports Center",
    date: "Feb 5, 2026",
    time: "09:00 AM",
    amount: 500,
    status: "confirmed",
  },
  {
    id: 2,
    customer: "Juan Dela Cruz",
    court: "Makati Arena",
    date: "Feb 5, 2026",
    time: "02:00 PM",
    amount: 600,
    status: "pending",
  },
  {
    id: 3,
    customer: "Ana Reyes",
    court: "Ortigas Hub",
    date: "Feb 4, 2026",
    time: "06:00 PM",
    amount: 450,
    status: "completed",
  },
  {
    id: 4,
    customer: "Pedro Garcia",
    court: "BGC Sports Center",
    date: "Feb 4, 2026",
    time: "10:00 AM",
    amount: 500,
    status: "confirmed",
  },
  {
    id: 5,
    customer: "Carla Mendoza",
    court: "Alabang Complex",
    date: "Feb 3, 2026",
    time: "04:00 PM",
    amount: 550,
    status: "completed",
  },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-primary text-primary-foreground",
  pending: "bg-accent text-accent-foreground",
  completed: "bg-muted text-muted-foreground",
};

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your courts.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      stat.trend === "up" ? "text-primary" : "text-destructive"
                    )}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Badge variant="secondary">
              <TrendingUp className="h-3 w-3 mr-1" />
              +23 today
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Court
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-foreground">
                          {booking.customer}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">
                          {booking.court}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-foreground">{booking.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.time}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-foreground">
                          ₱{booking.amount}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[booking.status]}>
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default AdminDashboard;
