import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface RiderStatusToggleProps {
  riderId: string;
  isActive: boolean;
  onStatusChange: (isActive: boolean) => void;
}

export function RiderStatusToggle({ riderId, isActive, onStatusChange }: RiderStatusToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.updateRiderStatus(riderId, !isActive);
      
      if (response.success) {
        onStatusChange(!isActive);
        toast.success(`Rider ${!isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating rider status:', error);
      const errorMessage = error.message || 'Failed to update rider status';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <span className="text-sm text-muted-foreground">
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          isActive ? "Active" : "Inactive"
        )}
      </span>
    </div>
  );
}
