// import axios from "axios";
// import HTMLParser from "node-html-parser";
// import puppeteer, { Browser } from 'puppeteer';

// export type PlatformType = {
//     url: URL;
//     query: string;
//     params: Record<string, string>;
//     resultPageSelectors: {
//         results_container: string;
//         job_cards: string;
//         anchors: string;
//     },
//     jobPageSelectors: {
//         job_container: string;
//         title: string;
//         company: string;
//         location: string;
//         description: string;
//         apply_link: string;
//     }

// }

// export const PLATFORMS: Record<string, PlatformType> = {
//     "indeed": {
//         url: new URL("https://in.indeed.com/jobs"),
//         query: "q",
//         params: {
//             "sc": "0kf:attr(DSQF7)attr(HFDVW)jt(internship);",
//             "fromage": "3",
//             "vjk": "c60dde24d8a42c43"
//         },
//         resultPageSelectors: {
//             results_container: "div#mosaic-provider-jobcards",
//             job_cards: "li.eu4oa1w0",
//             anchors: "a.jcs-JobTitle"
//         },
//         jobPageSelectors: {
//             job_container: "div.jobsearch-JobComponent",
//             title: "h1.jobsearch-JobInfoHeader-title",
//             company: "[data-testid='inlineHeader-companyName']",
//             location: "div#jobLocationText",
//             description: "div#jobDescriptionText",
//             apply_link: "div.jobsearch-DesktopStickyContainer"

//         }
//     }
// }


// export const scrapeJobFromPlatform = async (platform: PlatformType, query: string) => {
//     const browser = await puppeteer.launch({ headless: true });
//     try {
//         const targetUrl = getFinalURL(platform, query);

//         const jobList = await getAllAnchors(platform, targetUrl,browser);
//         console.log(`${jobList.length} jobs found on ${platform.url}`)

//         const jobs = [];
//         for await (const job of jobList) {
//             const jobData = await getJobsData(platform, job);
//             if (jobData) {
//                 jobs.push(jobData);
//             }
//         }
//         console.log(`${jobs.length} jobs scraped from ${platform.url}`)
//         return jobs
//     } catch (error) {
//         throw error;
//     } finally {
//         await browser?.close();
//     }
// }


// const getFinalURL = (platform: PlatformType, query: string) => {
//     platform.url.searchParams.set(platform.query, query);
//     for (const [key, value] of Object.entries(platform.params)) {
//         platform.url.searchParams.set(key, value);
//     }
//     return platform.url.toString();
// }

// const getAllAnchors = async (platform: PlatformType, targetUrl: string,browser:Browser): Promise<{ title: string, link: string }[]> => {

//     const page = await browser.newPage();
//     const response = await page.goto(targetUrl, { waitUntil: 'networkidle2' });
//     const data = await page.content();
    
//     console.log("response",data);

//     const resultsContainer = HTMLParser.parse(response?.toString()!);

//     if (!resultsContainer) {
//         return []
//     }
//     const jobCards = resultsContainer.querySelectorAll(platform.resultPageSelectors.job_cards);
//     if (!jobCards) {
//         return []
//     }
//     const jobList = jobCards.map((jobCard) => {
//         const anchor = jobCard.querySelector(platform.resultPageSelectors.anchors);
//         if (!anchor) {
//             return null
//         }
//         return {
//             title: anchor.text,
//             link: anchor.getAttribute("href")!
//         }
//     }).filter((job) => job !== null)

//     return Promise.resolve(jobList);
// }
// const getJobsData = async (platform: PlatformType, job: { title: string, link: string }) => {
//     const response = await axios.get(job.link);
//     const document = HTMLParser.parse(response.data);
//     const jobContainer = document.querySelector(platform.jobPageSelectors.job_container);
//     if (!jobContainer) {
//         return null;
//     }
//     const title = jobContainer.querySelector(platform.jobPageSelectors.title)!.text;
//     const company = jobContainer.querySelector(platform.jobPageSelectors.company)!.text;
//     const location = jobContainer.querySelector(platform.jobPageSelectors.location)!.text;
//     const description = jobContainer.querySelector(platform.jobPageSelectors.description)!.text;
//     //  if jobContainer.querySelector(platform.jobPageSelectors.apply_link) is button then use job.link else use getAttribute("href")
//     const applyLink = jobContainer.querySelector(platform.jobPageSelectors.apply_link)!.tagName === "button" ? job.link : jobContainer.querySelector(platform.jobPageSelectors.apply_link)!.getAttribute("href")!;
//     return {
//         title,
//         company,
//         location,
//         description,
//         applyLink
//     }
// }
