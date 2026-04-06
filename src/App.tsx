import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import SubmitPage from "./pages/Submit";
import StatusPage from "./pages/Status";
import MyRequestsPage from "./pages/MyRequests";
import InternalDashboard from "./pages/InternalDashboard";
import DealDetail from "./pages/DealDetail";
import ApproverView from "./pages/ApproverView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/status/:trackingId" element={<StatusPage />} />
          <Route path="/my-requests" element={<MyRequestsPage />} />
          <Route path="/internal" element={<InternalDashboard />} />
          <Route path="/internal/deals/:trackingId" element={<DealDetail />} />
          <Route path="/internal/approver/:trackingId" element={<ApproverView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
