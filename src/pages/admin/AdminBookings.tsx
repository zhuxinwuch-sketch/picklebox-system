import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBookings } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "default",
  cancelled: "destructive",
  completed: "secondary",
};

const AdminBookings = () => {
  const { data: bookings, isLoading } = useAdminBookings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBooking = useMutation({
    mutationFn: async ({ bookingId, status, paymentId }: { bookingId: string; status: string; paymentId?: string }) => {
      // Update booking status
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: status as any })
        .eq("id", bookingId);
      if (bookingError) throw bookingError;

      // If approving, also mark payment as completed
      if (status === "paid" && paymentId) {
        const { error: paymentError } = await supabase
          .from("payments")
          .update({ status: "completed" as any, paid_at: new Date().toISOString() })
          .eq("id", paymentId);
        if (paymentError) throw paymentError;
      }

      // If cancelling, mark payment as failed
      if (status === "cancelled" && paymentId) {
        const { error: paymentError } = await supabase
          .from("payments")
          .update({ status: "failed" as any })
          .eq("id", paymentId);
        if (paymentError) throw paymentError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      toast({ title: "Booking updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground">Manage bookings and verify GCash payments</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>
            ) : bookings?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No bookings yet</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Booked By</TableHead>
                      <TableHead>Court</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>GCash Ref #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map((booking: any) => {
                      const payment = booking.payments?.[0];
                      const isPending = booking.status === "pending";
                      
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-sm text-foreground">
                            {booking.reference_code || "—"}
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div>
                              <span className="font-medium">{booking.profiles?.full_name || "Unknown"}</span>
                              {booking.profiles?.phone && (
                                <span className="block text-xs text-muted-foreground">{booking.profiles.phone}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            {booking.courts?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {format(new Date(booking.booking_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {booking.start_time} - {booking.end_time}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            ₱{booking.total_amount}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment?.transaction_reference ? (
                              <span className="text-foreground">{payment.transaction_reference}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[booking.status] || "secondary"}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => updateBooking.mutate({
                                    bookingId: booking.id,
                                    status: "paid",
                                    paymentId: payment?.id,
                                  })}
                                  disabled={updateBooking.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBooking.mutate({
                                    bookingId: booking.id,
                                    status: "cancelled",
                                    paymentId: payment?.id,
                                  })}
                                  disabled={updateBooking.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Deny
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {booking.status === "paid" ? "Verified" : booking.status === "cancelled" ? "Denied" : "—"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
