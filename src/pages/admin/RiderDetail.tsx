import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Calendar, Package, MapPin, DollarSign, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
  orders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    deliveredAt?: string;
    customer: {
      name: string;
      phone: string;
    };
  }>;
}

interface RiderStats {
  totalDeliveries: number;
  todaysDeliveries: number;
  todaysPending: number;
  weeklyDeliveries: number;
  monthlyDeliveries: number;
  todaysReceivedAmount: number;
  totalEarnings: number;
}

const RiderDetail = () => {
  const { id } = useParams();
  const [rider, setRider] = useState<Rider | null>(null);
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiderData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getRiderById(id);
        
        if (response.success) {
          const riderData = response.data;
          setRider(riderData);
          
          // Calculate stats from the rider data
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const oneMonthAgo = new Date(today);
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
          // Today's orders
          const todaysOrders = riderData.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= today;
          });
          
          // Weekly orders
          const weeklyOrders = riderData.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= oneWeekAgo;
          });
          
          // Monthly orders
          const monthlyOrders = riderData.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= oneMonthAgo;
          });
          
          // Today's completed and pending orders
          const todaysCompleted = todaysOrders.filter(order => order.status === 'DELIVERED');
          const todaysPending = todaysOrders.filter(order => 
            order.status === 'ASSIGNED' || order.status === 'IN_PROGRESS'
          );
          
          // Today's received amount (from completed deliveries)
          const todaysReceivedAmount = todaysCompleted.reduce((sum, order) => 
            sum + parseFloat(order.totalAmount.toString()), 0
          );
          
          // All completed orders for total earnings
          const completedOrders = riderData.orders.filter(order => order.status === 'DELIVERED');
          const totalEarnings = completedOrders.reduce((sum, order) => 
            sum + parseFloat(order.totalAmount.toString()), 0
          );
          
          setStats({
            totalDeliveries: riderData.orders.length,
            todaysDeliveries: todaysCompleted.length,
            todaysPending: todaysPending.length,
            weeklyDeliveries: weeklyOrders.filter(order => order.status === 'DELIVERED').length,
            monthlyDeliveries: monthlyOrders.filter(order => order.status === 'DELIVERED').length,
            todaysReceivedAmount,
            totalEarnings
          });
        } else {
          setError(response.message || 'Failed to fetch rider data');
        }
      } catch (error) {
        console.error('Error fetching rider data:', error);
        setError('Failed to fetch rider data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRiderData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/riders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/riders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Rider Details</h1>
            <p className="text-muted-foreground">Error loading rider information</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rider || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/riders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Rider Not Found</h1>
            <p className="text-muted-foreground">The requested rider could not be found</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'assigned':
        return 'secondary';
      case 'in_progress':
        return 'outline';
      case 'pending':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/riders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{rider.name}</h1>
          <p className="text-muted-foreground">Rider Details</p>
        </div>
        <Button variant="outline">Assign Order</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyDeliveries}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyDeliveries}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Delivered:</span>
                <span className="font-bold text-green-600">{stats.todaysDeliveries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending:</span>
                <span className="font-bold text-orange-600">{stats.todaysPending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Received</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">RS {stats.todaysReceivedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed deliveries</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{rider.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined: {formatDate(rider.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {rider.orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found for this rider</p>
            </div>
          ) : (
          <div className="space-y-2">
              {rider.orders.slice(0, 10).map((order) => (
                <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">#{order.id.slice(-4)}</p>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                  </div>
                  
                  <div className="text-right space-y-1">
                      <p className="font-medium">RS {parseFloat(order.totalAmount.toString()).toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      {order.deliveredAt && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <MapPin className="h-3 w-3" />
                          <span>Delivered: {formatDate(order.deliveredAt)}</span>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiderDetail;
