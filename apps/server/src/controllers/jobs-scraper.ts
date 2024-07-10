import { scrapeJobFromPlatform } from '@app/services/scraper/jobs';

import { NextFunction, Request, Response } from 'express';

export const scrapeJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    // const { platform, query } = req.body;
    const { platform, query } = {
      platform: "indeed",
      query: "frontend developer"
    };
    

    // const platformObj = PLATFORMS[platform];
    // if (!platformObj) {
    //   return res.status(400).json({ message: "Invalid platform" });
    // }

    const jobs = await scrapeJobFromPlatform(platform, query);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

