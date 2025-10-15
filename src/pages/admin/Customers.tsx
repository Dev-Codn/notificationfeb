import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Plus, Edit, Eye, MapPin, DollarSign, Users, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { AddCustomerDialog } from "@/components/admin/AddCustomerDialog";
import { CustomerStatusToggle } from "@/components/admin/CustomerStatusToggle";
import { EditCustomerDialog } from "@/components/admin/EditCustomerDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/services/api";

const Customers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getCustomers(statusFilter !== 'all' ? statusFilter : undefined);
        
        if (response.success) {
          setCustomers(response.data);
        } else {
          setError(response.message || 'Failed to fetch customers');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Failed to fetch customers. Please check your connection and try again.');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [statusFilter]);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && customer.isActive !== false) ||
      (statusFilter === "inactive" && customer.isActive === false) ||
      (statusFilter === "payable" && customer.currentBalance < 0) ||
      (statusFilter === "receivable" && customer.currentBalance > 0);
    
    return matchesSearch && matchesStatus;
  });

  const handleEditCustomer = (customer) => {
    setSelectedCustomer({ id: customer.id });
    setEditDialogOpen(true);
  };

  const handleCustomerUpdated = (updatedCustomer) => {
    setCustomers(prev => 
      prev.map(c => 
        c.id === updatedCustomer.id ? updatedCustomer : c
      )
    );
    setEditDialogOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base</p>
        </div>
        
        <AddCustomerDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Customers ({filteredCustomers.length})
            </CardTitle>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-[300px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active Accounts</SelectItem>
                  <SelectItem value="inactive">Inactive Accounts</SelectItem>
                  <SelectItem value="payable">Payable (Negative Balance)</SelectItem>
                  <SelectItem value="receivable">Receivable (Positive Balance)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  fetchCustomers();
                }}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading customers...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading customers</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setLoading(true);
                  fetchCustomers();
                }}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No customers match your current filters. Try adjusting your search or filter criteria.'
                  : 'No customers have been added yet. Click "Add Customer" to get started.'
                }
              </p>
              {(!searchQuery && statusFilter === 'all') && (
                <AddCustomerDialog />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Bottles</TableHead>
                    <TableHead>Refill Days</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {customer.id.slice(-6)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                          {customer.whatsapp && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <span className="text-xs">📱</span>
                              {customer.whatsapp}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                            <span className="text-muted-foreground truncate">
                              {customer.address || "No address"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium text-lg">{customer.bottleCount || 0}</div>
                          <div className="text-xs text-muted-foreground">bottles</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">
                            {customer.avgDaysToRefill ? `${customer.avgDaysToRefill}` : '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">days</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <Badge
                            variant={
                              customer.currentBalance < 0 
                                ? "destructive" 
                                : customer.currentBalance > 0 
                                ? "default" 
                                : "secondary"
                            }
                          >
                            {customer.currentBalance < 0 
                              ? "Payable" 
                              : customer.currentBalance > 0 
                              ? "Receivable" 
                              : "Clear"
                            }
                          </Badge>
                          <div className="text-sm font-medium mt-1">
                            {customer.currentBalance !== 0 
                              ? `Rs ${Math.abs(customer.currentBalance)}` 
                              : "Rs 0"
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{customer.totalOrders || 0}</div>
                          <div className="text-xs text-muted-foreground">orders</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.lastOrder ? (
                          <div className="text-sm">
                            <div className="font-medium">{customer.lastOrder.id}</div>
                            <div className="text-muted-foreground">
                              Rs {customer.lastOrder.amount} • {customer.lastOrder.date}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {customer.lastOrder.status}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No orders</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <CustomerStatusToggle
                          customerId={customer.id}
                          isActive={customer.isActive !== false}
                          onStatusChange={(isActive) => {
                            setCustomers(prev => 
                              prev.map(c => 
                                c.id === customer.id ? { ...c, isActive } : c
                              )
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/customers/${customer.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={selectedCustomer}
        onCustomerUpdated={handleCustomerUpdated}
      />
    </div>
  );
};

export default Customers;
