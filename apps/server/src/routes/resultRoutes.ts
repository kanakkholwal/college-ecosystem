import { Router } from 'express';
import {scrapeResult} from '@app/controllers/results';


const router = Router();

router.get('/scrape', scrapeResult);

export default router;
