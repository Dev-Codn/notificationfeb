import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TruckIcon, Package, DollarSign, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateOrderDialog } from "@/components/admin/CreateOrderDialog";
import { AddCustomerDialog } from "@/components/admin/AddCustomerDialog";
import { apiService } from "@/services/api";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    {
      title: "Total Customers",
      value: "0",
      icon: Users,
      trend: "Loading...",
      color: "text-primary",
    },
    {
      title: "Total Riders",
      value: "0",
      icon: TruckIcon,
      trend: "Loading...",
      color: "text-success",
    },
    {
      title: "Orders Today",
      value: "0",
      icon: Package,
      trend: "Loading...",
      color: "text-warning",
    },
    {
      title: "Pending Payments",
      value: "₹0",
      icon: DollarSign,
      trend: "Loading...",
      color: "text-destructive",
    },
  ]);

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, activitiesResponse] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getRecentActivities()
        ]);

        if (statsResponse.success) {
          const statsData = statsResponse.data;
          setStats([
            {
              title: "Total Customers",
              value: statsData.totalCustomers.toString(),
              icon: Users,
              trend: "+12 this month",
              color: "text-primary",
            },
            {
              title: "Total Riders",
              value: statsData.totalRiders.toString(),
              icon: TruckIcon,
              trend: "3 active now",
              color: "text-success",
            },
            {
              title: "Orders Today",
              value: statsData.ordersToday.toString(),
              icon: Package,
              trend: `${statsData.pendingOrders} pending`,
              color: "text-warning",
            },
            {
              title: "Pending Payments",
              value: `₹${statsData.pendingPayments}`,
              icon: DollarSign,
              trend: "From customers",
              color: "text-destructive",
            },
          ]);
        }

        if (activitiesResponse.success) {
          setRecentActivities(activitiesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep mock data on error
        setStats([
          {
            title: "Total Customers",
            value: "245",
            icon: Users,
            trend: "+12 this month",
            color: "text-primary",
          },
          {
            title: "Total Riders",
            value: "18",
            icon: TruckIcon,
            trend: "3 active now",
            color: "text-success",
          },
          {
            title: "Orders Today",
            value: "47",
            icon: Package,
            trend: "12 pending",
            color: "text-warning",
          },
          {
            title: "Pending Payments",
            value: "₹12,450",
            icon: DollarSign,
            trend: "From 23 customers",
            color: "text-destructive",
          },
        ]);
        setRecentActivities([
          { id: 1, text: "New order #1234 from Ramesh Kumar", time: "2 mins ago", status: "new" },
          { id: 2, text: "Payment received ₹500 from Priya Sharma", time: "15 mins ago", status: "success" },
          { id: 3, text: "Rider Ali completed 3 deliveries", time: "1 hour ago", status: "info" },
          { id: 4, text: "New customer added: Vikram Singh", time: "2 hours ago", status: "new" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <CreateOrderDialog />
          <AddCustomerDialog trigger={
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          } />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Badge
                  variant={
                    activity.status === "success"
                      ? "default"
                      : activity.status === "new"
                      ? "secondary"
                      : "outline"
                  }
                  className="mt-1"
                >
                  {activity.status}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
