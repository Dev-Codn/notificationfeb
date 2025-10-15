import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EditCustomerDialog } from '@/components/admin/EditCustomerDialog';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Droplet, 
  DollarSign, 
  Package, 
  Calendar,
  User,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  bottleCount: number;
  address: string;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orders: Order[];
  stats: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  };
}

interface Order {
  id: string;
  orderId: string;
  status: string;
  priority: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  rider?: {
    name: string;
    phone: string;
  };
  notes?: string;
  createdAt: string;
  deliveredAt?: string;
}

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCustomerById(id!);
      
      if (response.success) {
        setCustomer(response.data);
      } else {
        setError(response.message || 'Failed to fetch customer details');
        toast.error(response.message || 'Failed to fetch customer details');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setError('Failed to fetch customer details');
      toast.error('Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (isActive: boolean) => {
    if (!customer) return;
    
    try {
      setUpdatingStatus(true);
      const response = await apiService.updateCustomerStatus(customer.id, isActive);
      
      if (response.success) {
        setCustomer(prev => prev ? { ...prev, isActive } : null);
        toast.success(`Customer ${isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.message || 'Failed to update customer status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditCustomer = () => {
    setSelectedCustomer({ id: customer.id });
    setEditDialogOpen(true);
  };

  const handleCustomerUpdated = (updatedCustomer) => {
    setCustomer(updatedCustomer);
    setEditDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Customer Not Found</h2>
          <p className="text-gray-600 mt-2">{error || 'The customer you are looking for does not exist.'}</p>
        </div>
        <Button onClick={() => navigate('/admin/customers')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/admin/customers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">Customer Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEditCustomer}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
        </Button>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{customer.phone}</span>
            </div>
            {customer.whatsapp && (
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{customer.whatsapp}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {customer.address || 'No address provided'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bottle Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Bottle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{customer.bottleCount}</div>
              <div className="text-sm text-muted-foreground">Bottles</div>
              {customer.avgDaysToRefill && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Avg refill: {customer.avgDaysToRefill} days
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Balance Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-2xl font-bold ${customer.currentBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                Rs {Math.abs(customer.currentBalance).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {customer.currentBalance < 0 ? 'Payable' : 'Receivable'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Orders:</span>
              <span className="font-medium">{customer.stats.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Completed:</span>
              <span className="font-medium text-green-600">{customer.stats.completedOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending:</span>
              <span className="font-medium text-yellow-600">{customer.stats.pendingOrders}</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Spent:</span>
              <span className="font-medium">Rs {customer.stats.totalSpent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Order:</span>
              <span className="font-medium">Rs {customer.stats.averageOrderValue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="status-toggle" className="text-sm font-medium">
                Account Status
              </Label>
              <div className="flex items-center gap-3">
                <Badge variant={customer.isActive ? "default" : "secondary"}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Switch
                  id="status-toggle"
                  checked={customer.isActive}
                  onCheckedChange={handleStatusToggle}
                  disabled={updatingStatus}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Member Since:</span>
              <span className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
            {updatingStatus && (
              <div className="text-xs text-muted-foreground text-center">
                Updating status...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Orders Yet</h3>
              <p className="text-muted-foreground">This customer hasn't placed any orders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customer.orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{order.orderId}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">Rs {order.totalAmount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Payment:</span>
                      <div className="font-medium">
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                      </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <div className="font-medium capitalize">{order.paymentMethod}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid:</span>
                      <div className="font-medium">Rs {order.paidAmount.toFixed(2)}</div>
                    </div>
                    {order.rider && (
                      <div>
                        <span className="text-muted-foreground">Rider:</span>
                        <div className="font-medium">{order.rider.name}</div>
                      </div>
                    )}
                  </div>
                  
                  {order.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-sm text-muted-foreground">Notes:</span>
                      <div className="text-sm">{order.notes}</div>
                    </div>
                  )}
                  
                  {order.deliveredAt && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={customer}
        onCustomerUpdated={handleCustomerUpdated}
      />
    </div>
  );
};

export default CustomerDetail;