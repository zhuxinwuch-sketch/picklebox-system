import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Courts from "./pages/Courts";
import BookCourt from "./pages/BookCourt";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import Bookings from "./pages/Bookings";
 import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
     <BrowserRouter>
       <AuthProvider>
         <TooltipProvider>
           <Toaster />
           <Sonner />
           <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/courts" element={<Courts />} />
             <Route path="/book/:id" element={<BookCourt />} />
             <Route path="/checkout" element={<Checkout />} />
             <Route path="/confirmation" element={<Confirmation />} />
             <Route path="/bookings" element={<Bookings />} />
             <Route path="/auth" element={<Auth />} />
             <Route path="/admin" element={<AdminDashboard />} />
             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="*" element={<NotFound />} />
           </Routes>
         </TooltipProvider>
       </AuthProvider>
     </BrowserRouter>
  </QueryClientProvider>
);

export default App;
