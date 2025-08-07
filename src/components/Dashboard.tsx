import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Laptop, Package, Users, Plus, Filter, Upload, Download, Tablet, Monitor, Smartphone } from "lucide-react";
import { AssetForm } from "./AssetForm";
import { AssetList } from "./AssetList";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { BulkUpload } from "./BulkUpload";
import { DateRange } from "react-day-picker";

// Mock data for demonstration
const mockAssets = [
  { 
    id: 1, 
    assetId: "AST-001", 
    name: "MacBook Pro 16\"", 
    type: "Laptop", 
    brand: "Apple", 
    model: "MacBook Pro M2", 
    configuration: "16GB RAM, 512GB SSD", 
    serialNumber: "MBP16-2023-001",
    assignedTo: "John Doe", 
    status: "Assigned", 
    assignedDate: "2024-01-15" 
  },
  { 
    id: 2, 
    assetId: "AST-002", 
    name: "ThinkPad X1", 
    type: "Laptop", 
    brand: "Lenovo", 
    model: "ThinkPad X1 Carbon", 
    configuration: "16GB RAM, 1TB SSD", 
    serialNumber: "TPX1-2023-002",
    assignedTo: null, 
    status: "Available", 
    assignedDate: null 
  },
  { 
    id: 3, 
    assetId: "AST-003", 
    name: "iPad Pro", 
    type: "Tablet", 
    brand: "Apple", 
    model: "iPad Pro 12.9", 
    configuration: "256GB, Wi-Fi + Cellular", 
    serialNumber: "IPD-2023-003",
    assignedTo: "Jane Smith", 
    status: "Assigned", 
    assignedDate: "2024-01-20" 
  },
  { 
    id: 4, 
    assetId: "AST-004", 
    name: "Surface Pro", 
    type: "Tablet", 
    brand: "Microsoft", 
    model: "Surface Pro 9", 
    configuration: "16GB RAM, 512GB SSD", 
    serialNumber: "SPR-2023-004",
    assignedTo: null, 
    status: "Available", 
    assignedDate: null 
  },
  { 
    id: 5, 
    assetId: "AST-005", 
    name: "Dell XPS 13", 
    type: "Laptop", 
    brand: "Dell", 
    model: "XPS 13 Plus", 
    configuration: "32GB RAM, 1TB SSD", 
    serialNumber: "DXP-2023-005",
    assignedTo: "Mike Johnson", 
    status: "Assigned", 
    assignedDate: "2024-02-01" 
  },
  { 
    id: 6, 
    assetId: "AST-006", 
    name: "Galaxy Tab S9", 
    type: "Tablet", 
    brand: "Samsung", 
    model: "Galaxy Tab S9 Ultra", 
    configuration: "512GB, 5G", 
    serialNumber: "GTS-2023-006",
    assignedTo: "Sarah Wilson", 
    status: "Scrap", 
    assignedDate: "2024-02-05" 
  },
];

export const Dashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [assets, setAssets] = useState(mockAssets);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [configFilter, setConfigFilter] = useState<string>("all");

  // Get unique values for filters
  const assetTypes = [...new Set(assets.map(asset => asset.type))];
  const assetBrands = [...new Set(assets.map(asset => asset.brand))];
  const assetConfigurations = [...new Set(assets.map(asset => asset.configuration))];

  // Filter assets based on selected filters
  const filteredAssets = assets.filter(asset => {
    const typeMatch = typeFilter === "all" || asset.type === typeFilter;
    const brandMatch = brandFilter === "all" || asset.brand === brandFilter;
    const configMatch = configFilter === "all" || asset.configuration === configFilter;
    
    return typeMatch && brandMatch && configMatch;
  });

  // Calculate inventory statistics using filtered data
  const totalInventory = filteredAssets.length;
  const allocatedAssets = filteredAssets.filter(asset => asset.status === "Assigned").length;
  const currentStock = filteredAssets.filter(asset => asset.status === "Available").length;
  const scrapDamageAssets = filteredAssets.filter(asset => asset.status === "Scrap" || asset.status === "Damage").length;
  
  const allocatedInRange = filteredAssets.filter(asset => {
    if (!asset.assignedDate || !dateRange?.from || !dateRange?.to) return false;
    const assignedDate = new Date(asset.assignedDate);
    return assignedDate >= dateRange.from && assignedDate <= dateRange.to;
  }).length;

  const handleAddAsset = (newAsset: any) => {
    const asset = {
      id: assets.length + 1,
      assetId: `AST-${String(assets.length + 1).padStart(3, '0')}`,
      ...newAsset,
      status: "Available",
      assignedTo: null,
      assignedDate: null,
    };
    setAssets([...assets, asset]);
    setShowAddForm(false);
  };

  const handleAssignAsset = (assetId: number, userName: string) => {
    setAssets(assets.map(asset => 
      asset.id === assetId 
        ? { ...asset, assignedTo: userName, status: "Assigned", assignedDate: new Date().toISOString().split('T')[0] }
        : asset
    ));
  };

  const handleUnassignAsset = (assetId: number) => {
    setAssets(assets.map(asset => 
      asset.id === assetId 
        ? { ...asset, assignedTo: null, status: "Available", assignedDate: null }
        : asset
    ));
  };

  const handleUpdateAssetStatus = (assetId: number, status: string) => {
    setAssets(assets.map(asset => 
      asset.id === assetId 
        ? { ...asset, status }
        : asset
    ));
  };

  const handleBulkUpload = (file: File) => {
    console.log("Processing file:", file.name);
  };

  const handleDownloadData = () => {
    const headers = [
      "Asset ID", "Asset Name", "Asset Type", "Brand", "Model", "Configuration", 
      "Serial Number", "Employee Name", "Status", "Assigned Date"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredAssets.map(asset => [
        asset.assetId, asset.name, asset.type, asset.brand, asset.model, 
        asset.configuration, asset.serialNumber, asset.assignedTo || "", 
        asset.status, asset.assignedDate || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asset_inventory.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setBrandFilter("all");
    setConfigFilter("all");
    setDateRange(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b shadow-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Asset Management System
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">Track and manage your organization's assets efficiently</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowBulkUpload(true)}
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Operations
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters Section */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Asset Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {assetTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {assetBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Configuration Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Configuration</label>
                <Select value={configFilter} onValueChange={setConfigFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select config" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Configurations</SelectItem>
                    {assetConfigurations.map(config => (
                      <SelectItem key={config} value={config}>{config}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Allocation Date Range</label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Inventory */}
          <Card className="shadow-card hover:shadow-elegant transition-smooth cursor-pointer bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalInventory}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total assets in system
              </p>
            </CardContent>
          </Card>

          {/* Allocated */}
          <Card className="shadow-card hover:shadow-elegant transition-smooth cursor-pointer bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allocated</CardTitle>
              <Users className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{allocatedAssets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently in use
              </p>
            </CardContent>
          </Card>

          {/* Current Stock */}
          <Card className="shadow-card hover:shadow-elegant transition-smooth cursor-pointer bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
              <Package className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{currentStock}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for allocation
              </p>
            </CardContent>
          </Card>

          {/* Scrap/Damage */}
          <Card className="shadow-card hover:shadow-elegant transition-smooth cursor-pointer bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scrap/Damage</CardTitle>
              <Package className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{scrapDamageAssets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of service
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Asset List */}
        <AssetList 
          assets={filteredAssets}
          onAssign={handleAssignAsset}
          onUnassign={handleUnassignAsset}
          onUpdateStatus={handleUpdateAssetStatus}
          dateRange={dateRange}
        />
      </div>

      {/* Add Asset Modal */}
      {showAddForm && (
        <AssetForm 
          onSubmit={handleAddAsset}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Bulk Upload Modal */}
      <BulkUpload
        open={showBulkUpload}
        onOpenChange={setShowBulkUpload}
        onUpload={handleBulkUpload}
        onDownload={handleDownloadData}
      />
    </div>
  );
};