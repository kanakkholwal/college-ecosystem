"use client";

import { ExcelFileHandler } from "@/components/application/xlsx.control";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import toast from "react-hot-toast";
import wordsToNumbers from "words-to-numbers";
import { addHostelRooms } from "~/actions/hostel.allotment-process";
import { filterColumnsByCallback, filterRowsByCallback } from "~/utils/xlsx";

export default function ImportRooms({ hostelId }: { hostelId: string }) {
  const [extractedKeys, setExtractedKeys] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [numberKey, setNumKey] = useState<number>();
  const [seaterKey, setSeaterKey] = useState<number>();

  const processData = () => {
    if (!numberKey || !seaterKey) {
      console.error("seaterKey Key or numberKey is not set");
      alert("seaterKey Key or numberKey is not set");
      return;
    }
    const processedData = data.map((row) => {
      const seater = Number.parseInt(
        wordsToNumbers(
          (row[seaterKey] !== null && row[seaterKey] !== undefined
            ? row[seaterKey].toString()
            : "one"
          )
            .split(" ")?.[0]
            .toLowerCase()
        )?.toString() || "1"
      );
      return {
        roomNumber: row[numberKey],
        capacity: seater,
        occupied_seats: 0,
        isLocked: false,
        hostStudent: null,
        hostel: hostelId,
      };
    });
    console.log(processedData);
    toast.promise(addHostelRooms(hostelId, processedData), {
      loading: "Importing Students...",
      success: "Students Imported Successfully",
      error: (error: string) => {
        console.error(error);
        return "Error Importing Students";
      },
    });
  };

  return (
    <div className="my-5">
      <ExcelFileHandler
        callBackFn={async (data) => {
          const filteredRowData = filterRowsByCallback<string[]>(
            data,
            (row) => {
              return (
                row.length > 0 &&
                row[0] !== null &&
                row[0] !== undefined &&
                row.filter((cell) => cell !== "").length > 2
              );
            }
          );
          const filteredData = filterColumnsByCallback<string[]>(
            filteredRowData,
            (cell) => {
              return (
                cell !== null &&
                cell !== undefined &&
                cell?.toString()?.trim() !== ""
              );
            }
          );
          console.log(filteredData);
          const [keys, ...values] = filteredData;
          setData(values);
          setExtractedKeys(keys);
        }}
      />
      {extractedKeys.length > 0 && (
        <div className="flex w-full items-center gap-3 flex-wrap mt-5">
          <div className="grid w-full items-center gap-2.5 grid-cols-1 @lg:grid-cols-2">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor={"number"}>Room Number Key</Label>

              <Select
                onValueChange={(value) => {
                  setNumKey(Number.parseInt(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={"Room Number Key"} />
                </SelectTrigger>
                <SelectContent>
                  {extractedKeys.map((row, index) => {
                    if (row === "") return null;

                    return (
                      <SelectItem key={row} value={index.toString()}>
                        {row}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor={"seater"}>Seater Key</Label>

              <Select
                onValueChange={(value) => {
                  setSeaterKey(Number.parseInt(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={"Room Number Key"} />
                </SelectTrigger>
                <SelectContent>
                  {extractedKeys.map((row, index) => {
                    if (row === "") return null;
                    return (
                      <SelectItem key={row} value={index.toString()}>
                        {row}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Button
              onClick={processData}
              className="w-full max-w-sm"
              disabled={!numberKey || !seaterKey}
            >
              Process Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
