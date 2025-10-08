import { programs, courses, faculty, rooms, slots } from '../data/sampleData.js';
import { saveScenarioSnapshot, listScenarios } from '../data/scenarioStore.js';
import { generateOptimisedTimetable } from '../services/timetableService.js';

export const getPrograms = (_req, res) => {
  res.json({ programs });
};

export const getResources = (_req, res) => {
  res.json({ courses, faculty, rooms, slots });
};

export const generateTimetable = (req, res, next) => {
  try {
    const timetable = generateOptimisedTimetable(req.body);
    res.json(timetable);
  } catch (error) {
    next(error);
  }
};

export const saveScenario = (req, res, next) => {
  try {
    const scenario = saveScenarioSnapshot({
      id: req.body.scenarioId,
      name: req.body.name,
      config: req.body.config,
      timetable: req.body.timetable,
    });

    res.status(201).json({ scenario });
  } catch (error) {
    next(error);
  }
};

export const getScenarios = (_req, res) => {
  res.json({ scenarios: listScenarios() });
};

export default {
  getPrograms,
  getResources,
  generateTimetable,
  saveScenario,
  getScenarios,
};
