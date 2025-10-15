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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface CreateOrderDialogProps {
  trigger?: React.ReactNode;
  onOrderCreated?: () => void;
}

export function CreateOrderDialog({ trigger, onOrderCreated }: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [selectedRider, setSelectedRider] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);

  // Fetch customers and riders when dialog opens
  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchRiders();
    }
  }, [open]);

  const fetchCustomers = async () => {
    try {
      const response = await apiService.getCustomers();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
  };

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

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error("Please enter valid amount");
      return;
    }

    try {
      setLoading(true);

      // Create order
      const orderData: any = {
        customerId: selectedCustomer.id,
        totalAmount: parseFloat(totalAmount),
        priority: priority,
        notes: notes || undefined
      };

      const orderResponse = await apiService.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const orderId = orderResponse.data.id;

      // If rider is selected, assign the order
      if (selectedRider) {
        await apiService.updateOrderStatus(orderId, 'ASSIGNED', selectedRider);
        toast.success(`Order created and assigned successfully!`);
      } else {
        toast.success(`Order created successfully!`);
      }

      // Reset form
      setSelectedCustomer(null);
      setSearchQuery("");
      setTotalAmount("");
      setSelectedRider("");
      setPriority("NORMAL");
      setNotes("");
      setOpen(false);

      // Refresh orders list if callback provided
      if (onOrderCreated) {
        onOrderCreated();
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Search for customer and fill in order details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Search */}
          <div className="space-y-2">
            <Label>Search Customer (by name or phone)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchQuery && !selectedCustomer && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setSearchQuery("");
                      }}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          {customer.address && (
                            <p className="text-xs text-muted-foreground mt-1">{customer.address}</p>
                          )}
                        </div>
                        <Badge variant={customer.currentBalance < 0 ? "destructive" : "default"}>
                          {customer.currentBalance < 0 ? `₹${Math.abs(customer.currentBalance).toFixed(2)} due` : customer.currentBalance > 0 ? `₹${customer.currentBalance.toFixed(2)} credit` : "Clear"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-sm text-muted-foreground">No customers found</p>
                )}
              </div>
            )}
          </div>

          {/* Selected Customer Info */}
          {selectedCustomer && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  {selectedCustomer.address && (
                    <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                  )}
                  {selectedCustomer.lastOrder && (
                    <p className="text-xs text-muted-foreground">
                      Last order: ₹{selectedCustomer.lastOrder.amount} - {selectedCustomer.lastOrder.date}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant={selectedCustomer.currentBalance < 0 ? "destructive" : "default"}>
                    {selectedCustomer.currentBalance < 0 ? "Payable" : selectedCustomer.currentBalance > 0 ? "Receivable" : "Clear"}
                  </Badge>
                  {selectedCustomer.currentBalance !== 0 && (
                    <p className="text-sm font-medium mt-1">₹{Math.abs(selectedCustomer.currentBalance).toFixed(2)}</p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setSelectedCustomer(null)}
              >
                Change Customer
              </Button>
            </div>
          )}

          {/* Order Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount (₹) *</Label>
              <Input
                id="totalAmount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter total amount"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Total Amount Display */}
          {totalAmount && (
            <div className="rounded-lg border bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="text-2xl font-bold">
                  ₹{parseFloat(totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Rider Assignment */}
          <div className="space-y-2">
            <Label htmlFor="rider">Assign Rider (Optional)</Label>
            <Select value={selectedRider} onValueChange={setSelectedRider}>
              <SelectTrigger id="rider">
                <SelectValue placeholder="Select a rider (leave empty to assign later)" />
              </SelectTrigger>
              <SelectContent>
                {riders.length > 0 ? (
                  riders.map((rider) => (
                    <SelectItem key={rider.id} value={rider.id}>
                      <div className="flex items-center gap-2">
                        <span>{rider.name}</span>
                        <Badge variant={rider.isActive ? "default" : "secondary"} className="ml-auto">
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
            <p className="text-xs text-muted-foreground">
              You can assign a rider now or leave it pending to assign later
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add delivery instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : selectedRider ? "Create & Assign Order" : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
