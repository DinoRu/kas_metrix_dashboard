import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Home from './components/Home';
import DownloadPage from './components/DownloadApk';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
// import ChangePassword from './components/ChangePassword';

import { ProtectedRoute } from './components/ProtectedRoutes';
import { AuthProvider } from './context/authContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Groupe des routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/downloadapk" element={<DownloadPage />} />

            {/* Routes spécifiques aux admins */}
            <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>

          {/* <Route path="/change-password" element={<ChangePassword />} /> */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
