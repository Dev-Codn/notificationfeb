import { useState } from "react";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface AddCustomerDialogProps {
  trigger?: React.ReactNode;
}

export function AddCustomerDialog({ trigger }: AddCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    houseNo: "",
    streetNo: "",
    area: "",
    city: "",
    bottleCount: 0,
    avgDaysToRefill: "",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    setFormData({
      ...formData,
      [id]: value,
    });

    // Clear field errors when user starts typing
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({
        ...prev,
        [id]: null
      }));
    }

    // If phone number changes and whatsapp is empty, clear whatsapp
    if (id === 'phone' && !formData.whatsapp) {
      setFormData(prev => ({
        ...prev,
        phone: value,
        whatsapp: ""
      }));
    }
  };

  // Check if phone and whatsapp are the same
  const isPhoneWhatsappSame = formData.phone && formData.whatsapp && formData.phone === formData.whatsapp;
  const showWhatsappField = !isPhoneWhatsappSame;

  // Clear errors when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setFieldErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }

    // Phone validation
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || null,
        houseNo: formData.houseNo.trim() || null,
        streetNo: formData.streetNo.trim() || null,
        area: formData.area.trim() || null,
        city: formData.city.trim() || null,
        bottleCount: parseInt(formData.bottleCount) || 0,
        avgDaysToRefill: formData.avgDaysToRefill ? parseInt(formData.avgDaysToRefill) : null,
      };

      const response = await apiService.createCustomer(customerData);
      console.log('API Response:', response);
      
      if (response.success) {
        toast.success(`Customer "${formData.name}" added successfully!`);
        
        // Reset form
        setFormData({
          name: "",
          phone: "",
          whatsapp: "",
          houseNo: "",
          streetNo: "",
          area: "",
          city: "",
          bottleCount: 0,
          avgDaysToRefill: "",
          notes: "",
        });
        setOpen(false);
        
        // Refresh the page to show new customer
        window.location.reload();
      } else {
        // Handle specific error messages from backend
        if (response.error === 'DUPLICATE_ENTRY') {
          const field = response.details?.field || 'field';
          const fieldName = field === 'phone' ? 'phone' : field === 'whatsapp' ? 'whatsapp' : field;
          setFieldErrors({ [fieldName]: response.message });
          toast.error(response.message);
        } else if (response.error === 'DATABASE_ERROR') {
          toast.error(response.message || 'Database validation error');
        } else {
          toast.error(response.message || "Failed to add customer. Please try again.");
        }
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      
      // Handle network errors or other issues
      if (error.message.includes('Failed to fetch')) {
        toast.error("Unable to connect to server. Please check your connection and try again.");
      } else if (error.message.includes('NetworkError')) {
        toast.error("Network error. Please check your internet connection.");
      } else {
        // Try to extract error message from the error object
        const errorMessage = error.message || error.toString() || "Failed to add customer. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter customer details to add them to your database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Customer Name <span className="text-destructive">*</span>
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
                placeholder="+92 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className={fieldErrors.phone ? "border-red-500 focus:border-red-500" : ""}
                required
              />
              {fieldErrors.phone && (
                <p className="text-sm text-red-500">{fieldErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              {showWhatsappField ? (
                <div className="space-y-2">
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+92 98765 43210 (optional)"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className={fieldErrors.whatsapp ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.whatsapp && (
                    <p className="text-sm text-red-500">{fieldErrors.whatsapp}</p>
                  )}
                  {formData.phone && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          whatsapp: prev.phone
                        }));
                      }}
                      className="w-full"
                    >
                      📱 Use same as phone number
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <span className="text-green-600">📱</span>
                  <span className="text-sm text-green-700">
                    Same as phone number: {formData.phone}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        whatsapp: ""
                      }));
                    }}
                    className="ml-auto text-xs"
                  >
                    Change
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bottleCount">Number of Bottles</Label>
              <Input
                id="bottleCount"
                type="number"
                min="0"
                placeholder="0"
                value={formData.bottleCount}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                How many bottles does this customer currently have?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgDaysToRefill">Average Days to Refill</Label>
              <Input
                id="avgDaysToRefill"
                type="number"
                min="1"
                placeholder="7 (optional)"
                value={formData.avgDaysToRefill}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                How often does this customer typically need a refill? (in days)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseNo">House/Flat Number</Label>
              <Input
                id="houseNo"
                placeholder="House/Flat number"
                value={formData.houseNo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="streetNo">Street Number</Label>
              <Input
                id="streetNo"
                placeholder="Street number"
                value={formData.streetNo}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area/Neighborhood</Label>
              <Input
                id="area"
                placeholder="Area, sector, or neighborhood"
                value={formData.area}
                onChange={handleChange}
              />
            </div>
          </div>


          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or preferences..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Customer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
