import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { RiderHeader } from "@/components/rider/RiderHeader";
import { RiderMobileNav } from "@/components/rider/RiderMobileNav";
import { apiService } from "@/services/api";
import { useNotifications } from "@/hooks/use-notifications";

const RiderLayout = () => {
  const user = apiService.getCurrentUser();
  const userId = user?.id;

  // Initialize notifications for rider
  const { isInitialized, isConnected } = useNotifications(userId);

  useEffect(() => {
    if (isInitialized) {
      console.log('✅ Notifications initialized for rider');
    }
  }, [isInitialized]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RiderHeader />
      
      <main className="flex-1 p-4 pb-20 md:pb-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <RiderMobileNav />
      
      {/* Connection status indicator - only show if initialized but disconnected */}
      {process.env.NODE_ENV === 'development' && isInitialized && !isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-md text-sm shadow-lg">
          🔄 Reconnecting...
        </div>
      )}
    </div>
  );
};

export default RiderLayout;
