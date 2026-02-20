import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { PAGES } from '../shared/constants';
import { AppShell } from './components/AppShell';
import { useAppStore } from './stores/app-store';
import { useActivityLogger } from './hooks/use-activity-logger';
import Dashboard from './pages/Dashboard';
import WritingStudio from './pages/WritingStudio';
import TopicManager from './pages/TopicManager';
import Benchmarking from './pages/Benchmarking';
import ReferenceLibrary from './pages/ReferenceLibrary';
import ExperienceSystem from './pages/ExperienceSystem';
import Metrics from './pages/Metrics';
import Settings from './pages/Settings';

export default function App() {
  const setProjectPath = useAppStore((s) => s.setProjectPath);

  // Mount global activity logger
  useActivityLogger();

  useEffect(() => {
    // Initialize project path from main process
    window.electronAPI?.app.getProjectPath().then((path) => {
      setProjectPath(path);
    });
  }, [setProjectPath]);

  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path={PAGES.DASHBOARD} element={<Dashboard />} />
          <Route path={PAGES.WRITING_STUDIO} element={<WritingStudio />} />
          <Route path={PAGES.TOPIC_MANAGER} element={<TopicManager />} />
          <Route path={PAGES.BENCHMARKING} element={<Benchmarking />} />
          <Route path={PAGES.REFERENCE_LIBRARY} element={<ReferenceLibrary />} />
          <Route path={PAGES.EXPERIENCE_SYSTEM} element={<ExperienceSystem />} />
          <Route path={PAGES.METRICS} element={<Metrics />} />
          <Route path={PAGES.SETTINGS} element={<Settings />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
