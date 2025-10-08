import { randomUUID } from 'node:crypto';

const scenarios = new Map();

export const saveScenarioSnapshot = ({ id, name, config, timetable }) => {
  const scenarioId = id || randomUUID();
  const timestamp = new Date().toISOString();

  scenarios.set(scenarioId, {
    id: scenarioId,
    name,
    config,
    timetable,
    updatedAt: timestamp,
  });

  return scenarios.get(scenarioId);
};

export const listScenarios = () => Array.from(scenarios.values());

export const getScenario = (id) => scenarios.get(id);

export default {
  saveScenarioSnapshot,
  listScenarios,
  getScenario,
};
