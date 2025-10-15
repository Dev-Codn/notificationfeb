import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface EditRiderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rider: any;
  onRiderUpdated: (updatedRider: any) => void;
}

export function EditRiderDialog({ open, onOpenChange, rider, onRiderUpdated }: EditRiderDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    isActive: true,
  });

  useEffect(() => {
    if (rider) {
      setFormData({
        name: rider.name || "",
        phone: rider.phone || "",
        email: rider.email || "",
        isActive: rider.isActive !== undefined ? rider.isActive : true,
      });
    }
  }, [rider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rider?.id) {
      toast.error("Rider ID not found");
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter rider name");
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setLoading(true);
      
      const riderData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        isActive: formData.isActive,
      };

      const response = await apiService.updateRider(rider.id, riderData);
      
      if (response.success) {
        toast.success(`Rider "${formData.name}" updated successfully!`);
        onRiderUpdated(response.data);
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error updating rider:', error);
      const errorMessage = error.message || 'Failed to update rider';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Rider</DialogTitle>
          <DialogDescription>
            Update rider information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Rider Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="rider@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.isActive ? "active" : "inactive"} 
              onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Updating..." : "Update Rider"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
