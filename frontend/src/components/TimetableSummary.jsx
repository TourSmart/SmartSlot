import PropTypes from 'prop-types';

const formatPercentage = (value) => `${Math.round(value * 100)}%`;

const TimetableSummary = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const { program, totals, facultyUtilisation } = summary;

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Timetable Overview</h2>
          {program && (
            <p className="panel__subtitle">
              {program.name} · Semester {program.semester ?? program?.semester ?? ''}
            </p>
          )}
        </div>
      </header>
      <div className="panel__body">
        <div className="metrics-grid">
          <div className="metric">
            <p className="metric__label">Courses planned</p>
            <p className="metric__value">{totals?.plannedCourses ?? 0}</p>
          </div>
          <div className="metric">
            <p className="metric__label">Sessions scheduled</p>
            <p className="metric__value">{totals?.scheduledSessions ?? 0}</p>
          </div>
          <div className="metric">
            <p className="metric__label">Sessions pending</p>
            <p className="metric__value">{totals?.unscheduledSessions ?? 0}</p>
          </div>
        </div>

        {Array.isArray(facultyUtilisation) && facultyUtilisation.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Utilised Credits</th>
                  <th>Total Capacity</th>
                  <th>Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {facultyUtilisation.map((member) => (
                  <tr key={member.facultyId}>
                    <td>{member.facultyName}</td>
                    <td>{member.utilisedCredits}</td>
                    <td>{member.capacityCredits}</td>
                    <td>
                      <div className="progress">
                        <div
                          className="progress__bar"
                          style={{ width: formatPercentage(member.utilisationRate || 0) }}
                        />
                        <span className="progress__label">
                          {formatPercentage(member.utilisationRate || 0)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

TimetableSummary.propTypes = {
  summary: PropTypes.shape({
    program: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      semester: PropTypes.number,
    }),
    totals: PropTypes.shape({
      plannedCourses: PropTypes.number,
      scheduledSessions: PropTypes.number,
      unscheduledSessions: PropTypes.number,
    }),
    facultyUtilisation: PropTypes.arrayOf(
      PropTypes.shape({
        facultyId: PropTypes.string,
        facultyName: PropTypes.string,
        utilisedCredits: PropTypes.number,
        capacityCredits: PropTypes.number,
        utilisationRate: PropTypes.number,
      })
    ),
  }),
};

TimetableSummary.defaultProps = {
  summary: null,
};

export default TimetableSummary;
