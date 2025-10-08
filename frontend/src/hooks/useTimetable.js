import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPrograms,
  fetchResources,
  fetchScenarios,
  generateTimetable,
  saveScenario,
} from '../api/timetableApi.js';

export const usePrograms = () =>
  useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms,
  });

export const useResources = () =>
  useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
  });

export const useScenarios = () =>
  useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
  });

export const useGenerateTimetable = () =>
  useMutation({
    mutationFn: generateTimetable,
  });

export const useSaveScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
};

export default {
  usePrograms,
  useResources,
  useScenarios,
  useGenerateTimetable,
  useSaveScenario,
};
