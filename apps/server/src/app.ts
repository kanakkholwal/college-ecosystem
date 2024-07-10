import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import morgan from 'morgan';
import jobRoutes from './routes/jobRoutes';
import resultRoutes from './routes/resultRoutes';

const app:Application = express();

app.use(morgan('dev'));
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors({
    origin:['localhost:3000','nith.eu.org'],
}));

app.use('/results', resultRoutes);
app.use('/jobs', jobRoutes);

export default app;
