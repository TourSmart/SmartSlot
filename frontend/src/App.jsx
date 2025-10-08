import { useMemo, useState } from 'react';
import ProgramConfigurator from './components/ProgramConfigurator.jsx';
import TimetableSummary from './components/TimetableSummary.jsx';
import TimetableSessions from './components/TimetableSessions.jsx';
import ScenarioList from './components/ScenarioList.jsx';
import DecorativeBackground from './components/DecorativeBackground.jsx';
import NavBar from './components/NavBar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import {
  usePrograms,
  useResources,
  useScenarios,
  useGenerateTimetable,
  useSaveScenario,
} from './hooks/useTimetable.js';
import { useToast } from './hooks/useToast.jsx';
import './App.css';

const INITIAL_CONFIG = {
  programId: '',
  semester: 1,
  electives: [],
  constraints: {
    maxSessionsPerDay: 3,
    preferredDays: [],
    avoidSlots: [],
  },
};

const normaliseConstraints = (constraints = {}) => ({
  maxSessionsPerDay: constraints.maxSessionsPerDay ?? 3,
  preferredDays: constraints.preferredDays ?? [],
  avoidSlots: constraints.avoidSlots ?? [],
});

function App() {
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [timetable, setTimetable] = useState(null);
  const [scenarioName, setScenarioName] = useState('');
  const [feedback, setFeedback] = useState(null);
  const { showToast } = useToast();
  const featureHighlights = [
    {
      title: 'Scenario sandboxes',
      description: 'Clone and experiment with elective mixes before publishing to students.',
      accent: 'violet',
    },
    {
      title: 'Faculty pulse',
      description: 'Live utilisation gauges ensure coaching loads stay balanced across mentors.',
      accent: 'cyan',
    },
    {
      title: 'Zero-conflict AI',
      description: 'Smart heuristics detect clashes across labs, practicum blocks, and electives instantly.',
      accent: 'amber',
    },
  ];

  const onboardingTips = [
    {
      title: 'Import student choices',
      step: '1',
      detail: 'Connect your MIS to pull elective and credit loads directly into SmartSlot.',
    },
    {
      title: 'Sync faculty availability',
      step: '2',
      detail: 'Share the planner with programme coordinators to keep slots and workloads updated.',
    },
    {
      title: 'Simulate delivery weeks',
      step: '3',
      detail: 'Generate multiple drafts to compare conflict-free options before publishing.',
    },
  ];

  const {
    data: programs = [],
    isLoading: isLoadingPrograms,
    error: programsError,
  } = usePrograms();

  const {
    data: resources,
    isLoading: isLoadingResources,
    error: resourcesError,
  } = useResources();

  const {
    data: scenarios = [],
    isLoading: isLoadingScenarios,
    error: scenariosError,
  } = useScenarios();

  const generateMutation = useGenerateTimetable();
  const saveScenarioMutation = useSaveScenario();

  const selectedProgram = useMemo(
    () => programs.find((item) => item.id === config.programId),
    [programs, config.programId]
  );

  const handleConfigChange = (nextConfig) => {
    setConfig({
      ...nextConfig,
      constraints: normaliseConstraints(nextConfig.constraints),
    });
  };

  const handleGenerate = () => {
    if (!config.programId) return;

    setFeedback(null);

    generateMutation.mutate(
      {
        programId: config.programId,
        semester: config.semester,
        electives: config.electives,
        constraints: config.constraints,
      },
      {
        onSuccess: (data) => {
          setTimetable(data);
          const defaultName = selectedProgram
            ? `${selectedProgram.name} · Sem ${config.semester}`
            : `Scenario ${new Date().toLocaleDateString()}`;
          setScenarioName((prev) => prev || defaultName);
          setFeedback({ type: 'success', message: 'Timetable generated successfully.' });
          showToast({ type: 'success', message: 'Timetable generated successfully.' });
        },
        onError: (error) => {
          setTimetable(null);
          setFeedback({
            type: 'error',
            message: error?.response?.data?.message || error.message || 'Failed to generate timetable.',
          });
          showToast({ type: 'error', message: error?.response?.data?.message || error.message || 'Failed to generate timetable.' });
        },
      }
    );
  };

  const handleReset = () => {
    setConfig(INITIAL_CONFIG);
    setTimetable(null);
    setScenarioName('');
    setFeedback(null);
  };

  const handleSaveScenario = () => {
    if (!timetable) return;

    const payload = {
      name: scenarioName?.trim() || `Scenario ${new Date().toLocaleString()}`,
      config: {
        programId: config.programId,
        semester: config.semester,
        electives: config.electives,
        constraints: config.constraints,
      },
      timetable,
    };

    setFeedback(null);

    saveScenarioMutation.mutate(payload, {
      onSuccess: (scenario) => {
        setScenarioName(scenario.name);
        setFeedback({ type: 'success', message: 'Scenario saved successfully.' });
        showToast({ type: 'success', message: 'Scenario saved successfully.' });
      },
      onError: (error) => {
        setFeedback({
          type: 'error',
          message: error?.response?.data?.message || error.message || 'Unable to save scenario.',
        });
        showToast({ type: 'error', message: error?.response?.data?.message || error.message || 'Unable to save scenario.' });
      },
    });
  };

  const handleLoadScenario = (scenario) => {
    if (!scenario) return;

    const scenarioConfig = scenario.config || {};

    setConfig({
      programId: scenarioConfig.programId || '',
      semester: scenarioConfig.semester || 1,
      electives: scenarioConfig.electives || [],
      constraints: normaliseConstraints(scenarioConfig.constraints),
    });

    setTimetable(scenario.timetable || null);
    setScenarioName(scenario.name || '');
    setFeedback({ type: 'info', message: `Loaded scenario "${scenario.name}"` });
  };

  const disableSaveButton = !timetable || saveScenarioMutation.isPending;

  const queryErrors = [programsError, resourcesError, scenariosError].filter(Boolean);
  const errorMessage = queryErrors.length > 0 ? queryErrors.map((err) => err.message).join(' • ') : null;

  return (
    <div className="app">
      <NavBar />
      <DecorativeBackground />

      <section className="app__hero">
        <div className="app__hero-content">
          <span className="badge">NEP 2020 Ready</span>
          <h1>
            Create <span>intelligent timetables</span> for multidisciplinary programmes in minutes.
          </h1>
          <p>
            SmartSlot blends AI-assisted planning with intuitive controls so your academic teams can focus on 
            learner outcomes while we handle conflicts, constraints, and capacity.
          </p>
          <div className="hero__cta">
            <p className="hero__cta-caption">Set programme preferences below and launch SmartSlot optimisation when ready.</p>
          </div>
          <dl className="hero__stats">
            <div>
              <dt>Courses indexed</dt>
              <dd>{Object.keys(resources?.courses || {}).length || '—'}</dd>
            </div>
            <div>
              <dt>Faculty tracked</dt>
              <dd>{Object.keys(resources?.faculty || {}).length || '—'}</dd>
            </div>
            <div>
              <dt>Favourite scenarios</dt>
              <dd>{scenarios?.length || 0}</dd>
            </div>
          </dl>
        </div>
        <div className="app__hero-actions">
          <div className="app__scenario-card">
            <p>Save your best configurations as reusable scenarios for upcoming semesters.</p>
            <div className="app__scenario-actions">
              <input
                className="app__scenario-input"
                type="text"
                placeholder="Scenario name"
                value={scenarioName}
                onChange={(event) => setScenarioName(event.target.value)}
                disabled={!timetable}
              />
              <button
                type="button"
                className="primary-button"
                onClick={handleSaveScenario}
                disabled={disableSaveButton}
              >
                {saveScenarioMutation.isPending ? 'Saving…' : 'Save Scenario'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="app__insights">
        {featureHighlights.map((feature) => (
          <article key={feature.title} className={`insight-card insight-card--${feature.accent}`}>
            <header>
              <span className="insight-card__spark" />
              <h3>{feature.title}</h3>
            </header>
            <p>{feature.description}</p>
            <span className="insight-card__cta">Explore workflows →</span>
          </article>
        ))}
      </section>

      {feedback && <div className={`alert alert--${feedback.type}`}>{feedback.message}</div>}

      {errorMessage && <div className="alert alert--error">{errorMessage}</div>}

      <main className="app__main">
        <div className="app__primary">
          <ProgramConfigurator
            programs={programs}
            resources={resources}
            value={config}
            onChange={handleConfigChange}
            onGenerate={handleGenerate}
            onReset={handleReset}
            isGenerating={generateMutation.isPending}
            isLoadingPrograms={isLoadingPrograms}
            isLoadingResources={isLoadingResources}
          />

          <TimetableSummary summary={timetable?.summary} />

          <TimetableSessions timetable={timetable} isGenerating={generateMutation.isPending} />
        </div>

        <aside className="app__sidebar">
          <ScenarioList
            scenarios={scenarios}
            onLoadScenario={handleLoadScenario}
            isLoading={isLoadingScenarios}
          />

          {Array.isArray(timetable?.metadata?.warnings) && timetable.metadata.warnings.length > 0 && (
            <section className="panel">
              <header className="panel__header">
                <h2>Generation Warnings</h2>
              </header>
              <div className="panel__body warning-list">
                <ul>
                  {timetable.metadata.warnings.map((warning, index) => (
                    <li key={`${warning}-${index}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {timetable?.metadata?.generatedAt && (
            <section className="panel">
              <header className="panel__header">
                <h2>Metadata</h2>
              </header>
              <div className="panel__body metadata">
                <p>
                  <strong>Generated:</strong> {new Date(timetable.metadata.generatedAt).toLocaleString()}
                </p>
              </div>
            </section>
          )}
        </aside>
      </main>

      <section className="app__workflow">
        <div className="workflow__header">
          <h2>Launch in three smooth moves</h2>
          <p>Blend SmartSlot into your academic calendar with these quick start steps.</p>
        </div>
        <div className="workflow__grid">
          {onboardingTips.map((tip) => (
            <article key={tip.title} className="workflow-card">
              <div className="workflow-card__badge">{tip.step}</div>
              <h3>{tip.title}</h3>
              <p>{tip.detail}</p>
              <button type="button" className="link-button">
                View playbook
              </button>
            </article>
          ))}
        </div>
      </section>
      <ToastContainer />
    </div>
  );
}

export default App;
