"use client";

import {
  AlertCircle,
  FileSpreadsheet,
  Save,
  Settings2,
  UploadCloud,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import readXlsxFile from "read-excel-file";
import { toast } from "sonner";
import z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import serverApis from "~/lib/server-apis/client";

// Schema definition
const freshersDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rollNo: z.string().min(1, "Roll No is required"),
  gender: z.enum(["male", "female", "not_specified"]),
});

type SystemField = keyof z.infer<typeof freshersDataSchema>;

const SYSTEM_FIELDS: { key: SystemField; label: string; required: boolean }[] = [
  { key: "name", label: "Student Name", required: true },
  { key: "rollNo", label: "Roll Number", required: true },
  { key: "gender", label: "Gender (Male/Female)", required: true },
];

export default function ImportNewStudents() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  
  // Mapping State: { "name": "Name Column in Excel", "rollNo": "Roll No Column" }
  const [columnMapping, setColumnMapping] = useState<Record<SystemField, string>>({
    name: "",
    rollNo: "",
    gender: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // --- Handlers ---

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setFile(file);
      const rows = await readXlsxFile(file);
      
      // Extract Headers (Row 0)
      const headerRow = rows[0].map(cell => cell?.toString().trim() || "");
      const dataRows = rows.slice(1);

      setHeaders(headerRow);
      setRawRows(dataRows);

      // Auto-Mapping Heuristics
      const newMapping = { ...columnMapping };
      headerRow.forEach(h => {
        const lower = h.toLowerCase();
        if (lower.includes("name")) newMapping.name = h;
        if (lower.includes("roll") || lower.includes("id")) newMapping.rollNo = h;
        if (lower.includes("gender") || lower.includes("sex")) newMapping.gender = h;
      });
      setColumnMapping(newMapping);
      toast.success("File loaded. Please confirm column mappings.");
    } catch (error) {
      toast.error("Failed to parse Excel file");
      setFile(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setHeaders([]);
    setRawRows([]);
    setColumnMapping({ name: "", rollNo: "", gender: "" });
  };

  // --- Process Data Logic ---

  // Create formatted data based on current mapping
  const processedData = useMemo(() => {
    if (!columnMapping.name || !columnMapping.rollNo || !columnMapping.gender) return [];

    const nameIdx = headers.indexOf(columnMapping.name);
    const rollIdx = headers.indexOf(columnMapping.rollNo);
    const genderIdx = headers.indexOf(columnMapping.gender);

    return rawRows.map((row) => {
      const rawGender = row[genderIdx]?.toString().toLowerCase().trim();
      let genderVal: "male" | "female" | "not_specified" = "not_specified";
      if (rawGender === "male" || rawGender === "m") genderVal = "male";
      else if (rawGender === "female" || rawGender === "f") genderVal = "female";

      return {
        name: row[nameIdx]?.toString() || "",
        rollNo: row[rollIdx]?.toString() || "",
        gender: genderVal
      };
    });
  }, [columnMapping, headers, rawRows]);

  const handleSave = async () => {
    if (processedData.length === 0) return;
    
    setIsProcessing(true);
    try {
      // Final Validation before send
      const validData = processedData.filter(d => d.name && d.rollNo); // Basic filter
      
      await serverApis.results.importFreshers(validData);
      toast.success(`Successfully imported ${validData.length} students`);
      handleReset();
    } catch (error) {
      toast.error("Failed to save data to server");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if mapping is complete
  const isMappingComplete = SYSTEM_FIELDS.every(f => columnMapping[f.key] !== "");

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Students</h1>
        <p className="text-muted-foreground mt-1">
          Bulk upload student records. Map your Excel columns to the system fields below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Source File
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div className="relative border-2 border-dashed rounded-lg p-10 hover:bg-muted/50 transition-colors text-center group">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">Click to upload Excel file</h3>
                  <p className="text-sm text-muted-foreground mt-1">.xlsx files only</p>
                  <Input 
                    type="file" 
                    accept=".xlsx" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-md text-green-700">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{rawRows.length} rows found</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {file && (
            <Card >
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Map Columns
                </CardTitle>
                <CardDescription>Match your Excel headers to system fields</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {SYSTEM_FIELDS.map((field) => (
                  <div key={field.key} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-4">
                    <Label className="text-sm font-medium text-muted-foreground sm:text-right">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <div className="sm:col-span-2">
                      <Select 
                        value={columnMapping[field.key]} 
                        onValueChange={(val) => setColumnMapping(prev => ({ ...prev, [field.key]: val }))}
                      >
                        <SelectTrigger className={cn(
                          "w-full",
                          columnMapping[field.key] ? "border-green-500/50 bg-green-50/30" : ""
                        )}>
                          <SelectValue placeholder="Select Column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {headers.map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>

        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Data Preview</CardTitle>
              <CardDescription>First 5 rows with applied mapping</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[300px] w-full border-y">
                {processedData.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[120px]">Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[80px]">Gender</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{row.rollNo || <span className="text-red-400">-</span>}</TableCell>
                          <TableCell className="text-xs truncate max-w-[100px]" title={row.name}>{row.name || <span className="text-red-400">-</span>}</TableCell>
                          <TableCell>
                            {row.gender === "male" && <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100">M</Badge>}
                            {row.gender === "female" && <Badge variant="secondary" className="text-[10px] bg-pink-100 text-pink-700 hover:bg-pink-100">F</Badge>}
                            {row.gender === "not_specified" && <Badge variant="outline" className="text-[10px]">?</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">Upload a file and map columns to see preview</p>
                  </div>
                )}
              </ScrollArea>
              {processedData.length > 0 && (
                <div className="p-3 bg-muted/30 text-xs text-center text-muted-foreground border-b">
                  + {processedData.length - 5} more rows
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-6">
               <Button 
                 className="w-full" 
                 onClick={handleSave} 
                 disabled={isProcessing || !file || !isMappingComplete}
               >
                 {isProcessing ? "Importing..." : "Confirm & Import"}
                 {!isProcessing && <Save className="w-4 h-4 ml-2" />}
               </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}