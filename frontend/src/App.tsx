import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Layout Components
import Welcome from './components/auth/Welcome';
import AuthPage from './components/auth/AuthPage';
import RoleSelector from './components/auth/RoleSelector';

// Dashboard Components (handle their own internal routing)
import UnionDashboard from './components/union/UnionDashboard';
import ProcessorPortal from './components/processor/ProcessorPortal';
import ConsumerVerification from './components/consumer/ConsumerVerification';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/roles" element={<RoleSelector />} />

        {/* Role Dashboards - each handles its own sub-routing */}
        <Route path="/union/*" element={<UnionDashboard />} />
        <Route path="/processor/*" element={<ProcessorPortal />} />
        <Route path="/consumer/*" element={<ConsumerVerification />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

