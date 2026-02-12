import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Students from "./pages/Students";
import BehaviorAnalysis from "./pages/BehaviorAnalysis";
import AcademicAnalysis from "./pages/AcademicAnalysis";
import BehaviorPlans from "./pages/BehaviorPlans";
import AcademicPlans from "./pages/AcademicPlans";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/students" element={<Students />} />
            <Route path="/behavior" element={<BehaviorAnalysis />} />
            <Route path="/academic" element={<AcademicAnalysis />} />
            <Route path="/behavior-plans" element={<BehaviorPlans />} />
            <Route path="/academic-plans" element={<AcademicPlans />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
