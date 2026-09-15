import axios from "axios";
import type { Request, Response } from "express";
import { type HTMLElement, parse } from "node-html-parser";
import { z } from "zod";

type FunctionaryType = {
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
};

type HostelType = {
  name: string;
  slug: string;
  gender: "male" | "female" | "guest_hostel";
  warden: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  administrators: FunctionaryType[];
};

const HOSTELS_PAGE_URL = "https://nith.ac.in/hostel-management";

export async function getFunctionaryListByHostel(): Promise<{
  error: boolean;
  message: string;
  data: {
    in_charges: FunctionaryType[];
    hostels: HostelType[];
  };
}> {
  try {
    const response = await axios.get(HOSTELS_PAGE_URL);
    const document = parse(response.data.toString());
    const content = document.querySelector("#content");

    if (!content) {
      return {
        error: true,
        message: "Invalid page structure: Missing #content",
        data: { in_charges: [], hostels: [] },
      };
    }

    const tables = content.querySelectorAll("table");
    if (tables.length < 2) {
      return {
        error: true,
        message: "Invalid page structure: Expected at least 2 tables",
        data: { in_charges: [], hostels: [] },
      };
    }

    const [inChargeTable, hostelTable] = tables;
    const in_charges = extractFunctionariesFromTable(inChargeTable);
    const hostels = extractHostelsFromTable(hostelTable);

    return {
      error: false,
      message: "Success",
      data: {
        in_charges,
        hostels,
      },
    };
  } catch (error) {
    console.error("Error fetching hostel data:", error);
    return {
      error: true,
      message: "Failed to fetch functionary list",
      data: { in_charges: [], hostels: [] },
    };
  }
}

function extractFunctionariesFromTable(table: HTMLElement): FunctionaryType[] {
  const rows = table.querySelectorAll("tr");
  const functionaries: FunctionaryType[] = [];

  for (const row of rows) {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 4) {
      const name = cells[1]?.textContent?.trim() || "";
      const role = cells[2]?.textContent?.trim() || "";
      const phoneNumber = cells[3]?.textContent?.trim() || "";
      const email = cells[4]?.textContent?.trim() || "";

      if (name && role && z.string().email().safeParse(email).success) {
        functionaries.push({ name, role, email, phoneNumber });
      }
    }
  }

  return functionaries;
}

function extractHostelsFromTable(table: HTMLElement): HostelType[] {
  const rows = Array.from(table.querySelectorAll("tr")).filter(
    (row) => !row.classList.contains("thcolor")
  );

  const hostels: HostelType[] = [];
  let currentHostel: HostelType | null = null;

  for (const row of rows) {
    if (row.classList.contains("info")) {
      // Hostel name row
      const name = row.querySelector("td")?.textContent?.trim();
      if (name) {
        // Push the current hostel before starting a new one
        if (currentHostel) hostels.push(currentHostel);

        currentHostel = {
          name,
          gender: name.toLowerCase().includes("boy")
            ? "male"
            : name.toLowerCase().includes("girl")
              ? "female"
              : "guest_hostel",
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          warden: { name: "", email: "", phoneNumber: "" },
          administrators: [],
        };
      }
    } else if (currentHostel) {
      // Administrator/warden row
      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        const name = cells[1]?.textContent?.trim();
        const role = cells[2]?.textContent
          ?.trim()
          ?.toLowerCase()
          ?.trim()
          ?.split(" ")
          ?.join("_") as "warden" | "mmca" | "assistant_warden";
        const email = cells[4]?.textContent?.trim() ?? "";
        const phoneNumber = cells[3]?.textContent?.trim() || "";

        if (role === "warden") {
          currentHostel.warden = {
            name,
            email:
              currentHostel.slug === "satpura-&-aravali-girls-hostel"
                ? (email.split("\n")[1] ?? email)
                : email,
            phoneNumber,
          };
        } else if (
          name &&
          role &&
          (currentHostel.slug === "satpura-&-aravali-girls-hostel"
            ? z.string().email().safeParse(email.split("\n")[0]).success
            : z.string().email().safeParse(email).success)
        ) {
          currentHostel.administrators.push({
            name,
            role,
            email:
              currentHostel.slug === "satpura-&-aravali-girls-hostel"
                ? email.split("\n")[0]
                : email,
            phoneNumber,
          });
        } else {
          console.warn("Skipping invalid administrator row:", {
            name,
            email,
            role,
          });
        }
      }
    }
  }

  // Push the last hostel after the loop
  if (currentHostel) hostels.push(currentHostel);

  return hostels;
}

export const getFunctionaryListByHostelHandler = async (
  req: Request,
  res: Response
) => {
  const result = await getFunctionaryListByHostel();
  res.status(result.error ? 500 : 200).json(result);
};
