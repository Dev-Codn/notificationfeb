import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface DeleteRiderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rider: any;
  onRiderDeleted: (riderId: string) => void;
}

export function DeleteRiderDialog({ open, onOpenChange, rider, onRiderDeleted }: DeleteRiderDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!rider?.id) {
      toast.error("Rider ID not found");
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiService.deleteRider(rider.id);
      
      if (response.success) {
        toast.success(`Rider "${rider.name}" deleted successfully`);
        onRiderDeleted(rider.id);
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error deleting rider:', error);
      const errorMessage = error.message || 'Failed to delete rider';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Rider
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this rider? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {rider && (
          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium">{rider.name}</h4>
              <p className="text-sm text-muted-foreground">{rider.email}</p>
              <p className="text-sm text-muted-foreground">{rider.phone}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This will deactivate the rider account and they will no longer be able to access the system.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete Rider"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
