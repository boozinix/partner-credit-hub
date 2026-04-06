import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PersonaProvider } from "@/contexts/PersonaContext";
import Index from "./pages/Index";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerSubmit from "./pages/CustomerSubmit";
import CustomerRequests from "./pages/CustomerRequests";
import CustomerStatus from "./pages/CustomerStatus";
import InternalDashboard from "./pages/InternalDashboard";
import InternalReports from "./pages/InternalReports";
import InternalUsers from "./pages/InternalUsers";
import InternalSettings from "./pages/InternalSettings";
import DealDetail from "./pages/DealDetail";
import ApproverView from "./pages/ApproverView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PersonaProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Customer Portal */}
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/submit" element={<CustomerSubmit />} />
            <Route path="/customer/requests" element={<CustomerRequests />} />
            <Route path="/customer/status/:trackingId" element={<CustomerStatus />} />
            {/* Internal Portal */}
            <Route path="/internal" element={<InternalDashboard />} />
            <Route path="/internal/reports" element={<InternalReports />} />
            <Route path="/internal/users" element={<InternalUsers />} />
            <Route path="/internal/settings" element={<InternalSettings />} />
            <Route path="/internal/deals/:trackingId" element={<DealDetail />} />
            <Route path="/internal/approver/:trackingId" element={<ApproverView />} />
            {/* Legacy routes redirect */}
            <Route path="/submit" element={<CustomerSubmit />} />
            <Route path="/my-requests" element={<CustomerRequests />} />
            <Route path="/status/:trackingId" element={<CustomerStatus />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PersonaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
