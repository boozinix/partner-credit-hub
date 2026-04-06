import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">RH</span>
            </div>
            <span className="font-display font-bold text-lg">Partner Credit Portal</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/submit"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/submit" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Submit Request
            </Link>
            <Link
              to="/my-requests"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/my-requests" ? "text-primary" : "text-muted-foreground"
              )}
            >
              My Requests
            </Link>
            <Link
              to="/internal"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname.startsWith("/internal") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Internal Portal
            </Link>
          </nav>
        </div>
      </header>
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
