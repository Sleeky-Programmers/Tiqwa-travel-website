import { Sparkles, Headphones } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function TrustBanner() {
  return (
    <section className="border-y border-border bg-primary/5 py-4 dark:bg-primary/10">
      <Container>
        <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-8">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Over 2 million travelers trust Tiqwa
          </p>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Headphones className="h-4 w-4 text-primary" />
            24/7 Customer Support
          </p>
        </div>
      </Container>
    </section>
  );
}
