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
import { WorkCenters } from "./pages/WorkCenters";
import { WorkCenterNew } from "./pages/WorkCenterNew";
import { WorkCenterDetails } from "./pages/WorkCenterDetails";
import { WorkCenterEdit } from "./pages/WorkCenterEdit";
import { Stock } from "./pages/Stock";
import { ProductMaster } from "./pages/ProductMaster";
import { StockMovements } from "./pages/StockMovements";
import { BOMList } from "./pages/BOMList";
import { BOMNew } from "./pages/BOMNew";
import { BOMDetails } from "./pages/BOMDetails";
import { BOMEdit } from "./pages/BOMEdit";
import { ManufacturingOrderNew } from "./pages/ManufacturingOrderNew";
import { ManufacturingOrderDetails } from "./pages/ManufacturingOrderDetails";
import { ManufacturingOrderEdit } from "./pages/ManufacturingOrderEdit";
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
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
              <Route path="manufacturing-orders/new" element={<ManufacturingOrderNew />} />
              <Route path="manufacturing-orders/:id" element={<ManufacturingOrderDetails />} />
              <Route path="manufacturing-orders/:id/edit" element={<ManufacturingOrderEdit />} />
              
              {/* Work Order routes */}
              <Route path="work-orders" element={<WorkOrders />} />
              <Route path="work-orders/new" element={<div>New Work Order (Coming Soon)</div>} />
              <Route path="work-orders/:id" element={<div>Work Order Details (Coming Soon)</div>} />
              
              {/* Work Center routes */}
              <Route path="work-centers" element={<WorkCenters />} />
              <Route path="work-centers/new" element={<WorkCenterNew />} />
              <Route path="work-centers/:id" element={<WorkCenterDetails />} />
              <Route path="work-centers/:id/edit" element={<WorkCenterEdit />} />
              
              {/* Stock routes */}
              <Route path="stock" element={<Stock />} />
              <Route path="stock/products" element={<ProductMaster />} />
              <Route path="stock/movements" element={<StockMovements />} />
              <Route path="stock/products/new" element={<div>New Product (Coming Soon)</div>} />
              <Route path="stock/products/:id" element={<div>Product Details (Coming Soon)</div>} />
              <Route path="stock/products/:id/edit" element={<div>Edit Product (Coming Soon)</div>} />
              <Route path="stock/movements/new" element={<div>New Movement (Coming Soon)</div>} />
              <Route path="stock/movements/:id" element={<div>Movement Details (Coming Soon)</div>} />
              
              {/* BOM routes */}
              <Route path="bom" element={<BOMList />} />
              <Route path="bom/new" element={<BOMNew />} />
              <Route path="bom/:id" element={<BOMDetails />} />
              <Route path="bom/:id/edit" element={<BOMEdit />} />
              
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
