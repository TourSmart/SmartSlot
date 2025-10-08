import PropTypes from 'prop-types';
import { exportTimetableToPDF, exportTimetableToCSV } from '../utils/exporters.js';

const TimetableSessions = ({ timetable, isGenerating }) => {
  if (isGenerating) {
    return (
      <section className="panel">
        <header className="panel__header">
          <h2>Timetable Sessions</h2>
        </header>
        <div className="panel__body">Generating timetable…</div>
      </section>
    );
  }

  if (!timetable) {
    return (
      <section className="panel">
        <header className="panel__header">
          <h2>Timetable Sessions</h2>
        </header>
        <div className="panel__body">Generate a timetable to view scheduled sessions.</div>
      </section>
    );
  }

  const handleExportPDF = () => exportTimetableToPDF({ timetable });
  const handleExportCSV = () => exportTimetableToCSV({ timetable });

  const { sessions = [], unassigned = [] } = timetable;
  const hasSessions = sessions.length > 0;

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Timetable Sessions</h2>
          <p className="panel__subtitle">Conflict-free schedule generated from provided preferences.</p>
        </div>
        <div className="panel__actions">
          <button type="button" className="secondary-button" onClick={handleExportCSV} disabled={!hasSessions}>
            Export CSV
          </button>
          <button type="button" className="primary-button" onClick={handleExportPDF} disabled={!hasSessions}>
            Export PDF
          </button>
        </div>
      </header>
      <div className="panel__body">
        {hasSessions ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Faculty</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={`${session.slotId}-${session.courseId}`}>
                    <td>{session.day}</td>
                    <td>{session.time}</td>
                    <td>{session.courseName}</td>
                    <td>{session.facultyName}</td>
                    <td>{session.roomId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No sessions could be scheduled with the selected constraints.</p>
        )}

        {unassigned.length > 0 && (
          <div className="unassigned">
            <h3>Unassigned courses</h3>
            <ul>
              {unassigned.map((item) => (
                <li key={item.courseId}>
                  <strong>{item.courseName}</strong>: {item.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

TimetableSessions.propTypes = {
  timetable: PropTypes.shape({
    sessions: PropTypes.arrayOf(
      PropTypes.shape({
        slotId: PropTypes.string,
        courseId: PropTypes.string,
        courseName: PropTypes.string,
        day: PropTypes.string,
        time: PropTypes.string,
        facultyName: PropTypes.string,
        roomId: PropTypes.string,
      })
    ),
    unassigned: PropTypes.arrayOf(
      PropTypes.shape({
        courseId: PropTypes.string,
        courseName: PropTypes.string,
        reason: PropTypes.string,
      })
    ),
  }),
  isGenerating: PropTypes.bool,
};

TimetableSessions.defaultProps = {
  timetable: null,
  isGenerating: false,
};

export default TimetableSessions;
