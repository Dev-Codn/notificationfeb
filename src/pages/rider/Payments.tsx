import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";

const RiderPayments = () => {
  const summary = {
    totalCollected: 3150,
    todayCollected: 720,
    pendingCollection: 990,
  };

  const paidOrders = [
    { id: "#1234", customer: "Ramesh Kumar", amount: 450, time: "10:30 AM" },
    { id: "#1235", customer: "Priya Sharma", amount: 270, time: "11:15 AM" },
  ];

  const unpaidOrders = [
    { id: "#1236", customer: "Vikram Singh", amount: 630 },
    { id: "#1238", customer: "Suresh Reddy", amount: 360 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments Summary</h1>
        <p className="text-muted-foreground">Track your collections</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalCollected}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.todayCollected}</div>
            <p className="text-xs text-muted-foreground">{paidOrders.length} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.pendingCollection}</div>
            <p className="text-xs text-muted-foreground">{unpaidOrders.length} orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paid Orders (Today)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {paidOrders.map((order) => (
              <Card key={order.id} className="bg-success/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.id}</p>
                      <Badge variant="default">Paid</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                  <p className="text-lg font-bold">₹{order.amount}</p>
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
              <Card key={order.id} className="bg-destructive/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.id}</p>
                      <Badge variant="destructive">Unpaid</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
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

export default RiderPayments;
