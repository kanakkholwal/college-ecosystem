import { Workbook } from "exceljs";
import { appConfig, orgConfig } from "~/project.config";

export async function downloadAllotmentAsExcelNative(
  rooms: { capacity: number; students: Record<string, string>[] }[],
  gender: string,
  extraFields: string[]
) {
  const wb = new Workbook();
  wb.creator = appConfig.name;
  wb.company = orgConfig.name;
  wb.description = "Room Allotment Data";
  wb.created = new Date();
  wb.modified = new Date();
  wb.lastModifiedBy = appConfig.name;
  wb.properties = {
    date1904: false,
  };
  const ws = wb.addWorksheet("Allotment ");

  const baseColumns = [
    { header: "Name", key: "name", width: 30 },
    { header: "Roll No", key: "rollNo", width: 20 },
    { header: "SOE", key: "soe", width: 20 },
    { header: "Gender", key: "gender", width: 10 },
    ...extraFields.map((field) => ({ header: field, key: field, width: 20 })),
  ];

  ws.columns = baseColumns;

  rooms.forEach((room) => {
    room.students.forEach((student) => {
      ws.addRow(baseColumns.map((col) => student[col.key as string] || ""));
    });
    ws.addRow([]); // empty line between rooms
    ws.addRow([]); // empty line between rooms
  });

  const buffer = await wb.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `allotment_${gender}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
