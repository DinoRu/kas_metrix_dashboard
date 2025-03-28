import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Home from './components/Home';
import DownloadPage from './components/DownloadApk';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateUser from './components/Create';
import EditUserPage from './components/EditUserPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/downloadapk" element={<DownloadPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateUser />} />
        <Route path="/edit-user/:userId" element={<EditUserPage />} />
      </Routes>
    </Router>
  );
}

export default App;
