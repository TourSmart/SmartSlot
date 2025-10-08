import apiClient from './client.js';

export const fetchPrograms = async () => {
  const { data } = await apiClient.get('/timetables/programs');
  return data.programs;
};

export const fetchResources = async () => {
  const { data } = await apiClient.get('/timetables/resources');
  return data;
};

export const fetchScenarios = async () => {
  const { data } = await apiClient.get('/timetables/scenarios');
  return data.scenarios;
};

export const generateTimetable = async (payload) => {
  const { data } = await apiClient.post('/timetables/generate', payload);
  return data;
};

export const saveScenario = async (payload) => {
  const { data } = await apiClient.post('/timetables/scenarios', payload);
  return data.scenario;
};

export default {
  fetchPrograms,
  fetchResources,
  fetchScenarios,
  generateTimetable,
  saveScenario,
};
