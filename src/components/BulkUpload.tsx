import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  onDownload: () => void;
}

export const BulkUpload = ({ open, onOpenChange, onUpload, onDownload }: BulkUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample CSV template
    const headers = [
      "Asset Name", "Asset Type", "Brand", "Model", "Configuration", "Serial Number"
    ];
    
    const sampleRows = [
      ["MacBook Pro 16\"", "Laptop", "Apple", "MacBook Pro M2", "16GB RAM, 512GB SSD", "MBP16-2023-001"],
      ["ThinkPad X1", "Laptop", "Lenovo", "ThinkPad X1 Carbon", "16GB RAM, 1TB SSD", "TPX1-2023-002"],
      ["iPad Pro", "Tablet", "Apple", "iPad Pro 12.9", "256GB, Wi-Fi + Cellular", "IPD-2023-003"]
    ];
    
    const csvContent = [
      headers.join(","),
      ...sampleRows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asset_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            Bulk Asset Operations
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Download Template Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Download Current Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Download your current asset inventory as a CSV file.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={onDownload}
                  className="bg-gradient-primary hover:shadow-glow transition-smooth"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV file with columns: Asset Name, Asset Type, Brand, Model, Configuration, Serial Number
                </AlertDescription>
              </Alert>

              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                
                {selectedFile ? (
                  <div>
                    <p className="text-lg font-medium text-primary">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Size: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports CSV, XLSX, XLS files
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Assets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};