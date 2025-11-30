"use client";

import {
  ArrowRight,
  Database,
  FileSpreadsheet,
  RotateCcw,
  UploadCloud
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // or react-hot-toast
import wordsToNumbers from "words-to-numbers";

// Actions & Utils
import { ExcelFileHandler } from "@/components/application/xlsx.control";
import { addHostelRooms } from "~/actions/hostel.allotment-process";
import { filterColumnsByCallback, filterRowsByCallback } from "~/utils/xlsx";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function HostelImporter({ hostelId }: { hostelId: string }) {
  // State
  const [extractedKeys, setExtractedKeys] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  
  // Mapping State
  const [mappings, setMappings] = useState<{ roomKey: string; capacityKey: string }>({
    roomKey: "",
    capacityKey: "",
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Handlers ---

  const handleFileLoad = async (rawData: any[]) => {
    // 1. Filter Empty Rows
    const filteredRows = filterRowsByCallback<string[]>(rawData, (row) => 
      row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== "")
    );

    // 2. Filter Empty Columns & Extract Headers
    const cleanData = filterColumnsByCallback<string[]>(filteredRows, (cell) => 
      cell !== null && cell !== undefined && cell.toString().trim() !== ""
    );

    if (cleanData.length < 2) {
      toast.error("File is empty or invalid. Please check the format.");
      return;
    }

    const [headers, ...rows] = cleanData;
    setExtractedKeys(headers);
    setData(rows);
    setFileLoaded(true);
    toast.success(`File loaded: ${rows.length} rows found`);
  };

  const handleReset = () => {
    setExtractedKeys([]);
    setData([]);
    setFileLoaded(false);
    setMappings({ roomKey: "", capacityKey: "" });
  };

  const processImport = async () => {
    if (!mappings.roomKey || !mappings.capacityKey) {
      toast.error("Please map both Room Number and Capacity columns.");
      return;
    }

    setIsProcessing(true);

    try {
      const roomIndex = extractedKeys.indexOf(mappings.roomKey);
      const capacityIndex = extractedKeys.indexOf(mappings.capacityKey);

      // Transform Data
      const processedData = data.map((row) => {
        // Safe Capacity Parsing (Words to Numbers)
        const rawCapacity = row[capacityIndex];
        const capacityString = rawCapacity ? rawCapacity.toString() : "1";
        const parsedCapacity = wordsToNumbers(capacityString.split(" ")[0].toLowerCase());
        
        return {
          roomNumber: row[roomIndex]?.toString() || "Unknown",
          capacity: parsedCapacity ? Number(parsedCapacity) : 1,
          occupied_seats: 0,
          isLocked: false,
          hostStudent: null,
          hostel: hostelId,
        };
      });

      // Server Action
      const result = await addHostelRooms(hostelId, processedData);
      
      if (result.error) {
        throw new Error(result.message);
      }

      toast.success(`Successfully imported ${processedData.length} rooms!`);
      handleReset(); // Reset on success

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to import rooms");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Render ---

  if (!fileLoaded) {
    return (
      <Card className="border-dashed border-2 shadow-sm bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="p-4 bg-background rounded-full shadow-sm">
            <UploadCloud className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Upload Inventory File</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Drag and drop your Excel (.xlsx) or CSV file here to start the import process.
            </p>
          </div>
          
          {/* Wrapper for your existing ExcelFileHandler to make it invisible/seamless */}
          <div className="mt-4">
            <ExcelFileHandler callBackFn={handleFileLoad} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. File Summary Bar */}
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-100 text-green-700 rounded-md">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">File Loaded Successfully</p>
            <p className="text-xs text-muted-foreground">
              {data.length} rows • {extractedKeys.length} columns detected
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset File
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 2. Mapping Configuration */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Map Columns</CardTitle>
            <CardDescription>
              Match the columns from your file to the system requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <MappingField 
              label="Room Number"
              description="The unique identifier for the room (e.g., A-101)."
              value={mappings.roomKey}
              onChange={(val) => setMappings(prev => ({ ...prev, roomKey: val }))}
              options={extractedKeys}
              sampleData={data[0]} // Pass first row for preview
            />

            <Separator />

            <MappingField 
              label="Room Capacity (Seater)"
              description={`Number of students per room (e.g., '2', 'Double').`}
              value={mappings.capacityKey}
              onChange={(val) => setMappings(prev => ({ ...prev, capacityKey: val }))}
              options={extractedKeys}
              sampleData={data[0]}
            />

          </CardContent>
          <CardFooter className="bg-muted/30 py-4 flex justify-between items-center">
             <p className="text-xs text-muted-foreground">
               {`* "Words to Numbers" is enabled (e.g., "Three" → 3).`}
             </p>
             <Button 
                onClick={processImport} 
                disabled={isProcessing || !mappings.roomKey || !mappings.capacityKey}
                className="w-full md:w-auto"
             >
               {isProcessing ? "Importing..." : "Confirm & Import Rooms"}
               {!isProcessing && <ArrowRight className="w-4 h-4 ml-2" />}
             </Button>
          </CardFooter>
        </Card>

        {/* 3. Data Preview Panel */}
        <Card className="bg-muted/10 border-none shadow-none md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" /> Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
             <ScrollArea className="h-[300px] w-full px-4">
                <div className="space-y-3">
                  {data.slice(0, 5).map((row, i) => (
                    <div key={i} className="text-xs p-3 bg-background border rounded-md space-y-1">
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Raw Room:</span>
                         <span className="font-mono">{mappings.roomKey ? row[extractedKeys.indexOf(mappings.roomKey)] : "-"}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Raw Cap:</span>
                         <span className="font-mono">{mappings.capacityKey ? row[extractedKeys.indexOf(mappings.capacityKey)] : "-"}</span>
                       </div>
                    </div>
                  ))}
                  {data.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      + {data.length - 5} more rows...
                    </p>
                  )}
                </div>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Helper Component for Mapping Fields ---

function MappingField({ 
  label, 
  description, 
  value, 
  onChange, 
  options, 
  sampleData 
}: { 
  label: string, 
  description: string, 
  value: string, 
  onChange: (val: string) => void, 
  options: string[], 
  sampleData: string[] 
}) {
  
  // Find sample value based on current selection
  const selectedIndex = options.indexOf(value);
  const currentSample = selectedIndex !== -1 ? sampleData[selectedIndex] : null;

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-1">
        <Label className="text-base font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select onValueChange={onChange} value={value}>
            <SelectTrigger className={cn(value ? "border-primary/50 bg-primary/5" : "")}>
              <SelectValue placeholder="Select Column..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt} className="flex justify-between items-center">
                  <span>{opt}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Sample Value Feedback */}
        <div className="hidden sm:flex flex-col flex-1 p-2 bg-muted/50 rounded-md border border-dashed h-10 justify-center px-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium uppercase">Sample:</span>
            <span className="font-mono truncate max-w-[120px]" title={currentSample || ""}>
              {currentSample || "No selection"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}