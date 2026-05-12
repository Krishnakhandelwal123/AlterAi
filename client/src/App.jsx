import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LocomotiveRoot from './components/LocomotiveRoot';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import MyClones from './pages/dashboard/MyClones';
import CreateClone from './pages/dashboard/CreateClone';
import Analytics from './pages/dashboard/Analytics';
import VoiceClone from './pages/dashboard/VoiceClone';
import TrainingData from './pages/dashboard/TrainingData';
import ShareEmbed from './pages/dashboard/ShareEmbed';
import EmbedWidget from './pages/dashboard/EmbedWidget';
import Billing from './pages/dashboard/Billing';
import Settings from './pages/dashboard/Settings';
import Help from './pages/dashboard/Help';
import DashboardPlaceholder from './pages/dashboard/DashboardPlaceholder';

const App = () => (
  <LocomotiveRoot>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="clones" element={<MyClones />} />
        <Route path="create" element={<CreateClone />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="voice" element={<VoiceClone />} />
        <Route path="training" element={<TrainingData />} />
        <Route path="share" element={<ShareEmbed />} />
        <Route path="embed" element={<EmbedWidget />} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
        <Route path="activity" element={<DashboardPlaceholder title="Activity" />} />
        <Route path="integrations" element={<DashboardPlaceholder title="Integrations" />} />
        <Route path="models" element={<DashboardPlaceholder title="Models" />} />
        <Route path="security" element={<DashboardPlaceholder title="API & security" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </LocomotiveRoot>
);

export default App;
