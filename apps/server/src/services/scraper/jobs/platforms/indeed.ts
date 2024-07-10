/* eslint-disable @typescript-eslint/no-explicit-any */
// import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';

export interface ScraperInput {
  searchTerm: string;
  location: string;
  distance: number;
  hoursOld: number;
  resultsWanted: number;
  country: string;
  descriptionFormat: string;
}

interface Job {
  id: string;
  title: string;
  companyName: string;
  companyUrl: string | null;
  location: string;
  jobType: string[];
  compensation: string | null;
  datePosted: string;
  jobUrl: string;
  isRemote: boolean;
}

export class IndeedScraper {
  private api_url = 'https://apis.indeed.com/graphql';
  private headers = {
    'Host': 'apis.indeed.com',
    'content-type': 'application/json',
    'indeed-api-key': '161092c2017b5bbab13edb12461a62d5a833871e7cad6d9d475304573de67ac8',
    'accept': 'application/json',
    'indeed-locale': 'en-US',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Indeed App 193.1',
    'indeed-app-info': 'appv=193.1; appid=com.indeed.jobsearch; osv=16.6.1; os=ios; dtype=phone',
    'referer': 'https://www.indeed.com/',
  }
  // private client: ApolloClient<any>;

  constructor() {

  }

  // public async scrape(scraperInput: ScraperInput): Promise<Job[]> {
    // let jobList: Job[] = [];
    // let page = 1;
    // let cursor: string | null = null;
    // console.log('scrape', scraperInput);


    // while (jobList.length < scraperInput.resultsWanted) {
      // console.log(`Indeed search page: ${page}`);
      // const { jobs, newCursor } = await this.scrapePage(scraperInput, cursor);
      // if (!jobs.length) {
      //   console.log(`Indeed found no jobs on page: ${page}`);
      //   break;
      // }
      // jobList = jobList.concat(jobs);
      // cursor = newCursor;
      // page++;
    // }

    // return jobList.slice(0, scraperInput.resultsWanted);
  // }

  private async scrapePage(scraperInput: ScraperInput, cursor: string | null) {
    console.log('scrapePage', scraperInput, cursor);
    // const query = this.buildQuery(scraperInput, cursor);

    // console.log('Query:', query);

    try {
      // const { data } = await this.client.query({
      //   query,
      //   variables: {},
      //   fetchPolicy: 'no-cache',
      // });
      // const jobs = data.jobSearch.results.map((job: any) => this.processJob(job.job));
      // const newCursor = data.jobSearch.pageInfo.nextCursor;

      // return { jobs, newCursor };
    } catch (error) {
      console.error('Error response:', error);
      throw error;
    }
  }

  private buildQuery(scraperInput: ScraperInput, cursor: string | null) {
    console.log('buildQuery', scraperInput, cursor);
  //   return gql`
  //  query GetJobData($searchTerm: String, $location: String, $dateOnIndeed: Int, $cursor: String, $filters: String) {
  //   jobSearch(
  //     what: $searchTerm
  //     location: $location
  //     includeSponsoredResults: NONE
  //     limit: 100
  //     sort: DATE
  //     cursor: $cursor
  //     filters: $filters
  //   ) {
  //     pageInfo {
  //       nextCursor
  //     }
  //     results {
  //       trackingKey
  //       job {
  //         key
  //         title
  //         datePublished
  //         dateOnIndeed
  //         description {
  //           html
  //         }
  //         compensation {
  //           baseSalary {
  //             unitOfWork
  //           }
  //           currencyCode
  //         }
  //         attributes {
  //           key
  //           label
  //         }
  //         employer {
  //           relativeCompanyPageUrl
  //           name
  //           dossier {
  //             employerDetails {
  //               addresses
  //               industry
  //               employeesLocalizedLabel
  //               revenueLocalizedLabel
  //               briefDescription
  //               ceoName
  //               ceoPhotoUrl
  //             }
  //             images {
  //               headerImageUrl
  //               squareLogoUrl
  //             }
  //             links {
  //               corporateWebsite
  //             }
  //           }
  //         }
  //         recruit {
  //           viewJobUrl
  //           detailedSalary
  //           workSchedule
  //         }
  //       }
  //     }
  //   }
  // }
  //      `;
  }

  private processJob(job: any): Job {
    const jobUrl = `https://www.indeed.com/viewjob?jk=${job.key}`;
    const description = job.description.html;
    const jobType = job.attributes.map((attr: any) => attr.label);
    const compensation = job.compensation?.baseSalary ? `${job.compensation.baseSalary.range.min} - ${job.compensation.baseSalary.range.max} ${job.compensation.currencyCode}` : null;
    const datePosted = new Date(job.datePublished / 1000).toISOString().split('T')[0];

    return {
      id: job.key,
      title: job.title,
      companyName: job.employer?.name || '',
      companyUrl: job.employer ? `https://www.indeed.com${job.employer.relativeCompanyPageUrl}` : null,
      location: `${job.location.city}, ${job.location.admin1Code}, ${job.location.countryCode}`,
      jobType,
      compensation,
      datePosted,
      jobUrl,
      isRemote: this.isJobRemote(job, description),
    };
  }

  private isJobRemote(job: any, description: string): boolean {
    const remoteKeywords = ["remote", "work from home", "wfh"];
    return remoteKeywords.some(keyword => description.toLowerCase().includes(keyword)) ||
      job.attributes.some((attr: any) => remoteKeywords.includes(attr.label.toLowerCase()));
  }
}

