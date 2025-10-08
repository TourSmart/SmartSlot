import PropTypes from 'prop-types';

const ScenarioList = ({ scenarios, onLoadScenario, isLoading }) => {
  if (isLoading) {
    return (
      <section className="panel">
        <header className="panel__header">
          <h2>Saved Scenarios</h2>
        </header>
        <div className="panel__body">Loading scenarios...</div>
      </section>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <section className="panel">
        <header className="panel__header">
          <h2>Saved Scenarios</h2>
        </header>
        <div className="panel__body">No scenarios saved yet.</div>
      </section>
    );
  }

  return (
    <section className="panel">
      <header className="panel__header">
        <h2>Saved Scenarios</h2>
      </header>
      <ul className="scenario-list">
        {scenarios.map((scenario) => (
          <li key={scenario.id} className="scenario-list__item">
            <div>
              <p className="scenario-list__title">{scenario.name}</p>
              <p className="scenario-list__meta">Updated {new Date(scenario.updatedAt).toLocaleString()}</p>
            </div>
            <button type="button" onClick={() => onLoadScenario(scenario)} className="secondary-button">
              Load
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

ScenarioList.propTypes = {
  scenarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      updatedAt: PropTypes.string,
      config: PropTypes.object,
      timetable: PropTypes.object,
    })
  ),
  onLoadScenario: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ScenarioList.defaultProps = {
  scenarios: [],
  isLoading: false,
};

export default ScenarioList;
