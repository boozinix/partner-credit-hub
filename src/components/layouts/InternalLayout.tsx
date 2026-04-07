import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Settings, Users, LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { title: "Finance Queue", url: "/internal", icon: LayoutDashboard },
  { title: "Reports", url: "/internal/reports", icon: FileText },
  { title: "User Management", url: "/internal/users", icon: Users },
  { title: "Settings", url: "/internal/settings", icon: Settings },
];

function InternalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <span className="text-sidebar-primary-foreground font-display font-bold text-sm">RH</span>
        </div>
        {!collapsed && (
          <span className="font-display font-semibold text-sm text-sidebar-foreground">
            Finance Portal
          </span>
        )}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/internal"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground">
            SL
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">Sarah Lopez</p>
              <p className="text-xs text-sidebar-foreground/60">Finance Analyst</p>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}

export function InternalLayout({ children }: { children: React.ReactNode }) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [orientationDismissed, setOrientationDismissed] = useState(false);
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <InternalSidebar />
        <div className="flex-1 flex flex-col">
          {!bannerDismissed && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs text-amber-800 flex items-center justify-center gap-2">
              <span>🔶 Prototype — Built for interview purposes. All data is fictional.</span>
              <button onClick={() => setBannerDismissed(true)} className="text-amber-600 hover:text-amber-900 ml-2">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <header className="h-14 flex items-center border-b bg-card px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
            {/* View Toggle */}
            <div className="flex items-center rounded-full border bg-muted/50 p-0.5 text-xs">
              <button onClick={() => navigate("/customer")} className="px-3 py-1 rounded-full text-muted-foreground hover:text-foreground transition-colors">👤 Customer</button>
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium">🏦 Finance</span>
            </div>
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back to Overview
            </Link>
          </header>
          {/* Orientation Banner */}
          {!orientationDismissed && (
            <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs" style={{ minHeight: "40px" }}>
              <span>🏦 <span className="font-semibold">Internal View</span> — You are in the AWS Finance team dashboard. Customers see a separate simplified portal. Approvals, send-backs, and denials you make here update the customer's status in real time.</span>
              <button onClick={() => setOrientationDismissed(true)} className="text-white/60 hover:text-white ml-2 shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
