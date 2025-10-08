import PropTypes from 'prop-types';
import { useMemo } from 'react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ProgramConfigurator = ({
  programs,
  resources,
  value,
  onChange,
  onGenerate,
  isGenerating,
  onReset,
  isLoadingPrograms,
  isLoadingResources,
}) => {
  const isLoading = isLoadingPrograms || isLoadingResources;
  const constraints = {
    maxSessionsPerDay: value.constraints?.maxSessionsPerDay ?? 3,
    preferredDays: value.constraints?.preferredDays ?? [],
    avoidSlots: value.constraints?.avoidSlots ?? [],
  };

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === value.programId),
    [programs, value.programId]
  );

  const allCourses = useMemo(() => {
    if (!resources?.courses) return [];
    return Object.values(resources.courses);
  }, [resources]);

  const coreCourseIds = useMemo(
    () => new Set(selectedProgram?.courses ?? []),
    [selectedProgram]
  );

  const electiveCandidates = useMemo(
    () =>
      allCourses
        .filter((course) => !coreCourseIds.has(course.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allCourses, coreCourseIds]
  );

  const slotOptions = useMemo(() => resources?.slots ?? [], [resources]);

  const handleProgramChange = (event) => {
    const nextProgramId = event.target.value;
    if (!nextProgramId) {
      onChange({
        ...value,
        programId: '',
        semester: 1,
        electives: [],
      });
      return;
    }

    const nextProgram = programs.find((program) => program.id === nextProgramId);
    onChange({
      ...value,
      programId: nextProgramId,
      semester: Math.min(value.semester ?? 1, nextProgram?.semesters ?? 1),
      electives: [],
    });
  };

  const handleSemesterChange = (event) => {
    const semester = Number(event.target.value);
    onChange({
      ...value,
      semester: Number.isNaN(semester) ? 1 : semester,
    });
  };

  const handleElectiveToggle = (courseId) => {
    const current = new Set(value.electives ?? []);
    if (current.has(courseId)) {
      current.delete(courseId);
    } else {
      current.add(courseId);
    }

    onChange({
      ...value,
      electives: Array.from(current),
    });
  };

  const handleConstraintChange = (updates) => {
    onChange({
      ...value,
      constraints: {
        ...constraints,
        ...updates,
      },
    });
  };

  const handlePreferredDayToggle = (day) => {
    const current = new Set(constraints.preferredDays);
    if (current.has(day)) {
      current.delete(day);
    } else {
      current.add(day);
    }

    handleConstraintChange({ preferredDays: Array.from(current) });
  };

  const handleAvoidSlotsChange = (event) => {
    const selections = Array.from(event.target.selectedOptions).map((option) => option.value);
    handleConstraintChange({ avoidSlots: selections });
  };

  const handleMaxSessionsChange = (event) => {
    const parsed = Number(event.target.value);
    handleConstraintChange({ maxSessionsPerDay: parsed > 0 ? parsed : 1 });
  };

  const disableGenerate = !value.programId || !value.semester || isGenerating;

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Configuration</h2>
          <p className="panel__subtitle">Select program, electives, and scheduling constraints.</p>
        </div>
      </header>
      <div className="panel__body">
        {isLoading ? (
          <div className="skeleton skeleton--form" aria-hidden="true">
            <div className="skeleton__title" />
            <div className="skeleton__row" />
            <div className="skeleton__row" />
            <div className="skeleton__grid">
              <span className="skeleton__pill" />
              <span className="skeleton__pill" />
              <span className="skeleton__pill" />
            </div>
            <div className="skeleton__box" />
          </div>
        ) : (
          <form className="form-grid compact" onSubmit={(event) => event.preventDefault()}>
            <div className="field">
              <label htmlFor="program">Programme</label>
              <select id="program" value={value.programId} onChange={handleProgramChange}>
                <option value="">Select programme</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              {selectedProgram && (
                <p className="field__hint">{selectedProgram.semesters} semesters · {selectedProgram.courses.length} core courses</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="semester">Semester</label>
              <input
                id="semester"
                type="number"
                min={1}
                max={selectedProgram?.semesters ?? 12}
                value={value.semester}
                onChange={handleSemesterChange}
              />
            </div>

            <fieldset className="field field--fieldset">
              <legend>Electives</legend>
              {electiveCandidates.length === 0 ? (
                <p className="field__hint">No additional electives available for this programme.</p>
              ) : (
                <div className="checkbox-list">
                  {electiveCandidates.map((course) => (
                    <label key={course.id} className="checkbox-list__item">
                      <input
                        type="checkbox"
                        checked={value.electives?.includes(course.id)}
                        onChange={() => handleElectiveToggle(course.id)}
                      />
                      <span>
                        <span className="checkbox-list__title">{course.name}</span>
                        <span className="checkbox-list__meta">{course.credits} credits · {course.type}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="field field--fieldset">
              <legend>Constraints</legend>
              <div className="field">
                <label htmlFor="maxSessions">Max sessions per day</label>
                <input
                  id="maxSessions"
                  type="number"
                  min={1}
                  max={4}
                  value={constraints.maxSessionsPerDay}
                  onChange={handleMaxSessionsChange}
                />
              </div>

              <div className="field">
                <span className="field__label">Preferred teaching days</span>
                <div className="chip-list">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`chip ${constraints.preferredDays.includes(day) ? 'chip--selected' : ''}`}
                      onClick={() => handlePreferredDayToggle(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="avoidSlots">Avoid time slots</label>
                <select
                  id="avoidSlots"
                  multiple
                  size={Math.min(8, slotOptions.length || 4)}
                  value={constraints.avoidSlots}
                  onChange={handleAvoidSlotsChange}
                >
                  {slotOptions.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.day} · {slot.time}
                    </option>
                  ))}
                </select>
                <p className="field__hint">Hold Ctrl/Cmd to select multiple slots.</p>
              </div>
            </fieldset>

          </form>
        )}

        <div className="sticky-actions" role="region" aria-label="Quick actions">
          <div className="sticky-actions__bar">
            <button
              type="button"
              className="secondary-button"
              onClick={onReset}
              disabled={!onReset || isGenerating}
            >
              Reset
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={onGenerate}
              disabled={disableGenerate}
            >
              {isGenerating ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

ProgramConfigurator.propTypes = {
  programs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      semesters: PropTypes.number.isRequired,
      courses: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ),
  resources: PropTypes.shape({
    courses: PropTypes.object,
    slots: PropTypes.array,
  }),
  value: PropTypes.shape({
    programId: PropTypes.string,
    semester: PropTypes.number,
    electives: PropTypes.arrayOf(PropTypes.string),
    constraints: PropTypes.shape({
      maxSessionsPerDay: PropTypes.number,
      preferredDays: PropTypes.arrayOf(PropTypes.string),
      avoidSlots: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  isGenerating: PropTypes.bool,
  onReset: PropTypes.func,
  isLoadingPrograms: PropTypes.bool,
  isLoadingResources: PropTypes.bool,
};

ProgramConfigurator.defaultProps = {
  programs: [],
  resources: null,
  isGenerating: false,
  onReset: null,
  isLoadingPrograms: false,
  isLoadingResources: false,
};

export default ProgramConfigurator;
