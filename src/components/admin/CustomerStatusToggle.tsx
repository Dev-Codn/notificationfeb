import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface CustomerStatusToggleProps {
  customerId: string;
  isActive: boolean;
  onStatusChange: (isActive: boolean) => void;
}

export const CustomerStatusToggle = ({ 
  customerId, 
  isActive, 
  onStatusChange 
}: CustomerStatusToggleProps) => {
  const [updating, setUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    try {
      setUpdating(true);
      const response = await apiService.updateCustomerStatus(customerId, checked);
      
      if (response.success) {
        onStatusChange(checked);
        toast.success(`Customer ${checked ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.message || 'Failed to update customer status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={updating}
        size="sm"
      />
      {updating && (
        <div className="text-xs text-muted-foreground">
          Updating...
        </div>
      )}
    </div>
  );
};
