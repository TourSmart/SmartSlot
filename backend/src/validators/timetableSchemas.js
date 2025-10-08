import Joi from 'joi';

const courseSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  credits: Joi.number().integer().min(1),
  type: Joi.string().valid('theory', 'practical', 'fieldwork', 'seminar', 'lab', 'project'),
  facultyPool: Joi.array().items(Joi.string()),
  preferredSlots: Joi.array().items(Joi.string()),
  roomType: Joi.string(),
  roomTypes: Joi.array().items(Joi.string()),
});

const constraintSchema = Joi.object({
  maxSessionsPerDay: Joi.number().integer().min(1).max(4),
  preferredDays: Joi.array().items(
    Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
  ),
  avoidSlots: Joi.array().items(Joi.string()),
});

export const generateTimetableSchema = {
  body: Joi.object({
    programId: Joi.string().required(),
    semester: Joi.number().integer().min(1).required(),
    electives: Joi.array().items(Joi.string()).default([]),
    customCourses: Joi.array().items(courseSchema).default([]),
    constraints: constraintSchema.default({}),
  }),
};

export const saveScenarioSchema = {
  body: Joi.object({
    scenarioId: Joi.string().optional(),
    name: Joi.string().required(),
    config: Joi.object({
      programId: Joi.string().required(),
      semester: Joi.number().integer().min(1).required(),
      electives: Joi.array().items(Joi.string()).default([]),
      constraints: constraintSchema.default({}),
    }).required(),
    timetable: Joi.object({
      sessions: Joi.array().items(
        Joi.object({
          courseId: Joi.string().required(),
          facultyId: Joi.string().required(),
          roomId: Joi.string().required(),
          slotId: Joi.string().required(),
        })
      ),
      unassigned: Joi.array().items(
        Joi.object({
          courseId: Joi.string().required(),
          reason: Joi.string().required(),
        })
      ),
      summary: Joi.object().unknown(true),
      metadata: Joi.object().unknown(true),
    }).required(),
  }),
};
