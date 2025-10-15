import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import AdminLayout from "./components/layouts/AdminLayout";
import RiderLayout from "./components/layouts/RiderLayout";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import Index from "./pages/Index";
import AdminDashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import CustomerDetail from "./pages/admin/CustomerDetail";
import Riders from "./pages/admin/Riders";
import RiderDetail from "./pages/admin/RiderDetail";
import Orders from "./pages/admin/Orders";
import OrderDetail from "./pages/admin/OrderDetail";
import Payments from "./pages/admin/Payments";
import Reports from "./pages/admin/Reports";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";
import RiderDashboard from "./pages/rider/Dashboard";
import RiderOrderDetail from "./pages/rider/OrderDetail";
import RiderPayments from "./pages/rider/Payments";
import RiderProfile from "./pages/rider/Profile";
import RiderNotifications from "./pages/rider/Notifications";
import AdminProfile from "./pages/admin/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAUpdatePrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={
            <AuthGuard requiredRole="ADMIN">
              <AdminLayout />
            </AuthGuard>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="riders" element={<Riders />} />
            <Route path="riders/:id" element={<RiderDetail />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Rider Routes - Protected */}
          <Route path="/rider" element={
            <AuthGuard requiredRole="RIDER">
              <RiderLayout />
            </AuthGuard>
          }>
            <Route index element={<RiderDashboard />} />
            <Route path="orders/:id" element={<RiderOrderDetail />} />
            <Route path="payments" element={<RiderPayments />} />
            <Route path="notifications" element={<RiderNotifications />} />
            <Route path="profile" element={<RiderProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
