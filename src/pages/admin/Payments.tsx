import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Plus } from "lucide-react";

const Payments = () => {
  const summary = {
    totalReceivables: 12450,
    totalPayables: 3200,
    todayCollected: 5400,
  };

  const customerPayments = [
    { id: 1, name: "Ramesh Kumar", outstanding: 450, lastPayment: "2024-01-10", amount: 500 },
    { id: 2, name: "Vikram Singh", outstanding: 1200, lastPayment: "2024-01-08", amount: 300 },
    { id: 3, name: "Rohit Mehta", outstanding: 350, lastPayment: "2024-01-12", amount: 200 },
    { id: 4, name: "Suresh Reddy", outstanding: 800, lastPayment: "2024-01-05", amount: 450 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments & Accounts</h1>
          <p className="text-muted-foreground">Track payments and balances</p>
        </div>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalReceivables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From 23 customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalPayables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From 8 customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.todayCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">12 transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {customerPayments.map((customer) => (
              <Card key={customer.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Last payment: {customer.lastPayment} • ₹{customer.amount}
                    </p>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <Badge variant="destructive">Outstanding</Badge>
                    <p className="text-lg font-bold">₹{customer.outstanding}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
