import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { apiService } from "@/services/api";
import { useNotifications } from "@/hooks/use-notifications";

const AdminLayout = () => {
  const user = apiService.getCurrentUser();
  const userId = user?.id;

  // Initialize notifications for admin
  const { isInitialized, isConnected } = useNotifications(userId);

  useEffect(() => {
    if (isInitialized) {
      console.log('✅ Notifications initialized for admin');
    }
  }, [isInitialized]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        <div className="flex flex-1 flex-col w-full">
          <AdminHeader />
          
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            <Outlet />
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden">
            <AdminMobileNav />
          </div>
        </div>

        {/* Connection status indicator - only show if initialized but disconnected */}
        {process.env.NODE_ENV === 'development' && isInitialized && !isConnected && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-md text-sm z-50 shadow-lg">
            🔄 Reconnecting...
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
