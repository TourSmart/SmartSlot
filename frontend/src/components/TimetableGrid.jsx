import PropTypes from 'prop-types';

// Utility to parse HH:mm from a time range like "09:00-10:00" and return minutes since midnight
const parseStartMinutes = (range) => {
  if (!range) return 0;
  const [start] = String(range).split('-');
  const [h, m] = start.split(':').map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const shapeData = (sessions = []) => {
  const days = DAY_ORDER;
  const times = Array.from(
    new Set(
      sessions
        .map((s) => s.time)
        .filter(Boolean)
    )
  ).sort((a, b) => parseStartMinutes(a) - parseStartMinutes(b));

  const grid = days.map((day) => ({ day, slots: {} }));
  sessions.forEach((s) => {
    const row = grid.find((g) => g.day === s.day);
    if (!row) return;
    row.slots[s.time] = row.slots[s.time] || [];
    row.slots[s.time].push(s);
  });

  return { days, times, grid };
};

const TimetableGrid = ({ sessions }) => {
  const { days, times, grid } = shapeData(sessions);

  if (times.length === 0) {
    return <p>No time-based data to render a grid.</p>;
  }

  const colorForType = (type) => {
    switch (type) {
      case 'practical':
        return 'tt-session--practical';
      case 'fieldwork':
        return 'tt-session--fieldwork';
      default:
        return 'tt-session--theory';
    }
  };

  return (
    <div className="tt-grid">
      <div className="tt-grid__head tt-grid__timecol">Time</div>
      {days.map((d) => (
        <div key={d} className="tt-grid__head">
          {d}
        </div>
      ))}

      {times.map((t) => (
        <>
          <div key={`time-${t}`} className="tt-grid__timecol">
            {t}
          </div>
          {grid.map((col) => {
            const cellSessions = col.slots[t] || [];
            return (
              <div key={`${col.day}-${t}`} className="tt-grid__cell">
                {cellSessions.map((s) => (
                  <div key={`${s.slotId}-${s.courseId}`} className={`tt-session ${colorForType(s.sessionType)}`}>
                    <div className="tt-session__title">{s.courseName}</div>
                    <div className="tt-session__meta">
                      <span>{s.facultyName}</span>
                      <span>•</span>
                      <span>{s.roomId}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      ))}
    </div>
  );
};

TimetableGrid.propTypes = {
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string,
      day: PropTypes.string,
      courseName: PropTypes.string,
      facultyName: PropTypes.string,
      roomId: PropTypes.string,
      slotId: PropTypes.string,
      courseId: PropTypes.string,
      sessionType: PropTypes.string,
    })
  ),
};

TimetableGrid.defaultProps = {
  sessions: [],
};

export default TimetableGrid;
