import { ScrapeResult } from '@app/services/scraper/result';

import { NextFunction, Request, Response } from 'express';

export const scrapeResult = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const rollNo = req.query.rollNo as string;
        if (!rollNo) {
            throw new Error('Roll No is required');
        }

        const result = await ScrapeResult(rollNo);
        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};

