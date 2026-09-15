import axios from "axios";
import type { Request, Response } from "express";
import HTMLParser from "node-html-parser";
import { z } from "zod";
import { DEPARTMENTS_LIST, type Department } from "../constants/departments";
import Faculty from "../models/faculty";
import dbConnect from "../utils/dbConnect";

type FacultyType = {
  name: string;
  email: string;
  department: string;
};

async function getFacultyListByDepartment(department: Department): Promise<{
  error: boolean;
  message: string;
  data: FacultyType[];
}> {
  const url = department.page;
  const response = await axios.get(url);
  const document = HTMLParser.parse(response.data.toString());
  const section = document.querySelector(".departmentTab#138");
  if (!section) {
    console.error("Invalid department page", department);
    return {
      error: true,
      message: "Invalid department page",
      data: [],
    };
  }
  const faculties: FacultyType[] = [];

  for (const faculty of section.querySelectorAll("tr")) {
    const tds = faculty.querySelectorAll("td:not([class])");
    if (tds.length < 5) {
      continue;
    }
    const name = tds[1].innerText.trim();
    const email = tds[3].innerText.trim();
    if (!name || !email) {
      console.error("Invalid faculty", { name, email });
      continue;
    }
    if (email === "Email") {
      continue;
    }
    const emailSchema = z.string().email();
    if (!emailSchema.safeParse(email).success) {
      console.error("Invalid email", email);
      continue;
    }
    faculties.push({
      name,
      email,
      department: department.name,
    });
  }

  return {
    error: false,
    message: "Success",
    data: faculties,
  };
}

/** Scrapes every department page; failed pages are reported so their stored faculty stay untouched. */
async function getFacultyList() {
  const byEmail = new Map<string, FacultyType>();
  const scrapedDepartments: string[] = [];
  const failedDepartments: string[] = [];
  const results = await Promise.allSettled(
    DEPARTMENTS_LIST.map((department) => getFacultyListByDepartment(department))
  );

  results.forEach((result, index) => {
    const department = DEPARTMENTS_LIST[index].name;
    if (result.status === "rejected" || result.value.error) {
      failedDepartments.push(department);
      return;
    }
    scrapedDepartments.push(department);
    // email is unique in the collection; faculty listed under two departments keep the first.
    for (const faculty of result.value.data) {
      if (!byEmail.has(faculty.email)) byEmail.set(faculty.email, faculty);
    }
  });
  return {
    faculties: [...byEmail.values()],
    scrapedDepartments,
    failedDepartments,
  };
}

export const getFacultyListByDepartmentHandler = async (
  req: Request,
  res: Response
) => {
  const department = req.params.departmentCode;
  const dept = DEPARTMENTS_LIST.find((d) => d.code === department);
  if (!dept) {
    res.status(400).json({
      error: true,
      message: "Invalid department",
      data: [],
    });
    return;
  }
  try {
    await dbConnect();
    // Faculty docs store the department name (see getFacultyListByDepartment), not its code.
    const facultyList = await Faculty.find({ department: dept.name });

    if (facultyList.length === 0) {
      res.status(404).json({
        error: true,
        message: "Faculty not found",
        data: [],
      });
      return;
    }
    res.status(200).json({
      error: false,
      message: "Success",
      data: facultyList,
    });
  } catch (err) {
    console.error("getFacultyListByDepartment error:", err);
    res.status(500).json({
      error: true,
      message: "Couldn't load the faculty list",
      data: [],
    });
  }
};

export const getFacultyListHandler = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const data = await Faculty.find({});
    res.status(200).json(data);
  } catch (err) {
    console.error("getFacultyList error:", err);
    res
      .status(500)
      .json({ error: true, message: "Couldn't load faculties", data: [] });
  }
};

export const getFacultyByEmailHandler = async (req: Request, res: Response) => {
  const email = req.params.email;
  const emailSchema = z.string().email();
  if (!emailSchema.safeParse(email).success) {
    res.status(400).json({
      error: true,
      message: "Invalid email",
      data: null,
    });
    return;
  }
  try {
    await dbConnect();
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      res.status(404).json({
        error: true,
        message: "Faculty not found",
        data: null,
      });
      return;
    }
    res.status(200).json({
      error: false,
      message: "Success",
      data: faculty,
    });
  } catch (err) {
    console.error("getFacultyByEmail error:", err);
    res.status(500).json({
      error: true,
      message: "Couldn't look up the faculty",
      data: null,
    });
  }
};

export const refreshFacultyListHandler = async (
  req: Request,
  res: Response
) => {
  try {
    await dbConnect();
    const { faculties, scrapedDepartments, failedDepartments } =
      await getFacultyList();
    if (faculties.length === 0) {
      res.status(502).json({
        error: true,
        message:
          "The college site returned no faculty; the stored list was kept",
        data: [],
      });
      return;
    }
    // Upsert instead of wipe-and-insert, and only prune departments whose page scraped cleanly.
    await Faculty.bulkWrite(
      faculties.map((faculty) => ({
        updateOne: {
          filter: { email: faculty.email },
          update: { $set: faculty },
          upsert: true,
        },
      })),
      { ordered: false }
    );
    await Faculty.deleteMany({
      department: { $in: scrapedDepartments },
      email: { $nin: faculties.map((faculty) => faculty.email) },
    });
    res.status(200).json({
      error: false,
      message:
        failedDepartments.length > 0
          ? `Updated, but these department pages failed and kept their stored faculty: ${failedDepartments.join(", ")}`
          : "Success",
      data: faculties,
    });
  } catch (e) {
    console.error("refreshFacultyList error:", e);
    res.status(500).json({
      error: true,
      message: "Couldn't refresh the faculty list",
      data: [],
    });
  }
};
