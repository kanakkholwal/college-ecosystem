import { Router } from 'express';
import {scrapeJobs} from '@app/controllers/jobs-scraper';


const router = Router();

router.get('/jobs-scraper', scrapeJobs);

export default router;
