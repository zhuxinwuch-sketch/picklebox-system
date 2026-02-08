import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourts } from "@/hooks/useCourts";
import court1Image from "@/assets/court-1.png";
import court2Image from "@/assets/court-2.png";
import court3Image from "@/assets/court-3.png";

const courtImages: Record<string, string> = {
  "/assets/court-1.png": court1Image,
  "/assets/court-2.png": court2Image,
  "/assets/court-3.png": court3Image,
};

const Courts = () => {
  const { data: courts, isLoading } = useCourts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              The Pickle Box Courts
            </h1>
            <p className="text-muted-foreground">
              Book your favorite court for your next game
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            {courts?.length ?? 0} courts available
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts?.map((court) => (
                <div
                  key={court.id}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={courtImages[court.image_url || ""] || court.image_url || court1Image}
                      alt={court.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="default">Available</Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{court.name}</h3>
                    {court.description && (
                      <p className="text-sm text-muted-foreground mb-3">{court.description}</p>
                    )}

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Up to 4 players</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-foreground">₱{court.price_per_hour}</span>
                        <span className="text-sm text-muted-foreground">/hour</span>
                      </div>
                      <Link to={`/book/${court.id}`}>
                        <Button size="sm">Book Now</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courts;
