import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell flex min-h-screen flex-col">
      <div className="dashboard-bg-orbs" aria-hidden="true">
        <div className="dashboard-orb dashboard-orb-primary" />
        <div className="dashboard-orb dashboard-orb-accent" />
        <div className="dashboard-orb dashboard-orb-tertiary" />
      </div>
      <Navbar />
      <main className="flex-1" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
}