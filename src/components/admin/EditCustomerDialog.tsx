import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  houseNo?: string;
  streetNo?: string;
  area?: string;
  city?: string;
  bottleCount: number;
  isActive: boolean;
}

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onCustomerUpdated: (updatedCustomer: Customer) => void;
}

export function EditCustomerDialog({ 
  open, 
  onOpenChange, 
  customer, 
  onCustomerUpdated 
}: EditCustomerDialogProps) {
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
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);

  // Fetch complete customer data when dialog opens
  useEffect(() => {
    if (open && customer?.id) {
      fetchCustomerData();
    }
  }, [open, customer?.id]);

  const fetchCustomerData = async () => {
    try {
      setFetchingCustomer(true);
      const response = await apiService.getCustomerById(customer.id);
      
      if (response.success) {
        const customerData = response.data;
        setFormData({
          name: customerData.name || "",
          phone: customerData.phone || "",
          whatsapp: customerData.whatsapp || "",
          houseNo: customerData.houseNo || "",
          streetNo: customerData.streetNo || "",
          area: customerData.area || "",
          city: customerData.city || "",
          bottleCount: customerData.bottleCount || 0,
          avgDaysToRefill: customerData.avgDaysToRefill || "",
        });
        setFieldErrors({});
      } else {
        toast.error('Failed to fetch customer data');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to fetch customer data');
    } finally {
      setFetchingCustomer(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    setFormData({
      ...formData,
      [id]: value,
    });

    // Clear field errors when user starts typing
    if (fieldErrors[id as keyof typeof fieldErrors]) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) return;
    
    if (!formData.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      setLoading(true);
      
      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || null,
        houseNo: formData.houseNo.trim() || null,
        streetNo: formData.streetNo.trim() || null,
        area: formData.area.trim() || null,
        city: formData.city.trim() || null,
        bottleCount: parseInt(formData.bottleCount.toString()) || 0,
        avgDaysToRefill: formData.avgDaysToRefill ? parseInt(formData.avgDaysToRefill) : null,
      };

      const response = await apiService.updateCustomer(customer.id, customerData);
      console.log('Update API Response:', response);
      
      if (response.success) {
        toast.success(`Customer "${formData.name}" updated successfully!`);
        
        // Update the customer in the parent component
        onCustomerUpdated({
          ...customer,
          ...customerData,
        });
        
        onOpenChange(false);
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
          toast.error(response.message || "Failed to update customer. Please try again.");
        }
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      
      // Handle network errors or other issues
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          toast.error("Unable to connect to server. Please check your connection and try again.");
        } else if (error.message.includes('NetworkError')) {
          toast.error("Network error. Please check your internet connection.");
        } else {
          toast.error("Failed to update customer. Please try again.");
        }
      } else {
        toast.error("Failed to update customer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information. All fields are optional except name and phone.
          </DialogDescription>
        </DialogHeader>
        
        {fetchingCustomer ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading customer data...</div>
          </div>
        ) : (
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                value={formData.name}
                onChange={handleChange}
                className={fieldErrors.name ? "border-red-500 focus:border-red-500" : ""}
                required
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-500">{fieldErrors.name}</p>
              )}
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="houseNo">House Number</Label>
              <Input
                id="houseNo"
                placeholder="123"
                value={formData.houseNo}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetNo">Street Number</Label>
              <Input
                id="streetNo"
                placeholder="456"
                value={formData.streetNo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="area">Area/Neighborhood</Label>
              <Input
                id="area"
                placeholder="Area, sector, or neighborhood"
                value={formData.area}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Delhi"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Customer'}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
