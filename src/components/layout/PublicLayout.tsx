import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    </>
  );
}