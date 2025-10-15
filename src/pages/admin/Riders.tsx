import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Loader2, RefreshCw, Search, Users, Truck, Package, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AddRiderDialog } from "@/components/admin/AddRiderDialog";
import { AssignRiderDialog } from "@/components/admin/AssignRiderDialog";
import { EditRiderDialog } from "@/components/admin/EditRiderDialog";
import { DeleteRiderDialog } from "@/components/admin/DeleteRiderDialog";
import { RiderStatusToggle } from "@/components/admin/RiderStatusToggle";
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
import { toast } from "sonner";

const Riders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRiders();
      
      if (response.success) {
        setRiders(response.data);
      } else {
        setError(response.message || 'Failed to fetch riders');
      }
    } catch (error) {
      console.error('Error fetching riders:', error);
      setError('Failed to fetch riders. Please check your connection and try again.');
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter((rider) => {
    const matchesSearch = 
      rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rider.phone.includes(searchQuery) ||
      rider.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && rider.isActive) ||
      (statusFilter === "inactive" && !rider.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleEditRider = (rider) => {
    setSelectedRider(rider);
    setEditDialogOpen(true);
  };

  const handleDeleteRider = (rider) => {
    setSelectedRider(rider);
    setDeleteDialogOpen(true);
  };

  const handleRiderUpdated = (updatedRider) => {
    setRiders(prev => 
      prev.map(r => 
        r.id === updatedRider.id ? updatedRider : r
      )
    );
    setEditDialogOpen(false);
    setSelectedRider(null);
  };

  const handleRiderDeleted = (riderId) => {
    setRiders(prev => prev.filter(r => r.id !== riderId));
    setDeleteDialogOpen(false);
    setSelectedRider(null);
  };

  const handleRiderStatusChange = (riderId, isActive) => {
    setRiders(prev => 
      prev.map(r => 
        r.id === riderId ? { ...r, isActive } : r
      )
    );
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Riders</h1>
          <p className="text-muted-foreground">Manage delivery riders</p>
        </div>
        
        <div className="flex gap-2">
          <AddRiderDialog onSuccess={fetchRiders} />
          <AssignRiderDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              All Riders ({filteredRiders.length})
            </CardTitle>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or email..."
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
                  <SelectItem value="all">All Riders</SelectItem>
                  <SelectItem value="active">Active Riders</SelectItem>
                  <SelectItem value="inactive">Inactive Riders</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRiders}
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
              <div className="text-muted-foreground">Loading riders...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading riders</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={fetchRiders}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
            </div>
          ) : filteredRiders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No riders found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No riders match your current filters. Try adjusting your search or filter criteria.'
                  : 'No riders have been added yet. Click "Add Rider" to get started.'
                }
              </p>
              {(!searchQuery && statusFilter === 'all') && (
                <AddRiderDialog onSuccess={fetchRiders} />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rider</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRiders.map((rider) => (
                    <TableRow key={rider.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rider.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {rider.id.slice(-6)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {rider.phone}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rider.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium text-lg">{rider.totalDeliveries || 0}</div>
                          <div className="text-xs text-muted-foreground">completed</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium text-lg">{rider.pendingDeliveries || 0}</div>
                          <div className="text-xs text-muted-foreground">pending</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {rider.currentOrders?.length || 0}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">current orders</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RiderStatusToggle
                          riderId={rider.id}
                          isActive={rider.isActive}
                          onStatusChange={(isActive) => handleRiderStatusChange(rider.id, isActive)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/riders/${rider.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditRider(rider)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteRider(rider)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
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

      {/* Edit Rider Dialog */}
      <EditRiderDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        rider={selectedRider}
        onRiderUpdated={handleRiderUpdated}
      />

      {/* Delete Rider Dialog */}
      <DeleteRiderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        rider={selectedRider}
        onRiderDeleted={handleRiderDeleted}
      />
    </div>
  );
};

export default Riders;
