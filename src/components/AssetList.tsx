import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, UserMinus, Settings, Search, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";

interface Asset {
  id: number;
  assetId: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  configuration: string;
  serialNumber: string;
  assignedTo: string | null;
  status: string;
  assignedDate: string | null;
}

interface AssetListProps {
  assets: Asset[];
  onAssign: (assetId: number, userName: string) => void;
  onUnassign: (assetId: number) => void;
  onUpdateStatus: (assetId: number, status: string) => void;
  dateRange?: DateRange;
}

export const AssetList = ({ assets, onAssign, onUnassign, onUpdateStatus, dateRange }: AssetListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [userName, setUserName] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Filter assets based on search and date range
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDateRange = !dateRange?.from || !dateRange?.to || !asset.assignedDate ||
      (new Date(asset.assignedDate) >= dateRange.from && new Date(asset.assignedDate) <= dateRange.to);

    return matchesSearch && matchesDateRange;
  });

  const handleAssignAsset = () => {
    if (selectedAsset && userName.trim()) {
      onAssign(selectedAsset.id, userName.trim());
      setShowAssignDialog(false);
      setUserName("");
      setSelectedAsset(null);
    }
  };

  const handleUpdateStatus = () => {
    if (selectedAsset && newStatus) {
      onUpdateStatus(selectedAsset.id, newStatus);
      setShowStatusDialog(false);
      setNewStatus("");
      setSelectedAsset(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Assigned":
        return <Badge className="bg-warning text-warning-foreground">Assigned</Badge>;
      case "Available":
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case "Scrap":
        return <Badge className="bg-destructive text-destructive-foreground">Scrap</Badge>;
      case "Damage":
        return <Badge className="bg-destructive text-destructive-foreground">Damage</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Asset Inventory ({filteredAssets.length} items)
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No Assets Found
            </h3>
            <p className="text-sm text-muted-foreground">
              No assets match your current filters or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Details</TableHead>
                  <TableHead>Specifications</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.assetId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{asset.brand}</div>
                        <div className="text-sm text-muted-foreground">{asset.model}</div>
                        <div className="text-xs text-muted-foreground">{asset.configuration}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {asset.serialNumber}
                      </code>
                    </TableCell>
                    <TableCell>
                      {asset.assignedTo ? (
                        <div className="font-medium">{asset.assignedTo}</div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(asset.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {asset.assignedDate ? (
                          <>
                            <div>Assigned: {formatDate(asset.assignedDate)}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">No date</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {asset.status === "Available" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowAssignDialog(true);
                            }}
                            className="bg-gradient-primary hover:shadow-glow transition-smooth"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        ) : asset.status === "Assigned" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUnassign(asset.id)}
                            className="hover:bg-warning hover:text-warning-foreground"
                          >
                            <UserMinus className="h-3 w-3 mr-1" />
                            Return
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setNewStatus(asset.status);
                            setShowStatusDialog(true);
                          }}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          <Settings className="h-3 w-3" />
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

      {/* Assign Asset Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Asset: {selectedAsset?.name}</Label>
              <p className="text-sm text-muted-foreground">{selectedAsset?.assetId}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">Employee Name *</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter employee name"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAssignDialog(false);
                  setUserName("");
                  setSelectedAsset(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignAsset}
                disabled={!userName.trim()}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Asset Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Asset: {selectedAsset?.name}</Label>
              <p className="text-sm text-muted-foreground">{selectedAsset?.assetId}</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Scrap">Scrap</SelectItem>
                  <SelectItem value="Damage">Damage</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowStatusDialog(false);
                  setNewStatus("");
                  setSelectedAsset(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStatus}
                disabled={!newStatus}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};