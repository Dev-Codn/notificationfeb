import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, TruckIcon, Package, Calendar } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { AssignRiderDialog } from "@/components/admin/AssignRiderDialog";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrderById(id!);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-500';
      case 'ASSIGNED': return 'bg-blue-500';
      case 'IN_PROGRESS': return 'bg-purple-500';
      case 'DELIVERED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'default';
      case 'NOT_PAID': return 'destructive';
      case 'PARTIAL': return 'secondary';
      case 'OVERPAID': return 'default';
      default: return 'outline';
    }
  };

  const timeline = order ? [
    { status: "Created", time: new Date(order.createdAt).toLocaleString(), completed: true },
    { status: "Assigned", time: order.riderId ? new Date(order.updatedAt).toLocaleString() : "-", completed: !!order.riderId },
    { status: "In Progress", time: order.status === 'IN_PROGRESS' || order.status === 'DELIVERED' ? new Date(order.updatedAt).toLocaleString() : "-", completed: order.status === 'IN_PROGRESS' || order.status === 'DELIVERED' },
    { status: "Delivered", time: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : "-", completed: order.status === 'DELIVERED' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/admin/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Order #{order.id.slice(-4)}</h1>
          <p className="text-muted-foreground">Order Details</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
          <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
            {order.paymentStatus.replace('_', ' ')}
          </Badge>
          <Badge variant="outline">
            {order.priority}
          </Badge>
          {!order.riderId && order.status === 'PENDING' && (
            <AssignRiderDialog orderId={order.id} onRiderAssigned={fetchOrderDetail} />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{order.customer.phone}</p>
            </div>
            {order.customer.whatsapp && (
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{order.customer.whatsapp}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">
                {[
                  order.customer.houseNo,
                  order.customer.streetNo,
                  order.customer.area,
                  order.customer.city
                ].filter(Boolean).join(', ') || 'No address provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className={`font-medium ${parseFloat(order.customer.currentBalance) < 0 ? 'text-destructive' : 'text-green-600'}`}>
                ₹{Math.abs(parseFloat(order.customer.currentBalance)).toFixed(2)} 
                {parseFloat(order.customer.currentBalance) < 0 ? ' (Due)' : parseFloat(order.customer.currentBalance) > 0 ? ' (Credit)' : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5" />
              Rider Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.rider ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.rider.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.rider.phone}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No rider assigned yet</p>
                <AssignRiderDialog orderId={order.id} onRiderAssigned={fetchOrderDetail} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-medium">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid Amount</span>
            <span className="font-medium">₹{parseFloat(order.paidAmount).toFixed(2)}</span>
          </div>
          {parseFloat(order.totalAmount) - parseFloat(order.paidAmount) !== 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance Due</span>
              <span className="font-medium text-destructive">₹{(parseFloat(order.totalAmount) - parseFloat(order.paidAmount)).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-4">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">{order.paymentMethod.replace('_', ' ')}</span>
          </div>
          {order.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Delivery Notes</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
          {order.paymentNotes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Notes</p>
              <p className="text-sm">{order.paymentNotes}</p>
            </div>
          )}
          <div className="pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created: {new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((step, index) => (
              <div key={step.status} className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${step.completed ? "" : "text-muted-foreground"}`}>
                    {step.status}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;

