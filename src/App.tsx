
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import CandidatePage from "./components/CandidatePage";
import CandidateViewPage from "./components/CandidateViewPage";
import CandidateLogin from "./components/CandidateLogin";

const queryClient = new QueryClient();

// Protect routes that require authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-300">Loading...</div>;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// Redirect logged-in users away from /auth page
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-300">Loading...</div>;
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={
      <PublicOnlyRoute>
        <AuthPage />
      </PublicOnlyRoute>
    } />
    <Route path="/" element={
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    } />
    {/* Candidate details page route */}
    <Route path="/candidate/:id" element={
      <ProtectedRoute>
        <CandidatePage />
      </ProtectedRoute>
    } />
    {/* Candidate view page route (now /candidate_view) */}
    <Route path="/candidate_view" element={<CandidateViewPage />} />
    {/* Candidate login route - no authentication required */}
    <Route path="/candidate-login" element={<CandidateLogin />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
