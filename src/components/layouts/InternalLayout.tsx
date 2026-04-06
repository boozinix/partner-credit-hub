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
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <InternalSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <Link
              to="/customer"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Switch to Customer Portal
            </Link>
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Home
            </Link>
          </header>
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs text-amber-800">
            🔶 Prototype — Interview Demo. All data is fictional.
          </div>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
