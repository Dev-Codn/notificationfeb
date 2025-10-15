import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Phone, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";
import { toast } from "sonner";

const RiderDashboard = () => {
  const [activeTab, setActiveTab] = useState("assigned");
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riderName, setRiderName] = useState("Rider");
  const [stats, setStats] = useState({ totalToday: 0, completed: 0, pending: 0 });

  useEffect(() => {
    fetchRiderData();
  }, []);

  const fetchRiderData = async () => {
    try {
      setLoading(true);
      
      // Get current user from localStorage
      const user = apiService.getCurrentUser();
      if (!user || !user.riderProfile) {
        toast.error('Rider profile not found');
        return;
      }

      const riderId = user.riderProfile.id;
      const riderProfileName = user.riderProfile.name;
      setRiderName(riderProfileName);

      // Fetch rider dashboard data
      const response = await apiService.getRiderDashboard(riderId);
      
      if (response.success) {
        setAssignedDeliveries(response.data.assignedDeliveries || []);
        setCompletedDeliveries(response.data.completedDeliveries || []);
        setStats(response.data.stats || { totalToday: 0, completed: 0, pending: 0 });
      } else {
        toast.error('Failed to load dashboard data');
        setAssignedDeliveries([]);
        setCompletedDeliveries([]);
      }
    } catch (error) {
      console.error('Error fetching rider data:', error);
      toast.error('Failed to load dashboard data');
      setAssignedDeliveries([]);
      setCompletedDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hi, {riderName}! 👋</h1>
        <p className="text-muted-foreground">You have {stats.pending} pending deliveries today</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned">Assigned ({assignedDeliveries.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedDeliveries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4 mt-4">
          {assignedDeliveries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium">No pending deliveries</p>
                <p className="text-sm text-muted-foreground">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            assignedDeliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{delivery.id}</p>
                      <Badge variant="secondary">Assigned</Badge>
                    </div>
                    <p className="font-medium">{delivery.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{delivery.amount}</p>
                    <p className="text-sm text-muted-foreground">{delivery.bottles} bottles</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{delivery.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{delivery.phone}</span>
                  </div>
                </div>

                <Link to={`/rider/orders/${delivery.id.replace('#', '')}`}>
                  <Button className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Delivered
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedDeliveries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium">No completed deliveries yet</p>
                <p className="text-sm text-muted-foreground">Completed deliveries will appear here</p>
              </CardContent>
            </Card>
          ) : (
            completedDeliveries.map((delivery) => (
            <Card key={delivery.id} className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{delivery.id}</p>
                      <Badge variant="default">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    </div>
                    <p className="font-medium">{delivery.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{delivery.amount}</p>
                    <Badge variant="default" className="mt-1">Paid</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{delivery.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiderDashboard;
