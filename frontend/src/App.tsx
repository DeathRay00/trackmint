import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { useIsAuthenticated } from "./store";

// Auth pages
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { OTP } from "./pages/auth/OTP";

// Main pages
import { Dashboard } from "./pages/Dashboard";
import { ManufacturingOrders } from "./pages/ManufacturingOrders";
import { WorkOrders } from "./pages/WorkOrders";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth/login" element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login />
            } />
            <Route path="/auth/signup" element={
              isAuthenticated ? <Navigate to="/" replace /> : <Signup />
            } />
            <Route path="/auth/forgot-password" element={
              isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />
            } />
            <Route path="/auth/otp" element={
              isAuthenticated ? <Navigate to="/" replace /> : <OTP />
            } />

            {/* Protected routes with layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* Manufacturing routes */}
              <Route path="manufacturing-orders" element={<ManufacturingOrders />} />
              <Route path="manufacturing-orders/new" element={<div>New Manufacturing Order (Coming Soon)</div>} />
              <Route path="manufacturing-orders/:id" element={<div>Manufacturing Order Details (Coming Soon)</div>} />
              
              {/* Work Order routes */}
              <Route path="work-orders" element={<WorkOrders />} />
              <Route path="work-orders/new" element={<div>New Work Order (Coming Soon)</div>} />
              <Route path="work-orders/:id" element={<div>Work Order Details (Coming Soon)</div>} />
              
              {/* Work Center routes */}
              <Route path="work-centers" element={<div>Work Centers (Coming Soon)</div>} />
              <Route path="work-centers/new" element={<div>New Work Center (Coming Soon)</div>} />
              <Route path="work-centers/:id" element={<div>Work Center Details (Coming Soon)</div>} />
              
              {/* Stock routes */}
              <Route path="stock" element={<div>Stock Ledger (Coming Soon)</div>} />
              <Route path="stock/products" element={<div>Product Master (Coming Soon)</div>} />
              <Route path="stock/movements" element={<div>Stock Movements (Coming Soon)</div>} />
              
              {/* BOM routes */}
              <Route path="bom" element={<div>BOM List (Coming Soon)</div>} />
              <Route path="bom/new" element={<div>New BOM (Coming Soon)</div>} />
              <Route path="bom/:id" element={<div>BOM Details (Coming Soon)</div>} />
              
              {/* Profile routes */}
              <Route path="me" element={<div>My Profile (Coming Soon)</div>} />
              <Route path="me/reports" element={<div>My Reports (Coming Soon)</div>} />
              
              {/* Analytics and Reports */}
              <Route path="analytics" element={<div>Analytics (Coming Soon)</div>} />
              <Route path="reports" element={<div>Reports (Coming Soon)</div>} />
            </Route>

            {/* Fallback routes */}
            <Route path="/welcome" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
