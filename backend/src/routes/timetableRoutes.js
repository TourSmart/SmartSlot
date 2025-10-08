import { Router } from 'express';
import {
  getPrograms,
  getResources,
  generateTimetable,
  saveScenario,
  getScenarios,
} from '../controllers/timetableController.js';
import validateRequest from '../validators/validateRequest.js';
import {
  generateTimetableSchema,
  saveScenarioSchema,
} from '../validators/timetableSchemas.js';

const router = Router();

router.get('/programs', getPrograms);
router.get('/resources', getResources);
router.post('/generate', validateRequest(generateTimetableSchema), generateTimetable);
router.post('/scenarios', validateRequest(saveScenarioSchema), saveScenario);
router.get('/scenarios', getScenarios);

export default router;
