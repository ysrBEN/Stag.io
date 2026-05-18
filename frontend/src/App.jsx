import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';

// Layouts
import StudentLayout from './components/StudentLayout';
import CompanyLayout from './components/CompanyLayout';
import AdminLayout from './components/AdminLayout';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import InternshipSearch from './pages/student/InternshipSearch';
import MyApplications from './pages/student/MyApplications';
import StudentProfile from './pages/student/StudentProfile';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import MyOffers from './pages/company/MyOffers';
import Candidates from './pages/company/Candidates';
import CompanyProfile from './pages/company/CompanyProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Validations from './pages/admin/Validations';
import Statistics from './pages/admin/Statistics';
import StudentsTable from './pages/admin/StudentsTable';
import CompaniesTable from './pages/admin/CompaniesTable';
import UserApprovals from './pages/admin/UserApprovals';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import PendingApproval from './pages/auth/PendingApproval';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E3A5F', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ─── Student ─── */}
          <Route path="/student/*" element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="search" element={<InternshipSearch />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* ─── Company ─── */}
          <Route path="/company/*" element={<ProtectedRoute allowedRole="company"><CompanyLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="offers" element={<MyOffers />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="profile" element={<CompanyProfile />} />
          </Route>

          {/* ─── Admin ─── */}
          <Route path="/admin/*" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="approvals" element={<UserApprovals />} />
            <Route path="validations" element={<Validations />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="students" element={<StudentsTable />} />
            <Route path="companies" element={<CompaniesTable />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
