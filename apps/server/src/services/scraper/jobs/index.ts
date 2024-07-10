// import { IndeedScraper, ScraperInput } from './platforms/indeed';

export const PLATFORMS = {
    indeed:{
        // callback:
    }
}

export async function scrapeJobFromPlatform(platform:string, query:string) {
    console.log('scrapeJobFromPlatform', platform, query);
    // Usage example:
// const scraperInput: ScraperInput = {
//     searchTerm: 'software engineer',
//     location: 'Dallas, TX',
//     distance: 50,
//     hoursOld: 72,
//     resultsWanted: 20,
//     country: 'US',
//     descriptionFormat: 'HTML',
// };

// const scraper = new IndeedScraper();
// scraper.scrape(scraperInput)
//     .then(jobs => {
//         console.log(`Found ${jobs.length} jobs`);
//         console.log(jobs);
//     })
//     .catch(error => {
//         console.error('Error scraping jobs:', error);
//     });


    
}