import { Router } from 'express';
import timetableRouter from './timetableRoutes.js';

const router = Router();

router.use('/timetables', timetableRouter);

export default router;
