import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Package } from "lucide-react";

const Reports = () => {
  const dailySummary = {
    totalOrders: 47,
    totalRevenue: 4230,
    completedDeliveries: 35,
    pendingOrders: 12,
  };

  const riderPerformance = [
    { name: "Ali Khan", completed: 15, collected: 1350 },
    { name: "Ravi Kumar", completed: 12, collected: 1080 },
    { name: "Mohammed Irfan", completed: 8, collected: 720 },
  ];

  const unpaidOrders = [
    { orderId: "#1234", customer: "Ramesh Kumar", amount: 450, days: 5 },
    { orderId: "#1198", customer: "Vikram Singh", amount: 1200, days: 12 },
    { orderId: "#1167", customer: "Rohit Mehta", amount: 350, days: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Performance analytics and insights</p>
        </div>
        
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySummary.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dailySummary.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySummary.completedDeliveries}</div>
            <p className="text-xs text-muted-foreground">Deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySummary.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rider Performance (Today)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {riderPerformance.map((rider) => (
              <Card key={rider.name}>
                <CardContent className="flex items-center justify-between p-4">
                  <p className="font-medium">{rider.name}</p>
                  <div className="flex gap-8 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">Deliveries</p>
                      <p className="font-bold">{rider.completed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Collected</p>
                      <p className="font-bold">₹{rider.collected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unpaid Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {unpaidOrders.map((order) => (
              <Card key={order.orderId} className="bg-destructive/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{order.orderId} - {order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.days} days overdue</p>
                  </div>
                  <p className="text-lg font-bold">₹{order.amount}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
