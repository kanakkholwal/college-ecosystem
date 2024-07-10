import { ResultType } from "@app/types/result";
import axios from "axios";
import HTMLParser from "node-html-parser";

const fetchData = async (
    url: string,
    RollNo: string,
    headers: Record<string, string>
) => {
    const data = `RollNumber=${RollNo}&CSRFToken=${headers.CSRFToken}&RequestVerificationToken=${headers.RequestVerificationToken}&B1=Submit`;

    try {
        const response = await axios.post(url, data, {
            headers: {
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Accept-Language": "en-US,en;q=0.9",
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
            return null;
        }
        return response.data.toString();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};
const parseResult = (
    result: string | null,
    info: {
        rollNo: string;
        url: string;
        branch: string;
        batch: number;
        programme: string;
    }
): Promise<ResultType> => {
    return new Promise((resolve, reject) => {
        if (result === null) {
            console.log("Invalid Roll No");
            reject("Invalid Roll No");
            return;
        }
        const document = HTMLParser.parse(result);
        if (!document.querySelector("#page-wrap")) {
            console.log("Invalid Roll No");
            reject("Invalid Roll No");
            return;
        }
        console.log("Result is available");

        const student: ResultType = {
            name: "",
            rollNo: info.rollNo,
            branch: info.branch,
            batch: info.batch,
            programme: info.programme,
            semesters: [],
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
                    semester: 0,
                    sgpi: 0,
                    sgpi_total: 0,
                    cgpi: 0,
                    cgpi_total: 0,
                    courses: [],
                });
            }
            table.querySelectorAll("tr:not([class])").forEach((tr) => {
                const semester = parseFloat(
                    tr.querySelector("td:nth-child(6)")?.textContent || "0.00"
                );
                const semester_total = parseFloat(
                    tr.querySelector("td:nth-child(4)")?.textContent || "1"
                );
                student.semesters[index].courses.push({
                    name: tr.querySelector("td:nth-child(2)")?.innerText.trim() || "",
                    code: tr.querySelector("td:nth-child(3)")?.innerText.trim() || "",
                    cgpi: semester / semester_total,
                });
            });
        });
        const result_tables = document.querySelectorAll(
            "table:nth-child(even):nth-child(n + 3):not(:last-of-type)"
        );
        result_tables.forEach((table, index) => {
            table.querySelectorAll("td").forEach((td, i, array) => {
                student.semesters[index].semester = ("0" + (index + 1)).slice(
                    -2
                ) as unknown as number;
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

        resolve(student);
        console.log("Result parsed");

        return resolve(student);
    });
};

export async function ScrapeResult(rollNo: string): Promise<ResultType> {
    const { url, headers } = getInfo(rollNo);

    // console.log(rollNo, url, branch, batch, programme);

        try {
            // console.log("evaluating");
            const result = await fetchData(url, rollNo, headers);
            // console.log("evaluated");
            const student = await parseResult(result, {
                rollNo,
                ...getInfo(rollNo),
            });
            console.log("resolved");
            return Promise.resolve(student);
        } catch (err) {
            console.error("Error scraping result:", err);
            return Promise.reject(err);
        }
    
}
const headerMap: Record<
    number,
    {
        url: string;
        Referer: string;
        CSRFToken: string;
        RequestVerificationToken: string;
    }
> = {
    20: {
        url: "http://results.nith.ac.in/scheme20/studentresult/result.asp",
        Referer: "http://results.nith.ac.in/scheme20/studentresult/index.asp",
        CSRFToken: "{782F96DF-5115-4492-8CB2-06104ECFF0CA}",
        RequestVerificationToken: "094D0BF7-EE18-E102-8CBF-23C329B32E1C",
    },
    21: {
        url: "http://results.nith.ac.in/scheme21/studentresult/result.asp",
        Referer: "http://results.nith.ac.in/scheme21/studentresult/index.asp",
        CSRFToken: "{D5D50B24-2DDE-4C35-9F41-10426C59EEA7}",
        RequestVerificationToken: "7BA3D112-507E-5379-EE25-9539F0DE9076",
    },
    22: {
        url: "http://results.nith.ac.in/scheme22/studentresult/result.asp",
        Referer: "http://results.nith.ac.in/scheme22/studentresult/index.asp",
        CSRFToken: "{AF6DB03B-F6EC-475E-B331-6C9DE3846923}",
        RequestVerificationToken: "DA92D62F-BF6E-B268-4E04-F419F5EA6233",
    },
    23: {
        url: "http://results.nith.ac.in/scheme23/studentresult/result.asp",
        Referer: "http://results.nith.ac.in/scheme23/studentresult/index.asp",
        CSRFToken: "{F1E16363-FEDA-48AF-88E9-8A186425C213}",
        RequestVerificationToken: "4FFEE8F3-14C9-27C4-B370-598406BF99C1",
    },
};
function getInfo(rollNo: string) {
    // split the roll no into 3 parts starting two characters then 3 characters and then 3 characters
    const matches = [
        rollNo.toLowerCase().substring(0, 2),
        rollNo.toLowerCase().substring(2, 5),
        rollNo.toLowerCase().substring(5, 8),
    ];

    return {
        batch: parseInt("20" + matches[0]),
        branch: determineDepartment(rollNo),
        url: headerMap[parseInt(matches[0])].url,
        headers: {
            Referer: headerMap[parseInt(matches[0])].Referer,
            CSRFToken: headerMap[parseInt(matches[0])].CSRFToken,
            RequestVerificationToken:
                headerMap[parseInt(matches[0])].RequestVerificationToken,
        },
        programme: determineProgramme(rollNo),
    };
}
export function determineDepartment(RollNo: string) {
    const lowerRollNo = RollNo.toLowerCase();
    switch (true) {
        case lowerRollNo.includes("bar"):
            return "Architecture";
        case lowerRollNo.includes("bce"):
            return "Civil Engineering";
        case lowerRollNo.includes("bme"):
            return "Mechanical Engineering";
        case lowerRollNo.includes("bms"):
            return "Materials Science and Engineering";
        case lowerRollNo.includes("bma"):
            return "Mathematics and Computing";
        case lowerRollNo.includes("bph"):
            return "Engineering Physics";
        case lowerRollNo.includes("bee"):
            return "Electrical Engineering";
        case lowerRollNo.includes("bec") || lowerRollNo.includes("dec"):
            return "Electronics and Communication Engineering";
        case lowerRollNo.includes("bcs") || lowerRollNo.includes("dcs"):
            return "Computer Science and Engineering";
        case lowerRollNo.includes("bch"):
            return "Chemical Engineering";
        default:
            throw Error("No Similar branch");
    }
}
export function determineProgramme(RollNo: string) {
    const lowerRollNo = RollNo.toLowerCase();

    switch (true) {
        case lowerRollNo.includes("dcs") || lowerRollNo.includes("dec"):
            return "Dual Degree";
        case lowerRollNo.includes("bar"):
            return "B.Arch";
        default:
            return "B.Tech";
    }
}
