import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePersona, CUSTOMER_PERSONAS } from "@/contexts/PersonaContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { persona, setPersona } = usePersona();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/customer" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">RH</span>
            </div>
            <span className="font-display font-bold text-lg">Partner Credit Portal</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/customer"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/customer" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/customer/submit"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/customer/submit" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Submit Request
            </Link>
            <Link
              to="/customer/requests"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname.startsWith("/customer/requests") || location.pathname.startsWith("/customer/status")
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              My Requests
            </Link>

            {/* Persona Switcher */}
            <div className="flex items-center gap-2 border-l pl-6">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{persona.initials}</span>
              </div>
              <Select
                value={persona.email}
                onValueChange={(email) => {
                  const p = CUSTOMER_PERSONAS.find((c) => c.email === email);
                  if (p) setPersona(p);
                }}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs border-0 bg-transparent shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_PERSONAS.map((p) => (
                    <SelectItem key={p.email} value={p.email}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground text-[10px]">({p.company})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </nav>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-primary/5 border-b px-4 py-1.5 text-center">
        <p className="text-xs text-muted-foreground">
          <User className="h-3 w-3 inline mr-1" />
          Viewing as <span className="font-semibold text-foreground">{persona.name}</span> from {persona.company}
          <span className="mx-2">·</span>
          <Link to="/" className="text-primary hover:underline">Switch Portal</Link>
        </p>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Red Hat Partner Credit Funding Portal. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
