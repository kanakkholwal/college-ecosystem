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

const parseResult = async (
  result: string | null,
  info: {
    rollNo: string;
    url: string;
    branch: string;
    batch: number;
    programme: string;
  }
): Promise<rawResultType> => {
  if (!result || !result.trim()) {
    console.log("Invalid Roll No");
    return Promise.reject("Invalid Roll No");
  }

  let document;
  try {
    document = HTMLParser.parse(result);
  } catch (err) {
    console.log("HTML parse error", err);
    return Promise.reject("Invalid Roll No");
  }

  // basic structural check
  const allTables = Array.from(document.querySelectorAll("table"));
  if (!document.querySelector("#page-wrap") || allTables.length < 2) {
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

  // Safe extraction for name (guard table index and selector)
  const secondTable = allTables[1];
  if (secondTable) {
    const nameEl = secondTable.querySelector("td:nth-child(2) > p:nth-child(2)");
    student.name = nameEl?.innerText?.trim() ?? "";
  }

  // Avoid mutating original document if unnecessary
  // document.querySelector(".pagebreak")?.remove();

  // Use table-pairing: skip first two tables (assumed header), ignore last table if it's a footer
  // This yields [subjectTable, resultTable, subjectTable, resultTable, ...]
  const bodyTables = allTables.slice(2, allTables.length - 1 >= 2 ? allTables.length - 1 : allTables.length);
  for (let pairIndex = 0; pairIndex < bodyTables.length; pairIndex += 2) {
    const subjTable = bodyTables[pairIndex];
    const resTable = bodyTables[pairIndex + 1];

    const semIndex = student.semesters.length; // append in order
    // Initialize semester slot defensively
    student.semesters.push({
      semester: `0${semIndex + 1}`.slice(-2),
      sgpi: 0,
      sgpi_total: 0,
      cgpi: 0,
      cgpi_total: 0,
      courses: [],
    });

    const semesterObj = student.semesters[semIndex];

    // Parse courses from subjTable
    if (subjTable) {
      const rows = Array.from(subjTable.querySelectorAll("tr"));
      for (const tr of rows) {
        const tds = Array.from(tr.querySelectorAll("td"));
        // require at least 6 tds (because original code uses nth-child up to 6)
        if (tds.length < 6) continue;
        const name = tds[1]?.innerText?.trim() ?? "";
        const code = tds[2]?.innerText?.trim() ?? "";
        const grade = tds[4]?.innerText?.trim() ?? "";
        // safe numeric parsing
        const subPointsText = tds[5]?.textContent ?? "0";
        const creditsText = tds[3]?.textContent ?? "0";
        const sub_points = Number.parseFloat(subPointsText.replace(/[^0-9.\-]+/g, "")) || 0;
        const credits = Number.parseFloat(creditsText.replace(/[^0-9.\-]+/g, "")) || 0;
        const cgpi = credits > 0 ? (sub_points / credits) : 0;

        semesterObj.courses.push({
          name,
          code,
          grade,
          cgpi,
          credits,
          sub_points,
        });
      }
    }

    // Parse summary (sgpi, cgpi totals) from resTable — do it once, not per-td
    if (resTable) {
      const tds = Array.from(resTable.querySelectorAll("td"));
      // Expecting at least 5 tds based on original indexing
      if (tds.length >= 5) {
        // helpers to extract numbers after '=' or the last token
        const extractAfterEqual = (s?: string) => {
          if (!s) return NaN;
          const idx = s.indexOf("=");
          return idx >= 0 ? s.slice(idx + 1).trim() : s.trim();
        };
        const extractLastToken = (s?: string) => {
          if (!s) return NaN;
          const parts = s.trim().split(/\s+/);
          return parts.length ? parts[parts.length - 1] : "";
        };

        const sgpiRaw = extractAfterEqual(tds[1].innerText);
        const sgpiTotalRaw = extractLastToken(tds[2].innerText);
        const cgpiRaw = extractAfterEqual(tds[3].innerText);
        const cgpiTotalRaw = extractLastToken(tds[4].innerText);

        semesterObj.sgpi = Number.parseFloat(String(sgpiRaw).replace(/[^0-9.\-]+/g, "")) || 0;
        semesterObj.sgpi_total = Number.parseFloat(String(sgpiTotalRaw).replace(/[^0-9.\-]+/g, "")) || 0;
        semesterObj.cgpi = Number.parseFloat(String(cgpiRaw).replace(/[^0-9.\-]+/g, "")) || 0;
        semesterObj.cgpi_total = Number.parseFloat(String(cgpiTotalRaw).replace(/[^0-9.\-]+/g, "")) || 0;
      }
    }
  }

  // If pairing logic created fewer semesters than result tables or vice-versa, we kept stable behavior:
  // determineBranchChange can still run (existing business logic)
  const [branch_change, department] = determineBranchChange(student);
  if (branch_change && department !== null) {
    student.branch = department;
  }

  console.log("Result parsed");
  return student;
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
