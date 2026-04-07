import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePersona, CUSTOMER_PERSONAS } from "@/contexts/PersonaContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, X, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona, setPersona } = usePersona();
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/customer", label: "Dashboard", active: location.pathname === "/customer" },
    { to: "/customer/submit", label: "Submit Request", active: location.pathname === "/customer/submit" },
    { to: "/customer/requests", label: "My Requests", active: location.pathname.startsWith("/customer/requests") || location.pathname.startsWith("/customer/status") },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4">
          <Link to="/customer" className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-redhat flex items-center justify-center shrink-0">
              <span className="text-redhat-foreground font-display font-bold text-sm">RH</span>
            </div>
            <span className="font-display font-bold text-base md:text-lg truncate">
              <span className="text-redhat">Red Hat</span>{" "}
              <span className="hidden sm:inline">Partner Credit Portal</span>
              <span className="sm:hidden">Credits</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  link.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* View Toggle */}
            <div className="flex items-center border-l pl-4 mr-2">
              <div className="flex items-center rounded-full border bg-muted/50 p-0.5 text-xs">
                <span className="px-3 py-1 rounded-full bg-redhat text-redhat-foreground font-medium">👤 Customer</span>
                <button onClick={() => navigate("/internal")} className="px-3 py-1 rounded-full text-muted-foreground hover:text-foreground transition-colors">🏦 Finance</button>
              </div>
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="h-7 w-7 rounded-full bg-redhat/10 flex items-center justify-center">
                <span className="text-xs font-bold text-redhat">{persona.initials}</span>
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

          {/* Mobile hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 -mr-2">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-redhat/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-redhat">{persona.initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{persona.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{persona.company}</p>
                    </div>
                  </div>
                  <Select
                    value={persona.email}
                    onValueChange={(email) => {
                      const p = CUSTOMER_PERSONAS.find((c) => c.email === email);
                      if (p) setPersona(p);
                    }}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
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
                <nav className="flex-1 p-4 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        link.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Switch View</p>
                  <div className="flex items-center rounded-full border bg-muted/50 p-0.5 text-xs">
                    <span className="flex-1 text-center px-3 py-1.5 rounded-full bg-redhat text-redhat-foreground font-medium">👤 Customer</span>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate("/internal"); }}
                      className="flex-1 text-center px-3 py-1.5 rounded-full text-muted-foreground"
                    >
                      🏦 Finance
                    </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Demo Mode Banner */}
      {!demoBannerDismissed && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-center gap-2">
          <p className="text-xs text-foreground">
            🎭 <span className="font-semibold">Demo Mode</span>
            <span className="hidden sm:inline"> — You are viewing this portal as <span className="font-semibold">{persona.name}</span>, a customer from {persona.company}. This simulates what a real Red Hat AWS Marketplace customer would see after purchasing.</span>
            <span className="sm:hidden"> — Viewing as <span className="font-semibold">{persona.name}</span></span>
          </p>
          <button onClick={() => setDemoBannerDismissed(true)} className="text-muted-foreground hover:text-foreground ml-2 shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Persona switcher strip — hidden on mobile (redundant with hamburger) */}
      <div className="hidden md:block bg-muted/30 border-b px-4 py-1 text-center">
        <p className="text-[11px] text-muted-foreground">
          <User className="h-3 w-3 inline mr-1" />
          Viewing as <span className="font-semibold text-foreground">{persona.name}</span> from {persona.company}
          <span className="mx-2">·</span>
          <Link to="/internal" className="text-primary hover:underline">Switch to Finance Portal</Link>
        </p>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card py-6 md:py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-muted-foreground px-4">
          <p>© 2026 <span className="text-redhat font-medium">Red Hat</span> Partner Credit Funding Portal.</p>
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
