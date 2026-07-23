"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import readXlsxFile from "read-excel-file/browser";
import { convertRowsToStringArray } from "~/utils/xlsx";
import type { CellValue, RowType } from "~/utils/xlsx";

interface ExcelFileHandlerProps {
  callBackFn: (data: RowType[]) => Promise<void> | void;
}

export function ExcelFileHandler({ callBackFn }: ExcelFileHandlerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("No file selected.");
      return;
    }

    try {
      const readData = await readXlsxFile(file);
      const processedData = convertRowsToStringArray(readData);
      await callBackFn?.(processedData as RowType[]);
      // Call the callback function with the processed data
      setError(null);
    } catch (err) {
      setError("Failed to process the file. Ensure it's a valid Excel file.");
      console.error(err);
    }
  };

  return (
    <div className="my-5">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="excel">
          Import Excel file (Only .xlsx files are supported)
        </Label>
        <Input
          id="excel"
          type="file"
          accept=".xlsx"
          multiple={false}
          onChange={handleFileChange}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
