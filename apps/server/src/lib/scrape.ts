import axios from "axios";
import HTMLParser from "node-html-parser";
import type { headerMap } from "../models/header";
import type { rawResultType } from "../types/result";
import { determineBranchChange, determineDepartment, determineProgramme, getResultHeaders } from "./result_utils";



/**
 * Fetches the result data from the NITH results page for a given roll number.
 * @param url - The URL to fetch the result from.
 * @param RollNo - The roll number of the student.
 * @param headers - The headers required for the request.
 * @returns A promise that resolves to a tuple containing the result data and a message.
 */

const fetchData = async (
  url: string,
  RollNo: string,
  headers: Record<string, string>
): Promise<[string | null, string]> => {
  const data = `RollNumber=${RollNo}&CSRFToken=${headers.CSRFToken}&RequestVerificationToken=${headers.RequestVerificationToken}&B1=Submit`;

  try {
    const response = await axios.post(url, data, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language": "en-IN,en;q=0.9",
        "Cache-Control": "max-age=0",
        "Content-Type": "application/x-www-form-urlencoded",
        "Upgrade-Insecure-Requests": "1",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        Referer: headers.Referer,
      },
    });
    //  only if the status is 200
    if (response.status !== 200) {
      console.log("Invalid Roll No");
      return Promise.resolve([null, "Invalid Roll No"]);
    }
    return Promise.resolve([response.data.toString(), "successfully fetched"]);
  } catch (error) {
    console.error("Error fetching data:");
    return Promise.resolve([null, (error as Error).toString()]);
  }
};
/**
 * Parses the HTML result string fetched from the NITH results page.
 * @param result - The HTML result string fetched from the NITH results page.
 * @param info - Additional information about the student.
 * @returns A promise that resolves to a rawResultType object.
 */

const parseResult = (
  result: string | null,
  info: {
    rollNo: string;
    url: string;
    branch: string;
    batch: number;
    programme: string;
  }
): Promise<rawResultType> => {
  if (result === null) {
    console.log("Invalid Roll No");
    return Promise.reject("Invalid Roll No");
  }
  const document = HTMLParser.parse(result);
  if (!document.querySelector("#page-wrap")) {
    console.log("Invalid Roll No");
    return Promise.reject("Invalid Roll No");
  }
  console.log("Result is available");

  const student: rawResultType = {
    name: "",
    rollNo: info.rollNo,
    branch: info.branch,
    batch: info.batch,
    programme: info.programme,
    semesters: [] as rawResultType["semesters"],
    gender: "not_specified",
  };

  student.name =
    document
      .querySelectorAll("table")[1]
      .querySelector("td:nth-child(2)>p:nth-child(2)")
      ?.innerText.trim() || "";
  document.querySelector(".pagebreak")?.remove();
  const subject_tables = document.querySelectorAll(
    "table:nth-child(odd):nth-child(n + 3):not(:last-of-type)"
  );
  subject_tables.forEach((table, index) => {
    if (!student.semesters[index]) {
      student.semesters.push({
        semester: "0",
        sgpi: 0,
        sgpi_total: 0,
        cgpi: 0,
        cgpi_total: 0,
        courses: [],
      });
    }
    for (const tr of table.querySelectorAll("tr:not([class])")) {
      const semester = Number.parseFloat(
        tr.querySelector("td:nth-child(6)")?.textContent || "0.00"
      );
      const semester_total = Number.parseFloat(
        tr.querySelector("td:nth-child(4)")?.textContent || "1"
      );
      student.semesters[index].courses.push({
        name: tr.querySelector("td:nth-child(2)")?.innerText.trim() || "",
        code: tr.querySelector("td:nth-child(3)")?.innerText.trim() || "",
        grade: tr.querySelector("td:nth-child(5)")?.innerText.trim() || "",
        // default values if parsing fails
        cgpi: semester / semester_total,
        credits: semester_total,
        sub_points: semester,
      });
    }
  });
  const result_tables = document.querySelectorAll(
    "table:nth-child(even):nth-child(n + 3):not(:last-of-type)"
  );
  result_tables.forEach((table, index) => {
    table.querySelectorAll("td").forEach((td, i, array) => {
      student.semesters[index].semester = `0${index + 1}`.slice(-2);
      student.semesters[index].sgpi = array[1].innerText
        .trim()
        .split("=")[1] as unknown as number;
      student.semesters[index].sgpi_total = array[2].innerText
        .trim()
        .split(" ")
        .pop() as unknown as number;
      student.semesters[index].cgpi = array[3].innerText
        .trim()
        .split("=")[1] as unknown as number;
      student.semesters[index].cgpi_total = array[4].innerText
        .trim()
        .split(" ")
        .pop() as unknown as number;
    });
  });
  const [branch_change, department] = determineBranchChange(student);
  if (branch_change && department !== null) {
    student.branch = department;
  }

  console.log("Result parsed");
  return Promise.resolve(student);
};

/**
 * Scrapes the result for a given roll number.
 * @param rollNo - The roll number of the student.
 * @param dualDegree - Whether to also fetch the dual degree results.
 * @returns A promise that resolves to an object containing the result data or an error message.
 * */
export async function scrapeResult(rollNo: string): Promise<{
  message: string;
  data: rawResultType | null;
  error?: string | null;
}> {

  const data = await getInfoFromRollNo(rollNo, false);
  console.log("Roll No: %s", rollNo);

  try {
    console.log("evaluating");
    const [result, msg] = await fetchData(data.url, rollNo, data.headers);
    if (result === null) {
      return Promise.resolve({
        message: msg,
        data: null,
        error: "Invalid Roll No",
      });
    }
    console.log("evaluated");
    const student = await parseResult(result, {
      rollNo,
      ...data,
    });
    console.log("parsed");
    // if student is dual degree then we need to fetch the other result
    if (data.programme === "Dual Degree") {
      // console.log("Dual Degree result requested, but not implemented yet.");
      const isEligibleForDualDegree = student.semesters.length > 6;
      if (isEligibleForDualDegree) {
        const dualDegreeData = await getInfoFromRollNo(rollNo, true);
        console.log("evaluating dual degree result", dualDegreeData.url);
        const [dualResult, dualMsg] = await fetchData(dualDegreeData.url, rollNo, dualDegreeData.headers);
        if (dualResult) {
          const studentDual = await parseResult(dualResult, {
            rollNo,
            ...dualDegreeData,
          });
          console.log("parsed dual degree result");
          // if the dual degree result has only one semester, it means the student is in the first semester of the dual degree

          for (const semester of studentDual.semesters) {
            student.semesters.push({
              ...semester,
              semester: `${semester.semester}-DD`, // Append 'D' to indicate dual degree semester
            })
          }
          console.log(student.semesters.length + " total semesters found in dual degree result");

        } else {
          console.log({
            message: dualMsg,
            data: null,
            error: "Result not available for dual degree",
          });
          // If dual degree result is not available, we still return the student data with a message
        }

      }
    }


    return Promise.resolve({
      message: "Result fetched successfully!",
      data: student,
      error: null,
    });
  } catch (err) {
    console.error("Error in scrapeResult:", err);
    // If there is an error, return a rejected promise with the error message
    return Promise.resolve({
      message: err instanceof Error ? err.message : "Something went wrong",
      data: null,
      error: err?.toString(),
    });
  }
}

const latestBatchCode = 24; // for 2024 batch

/**
 * Gets the information headers for the roll number.
 * @param rollNo - The roll number of the student.
 * @param isDualDegree - Whether the student is in a dual degree programme.
 * @returns A promise that resolves to an object containing the batch, branch, URL, and headers.
 * */

export async function getInfoFromRollNo(rollNo: string, dualDegree = false) {
  // split the roll no into 3 parts starting two characters then 3 characters and then 3 characters
  const matches = [
    Number.parseInt(rollNo.toLowerCase().substring(0, 2)), // 20
    rollNo.toLowerCase().substring(2, 5), // dec,bec,bar
    rollNo.toLowerCase().substring(5, 8), // 001
  ] as const;
  const [batchCode,] = matches;
  if (isNaN(batchCode) || batchCode < 20) {
    return {
      batch: 0,
      branch: "not_specified",
      url: "",
      headers: {
        Referer: "",
        CSRFToken: "",
        RequestVerificationToken: "",
      },
      programme: "not_specified",
    };
  }
  if (batchCode === latestBatchCode + 1) {
    // console.log("Results not yet available for the latest batch. falling back to previous batch headers");
    return {
      batch: Number.parseInt(`20${batchCode}`),
      branch: determineDepartment(rollNo),
      url: "<url>",
      headers: {
        Referer: "<Referer>",
        CSRFToken: "<CSRFToken>",
        RequestVerificationToken: "<RequestVerificationToken>",
      },
      programme: determineProgramme(rollNo),
    };
  }
  const headersResponse = await getResultHeaders(rollNo, !dualDegree);
  if (headersResponse.error) {
    return {
      batch: 0,
      branch: "not_specified",
      url: "",
      headers: {
        Referer: "",
        CSRFToken: "",
        RequestVerificationToken: "",
      },
      programme: "not_specified",
    };
  }
  const headers = headersResponse.headers as headerMap;
  return {
    batch: Number.parseInt(`20${batchCode}`),
    branch: determineDepartment(rollNo),
    url: headers.url,
    headers: {
      Referer: headers.Referer,
      CSRFToken: headers.CSRFToken,
      RequestVerificationToken: headers.RequestVerificationToken,
    },
    programme: determineProgramme(rollNo),
  };
}
