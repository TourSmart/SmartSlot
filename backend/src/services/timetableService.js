import { programs, courses as courseCatalog, faculty as facultyCatalog, rooms, slots } from '../data/sampleData.js';

const COURSE_TYPE_ROOM_MAP = {
  theory: ['classroom', 'seminar'],
  practical: ['lab', 'seminar'],
  fieldwork: ['field', 'seminar'],
  seminar: ['seminar'],
  lab: ['lab'],
  project: ['lab', 'classroom'],
};

const slotIndex = new Map(slots.map((slot) => [slot.id, slot]));

const normaliseCourseDefinition = (course) => ({
  ...course,
  preferredSlots: Array.isArray(course.preferredSlots) ? course.preferredSlots : [],
  facultyPool: Array.isArray(course.facultyPool) ? course.facultyPool : [],
});

const buildCoursePool = (customCourses = []) => {
  const pool = new Map(Object.entries(courseCatalog).map(([id, value]) => [id, normaliseCourseDefinition(value)]));

  customCourses.forEach((course) => {
    if (course?.id) {
      pool.set(course.id, normaliseCourseDefinition(course));
    }
  });

  return pool;
};

const getCourseRoomTypes = (course) => {
  if (course?.roomType) {
    return [course.roomType];
  }

  if (Array.isArray(course?.roomTypes) && course.roomTypes.length > 0) {
    return course.roomTypes;
  }

  return COURSE_TYPE_ROOM_MAP[course?.type] || ['classroom'];
};

const selectFaculty = ({ course, slotId, facultyLoadTracker, slotFacultyUsage, warnings }) => {
  for (const facultyId of course.facultyPool) {
    const faculty = facultyCatalog[facultyId];
    if (!faculty) {
      warnings.push(`Faculty '${facultyId}' listed for course '${course.id}' is not registered.`);
      continue;
    }

    const isAvailable = faculty.availability?.includes(slotId);
    if (!isAvailable) continue;

    const currentLoad = facultyLoadTracker.get(facultyId) || 0;
    if (currentLoad >= faculty.maxLoad) continue;

    const facultyUsageForSlot = slotFacultyUsage.get(slotId) || new Set();
    if (facultyUsageForSlot.has(facultyId)) continue;

    facultyUsageForSlot.add(facultyId);
    slotFacultyUsage.set(slotId, facultyUsageForSlot);
    facultyLoadTracker.set(facultyId, currentLoad + course.credits);
    return faculty;
  }

  return null;
};

const selectRoom = ({ course, slotId, slotRoomUsage }) => {
  const requiredTypes = getCourseRoomTypes(course);

  for (const room of rooms) {
    const isTypeMatch = requiredTypes.includes(room.type);
    if (!isTypeMatch) continue;

    const isSlotAvailable = room.availability?.includes(slotId);
    if (!isSlotAvailable) continue;

    const roomUsageForSlot = slotRoomUsage.get(slotId) || new Set();
    if (roomUsageForSlot.has(room.id)) continue;

    roomUsageForSlot.add(room.id);
    slotRoomUsage.set(slotId, roomUsageForSlot);
    return room;
  }

  return null;
};

const buildCandidateSlots = ({ course, constraints = {} }) => {
  const { avoidSlots = [] } = constraints;
  const avoidSet = new Set(avoidSlots);
  const preferred = course.preferredSlots || [];
  const allSlotIds = slots.map((slot) => slot.id);
  const combined = [...preferred, ...allSlotIds];

  return combined.filter((slotId, index) => combined.indexOf(slotId) === index && !avoidSet.has(slotId));
};

const meetsDayConstraint = ({ slotId, constraints = {}, dayUsage }) => {
  if (!constraints.maxSessionsPerDay) return true;

  const slot = slotIndex.get(slotId);
  if (!slot) return false;

  const sessionsForDay = dayUsage.get(slot.day) || 0;
  return sessionsForDay < constraints.maxSessionsPerDay;
};

const respectsPreferredDays = ({ slotId, constraints = {} }) => {
  if (!constraints.preferredDays || constraints.preferredDays.length === 0) return true;

  const slot = slotIndex.get(slotId);
  if (!slot) return false;

  return constraints.preferredDays.includes(slot.day);
};

const assignCourse = ({
  course,
  timetable,
  constraints,
  slotUsage,
  dayUsage,
  facultyLoadTracker,
  slotFacultyUsage,
  slotRoomUsage,
  warnings,
}) => {
  const candidateSlots = buildCandidateSlots({ course, constraints });

  for (const slotId of candidateSlots) {
    if (slotUsage.has(slotId)) continue;
    if (!respectsPreferredDays({ slotId, constraints })) continue;
    if (!meetsDayConstraint({ slotId, constraints, dayUsage })) continue;

    const slot = slotIndex.get(slotId);
    if (!slot) continue;

    const faculty = selectFaculty({ course, slotId, facultyLoadTracker, slotFacultyUsage, warnings });
    if (!faculty) continue;

    const room = selectRoom({ course, slotId, slotRoomUsage });
    if (!room) continue;

    slotUsage.add(slotId);
    dayUsage.set(slot.day, (dayUsage.get(slot.day) || 0) + 1);

    timetable.sessions.push({
      courseId: course.id,
      courseName: course.name,
      credits: course.credits,
      sessionType: course.type,
      facultyId: faculty.id,
      facultyName: faculty.name,
      roomId: room.id,
      roomType: room.type,
      slotId,
      day: slot.day,
      time: slot.time,
    });

    return true;
  }

  timetable.unassigned.push({
    courseId: course.id,
    courseName: course.name,
    reason: 'No conflict-free slot available with current constraints',
  });

  return false;
};

const buildFacultyUtilisation = (facultyLoadTracker) =>
  Object.values(facultyCatalog).map((member) => {
    const used = facultyLoadTracker.get(member.id) || 0;
    return {
      facultyId: member.id,
      facultyName: member.name,
      utilisedCredits: used,
      capacityCredits: member.maxLoad,
      utilisationRate: Math.min(1, used / member.maxLoad),
    };
  });

export const generateOptimisedTimetable = ({
  programId,
  semester,
  electives = [],
  customCourses = [],
  constraints = {},
} = {}) => {
  const program = programs.find((item) => item.id === programId);
  if (!program) {
    const error = new Error(`Program '${programId}' not found.`);
    error.status = 404;
    throw error;
  }

  const warnings = [];
  const coursePool = buildCoursePool(customCourses);

  const selectedCourseIds = new Set(program.courses || []);
  electives.forEach((courseId) => selectedCourseIds.add(courseId));

  const selectedCourses = Array.from(selectedCourseIds)
    .map((courseId) => {
      const course = coursePool.get(courseId);
      if (!course) {
        warnings.push(`Course '${courseId}' could not be located in the catalog.`);
      }
      return course;
    })
    .filter(Boolean);

  if (selectedCourses.length === 0) {
    const error = new Error('No valid courses available for timetable generation.');
    error.status = 400;
    throw error;
  }

  const timetable = { sessions: [], unassigned: [] };
  const slotUsage = new Set();
  const dayUsage = new Map();
  const facultyLoadTracker = new Map();
  const slotFacultyUsage = new Map();
  const slotRoomUsage = new Map();

  selectedCourses.forEach((course) => {
    assignCourse({
      course,
      timetable,
      constraints,
      slotUsage,
      dayUsage,
      facultyLoadTracker,
      slotFacultyUsage,
      slotRoomUsage,
      warnings,
    });
  });

  timetable.summary = {
    program: { id: program.id, name: program.name, semester },
    totals: {
      plannedCourses: selectedCourses.length,
      scheduledSessions: timetable.sessions.length,
      unscheduledSessions: timetable.unassigned.length,
    },
    facultyUtilisation: buildFacultyUtilisation(facultyLoadTracker),
  };

  timetable.metadata = {
    generatedAt: new Date().toISOString(),
    constraintsApplied: constraints,
    warnings,
  };

  return timetable;
};

export default {
  generateOptimisedTimetable,
};
