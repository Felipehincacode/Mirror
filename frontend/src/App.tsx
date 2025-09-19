import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Suppress React Router warnings in development
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('React Router Future Flag Warning')) {
      return; // Suppress React Router warnings
    }
    originalWarn.apply(console, args);
  };
}

const App = () => {
  // Debug logging for PWA and permissions
  console.log('[DEBUG] App component mounted');
  console.log('[DEBUG] PWA status - isStandalone:', window.matchMedia('(display-mode: standalone)').matches);
  console.log('[DEBUG] Protocol:', window.location.protocol);
  console.log('[DEBUG] Hostname:', window.location.hostname);

  // Check if manifest is loaded
  if ('manifest' in document.createElement('link')) {
    console.log('[DEBUG] Manifest link element supported');
  } else {
    console.log('[DEBUG] Manifest link element not supported');
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NetworkStatus />
          <AuthProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
