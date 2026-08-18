import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ProtectedRoute, GuestRoute, OnboardingRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProfileSetup from "./pages/onboarding/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import ClassDetail from "./pages/ClassDetail";
import StudentProfile from "./pages/StudentProfile";
import BadgesPage from "./pages/BadgesPage";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
              <Route path="/setup" element={<OnboardingRoute><ProfileSetup /></OnboardingRoute>} />

              <Route path="/" element={<Protected><Dashboard /></Protected>} />
              <Route path="/classes" element={<Protected><Classes /></Protected>} />
              <Route path="/classes/:classId" element={<Protected><ClassDetail /></Protected>} />
              <Route path="/students/:studentId" element={<Protected><StudentProfile /></Protected>} />
              <Route path="/badges" element={<Protected><BadgesPage /></Protected>} />
              <Route path="/reports" element={<Protected><Reports /></Protected>} />
              <Route path="/settings" element={<Protected><Settings /></Protected>} />
              <Route path="/profile" element={<Protected><Settings /></Protected>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
