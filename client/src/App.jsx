import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LocomotiveRoot from './components/LocomotiveRoot';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import MyClones from './pages/dashboard/MyClones';
import CreateClone from './pages/dashboard/CreateClone';
import Analytics from './pages/dashboard/Analytics';
import VoiceClone from './pages/dashboard/VoiceClone';
import TrainingData from './pages/dashboard/TrainingData';
import SharePage from './pages/SharePage';
import EmbedWidget from './pages/dashboard/EmbedWidget';
import Billing from './pages/dashboard/Billing';
import Settings from './pages/dashboard/Settings';
import Help from './pages/dashboard/Help';
import LegalPage from './pages/LegalPage';
import ErrorPage from './pages/ErrorPage';

const dashboardRoutes = (
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
    <Route path="voice/:cloneId" element={<VoiceClone />} />
    <Route path="training" element={<TrainingData />} />
    <Route path="share" element={<SharePage />} />
    <Route path="share/:cloneId" element={<SharePage />} />
    <Route path="embed" element={<EmbedWidget />} />
    <Route path="billing" element={<Billing />} />
    <Route path="settings" element={<Settings />} />
    <Route path="help" element={<Help />} />
    <Route path="*" element={<ErrorPage type="not-found" compact />} />
  </Route>
);

const marketingRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/legal/:page" element={<LegalPage />} />
    <Route path="/terms" element={<Navigate to="/legal/terms" replace />} />
    <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
    <Route path="/refund" element={<Navigate to="/legal/refund" replace />} />
    <Route path="/contact" element={<Navigate to="/legal/contact" replace />} />
    <Route path="/404" element={<ErrorPage type="not-found" />} />
    <Route path="/payment-failed" element={<ErrorPage type="payment-failed" />} />
    <Route path="/server-unavailable" element={<ErrorPage type="server-unavailable" />} />
    <Route path="/clone-not-live" element={<ErrorPage type="clone-not-live" />} />
    <Route path="*" element={<ErrorPage type="not-found" />} />
  </>
);

const App = () => (
  <Routes>
    <Route path="/chat/:slug" element={<ChatPage />} />
    {dashboardRoutes}
    <Route
      path="*"
      element={
        <LocomotiveRoot>
          <Routes>{marketingRoutes}</Routes>
        </LocomotiveRoot>
      }
    />
  </Routes>
);

export default App;
