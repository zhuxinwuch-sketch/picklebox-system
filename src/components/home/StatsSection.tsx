const stats = [
  { value: "5,000+", label: "Happy Players" },
  { value: "50+", label: "Partner Courts" },
  { value: "15,000+", label: "Bookings Made" },
  { value: "99.9%", label: "Uptime" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
