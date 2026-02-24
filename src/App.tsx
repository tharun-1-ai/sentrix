import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Chatbot from "@/components/Chatbot";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AnalyzeMessage from "./pages/AnalyzeMessage";
import WebsiteChecker from "./pages/WebsiteChecker";
import RecruiterVerification from "./pages/RecruiterVerification";
import OfferLetterScanner from "./pages/OfferLetterScanner";
import RiskReports from "./pages/RiskReports";
import ScamPrevention from "./pages/ScamPrevention";
import CommunityReports from "./pages/CommunityReports";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/analyze" element={<ProtectedRoute><AnalyzeMessage /></ProtectedRoute>} />
              <Route path="/dashboard/website" element={<ProtectedRoute><WebsiteChecker /></ProtectedRoute>} />
              <Route path="/dashboard/recruiter" element={<ProtectedRoute><RecruiterVerification /></ProtectedRoute>} />
              <Route path="/dashboard/offer-letter" element={<ProtectedRoute><OfferLetterScanner /></ProtectedRoute>} />
              <Route path="/dashboard/reports" element={<ProtectedRoute><RiskReports /></ProtectedRoute>} />
              <Route path="/dashboard/prevention" element={<ProtectedRoute><ScamPrevention /></ProtectedRoute>} />
              <Route path="/dashboard/community" element={<ProtectedRoute><CommunityReports /></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Chatbot />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
