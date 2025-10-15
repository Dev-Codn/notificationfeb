import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TruckIcon, Package } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface AssignRiderDialogProps {
  trigger?: React.ReactNode;
  orderId?: string;
  onRiderAssigned?: () => void;
}

export function AssignRiderDialog({ trigger, orderId, onRiderAssigned }: AssignRiderDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState("");
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRiders();
    }
  }, [open]);

  const fetchRiders = async () => {
    try {
      const response = await apiService.getRiders();
      if (response.success) {
        setRiders(response.data);
      }
    } catch (error) {
      console.error('Error fetching riders:', error);
      toast.error('Failed to load riders');
    }
  };

  const selectedRiderData = riders.find(r => r.id === selectedRider);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRider) {
      toast.error("Please select a rider");
      return;
    }

    if (!orderId) {
      toast.error("Order ID is missing");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.updateOrderStatus(orderId, 'ASSIGNED', selectedRider);
      
      if (response.success) {
        const riderName = riders.find(r => r.id === selectedRider)?.name;
        toast.success(`Order assigned to ${riderName}`);
        setSelectedRider("");
        setOpen(false);
        
        // Call callback to refresh order details
        if (onRiderAssigned) {
          onRiderAssigned();
        }
      } else {
        toast.error(response.message || 'Failed to assign rider');
      }
    } catch (error: any) {
      console.error('Error assigning rider:', error);
      toast.error(error.message || 'Failed to assign rider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <TruckIcon className="mr-2 h-4 w-4" />
            Assign Rider
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Rider to Order</DialogTitle>
          <DialogDescription>
            {orderId ? `Select a rider for order ${orderId}` : "Select a rider for the order"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rider">
              Select Rider <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedRider} onValueChange={setSelectedRider} required>
              <SelectTrigger id="rider">
                <SelectValue placeholder="Choose a rider" />
              </SelectTrigger>
              <SelectContent>
                {riders.length > 0 ? (
                  riders.map((rider) => (
                    <SelectItem 
                      key={rider.id} 
                      value={rider.id}
                      disabled={!rider.isActive}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <TruckIcon className="h-4 w-4" />
                        <span>{rider.name}</span>
                        <Badge 
                          variant={rider.isActive ? "default" : "secondary"}
                          className="ml-auto"
                        >
                          {rider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No riders available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Rider Details */}
          {selectedRiderData && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Rider Name</p>
                    <p className="font-medium">{selectedRiderData.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedRiderData.phone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-warning" />
                        <p className="text-2xl font-bold">{selectedRiderData.pendingDeliveries || 0}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Pending Deliveries</p>
                    </div>
                    
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-success" />
                        <p className="text-2xl font-bold">{selectedRiderData.totalDeliveries || 0}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Total Completed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign Rider"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
