import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePersona, CUSTOMER_PERSONAS } from "@/contexts/PersonaContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, X } from "lucide-react";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona, setPersona } = usePersona();
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);

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

            {/* View Toggle */}
            <div className="flex items-center border-l pl-4 mr-2">
              <div className="flex items-center rounded-full border bg-muted/50 p-0.5 text-xs">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium">👤 Customer</span>
                <button onClick={() => navigate("/internal")} className="px-3 py-1 rounded-full text-muted-foreground hover:text-foreground transition-colors">🏦 Finance</button>
              </div>
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center gap-2 border-l pl-4">
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

      {/* Demo Mode Banner */}
      {!demoBannerDismissed && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-center gap-2">
          <p className="text-xs text-foreground">
            🎭 <span className="font-semibold">Demo Mode</span> — You are viewing this portal as <span className="font-semibold">{persona.name}</span>, a customer from {persona.company}. This simulates what a real Red Hat AWS Marketplace customer would see after purchasing.
          </p>
          <button onClick={() => setDemoBannerDismissed(true)} className="text-muted-foreground hover:text-foreground ml-2 shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Persona switcher strip */}
      <div className="bg-muted/30 border-b px-4 py-1 text-center">
        <p className="text-[11px] text-muted-foreground">
          <User className="h-3 w-3 inline mr-1" />
          Viewing as <span className="font-semibold text-foreground">{persona.name}</span> from {persona.company}
          <span className="mx-2">·</span>
          <Link to="/internal" className="text-primary hover:underline">Switch to Finance Portal</Link>
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
