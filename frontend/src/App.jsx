import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import SymptomChecker from './pages/SymptomChecker'
import PredictionResult from './pages/PredictionResult'
import Hospitals from './pages/Hospitals'
import Appointments from './pages/Appointments'
import PatientHistory from './pages/PatientHistory'
import ImageUpload from './pages/ImageUpload'
import AdminDashboard from './pages/AdminDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import Reports from './pages/Reports'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import EmergencyHelp from './pages/EmergencyHelp'
import Reminders from './pages/Reminders'
import FamilyProfiles from './pages/FamilyProfiles'
import HealthMeasurements from './pages/HealthMeasurements'
import ReportExplainer from './pages/ReportExplainer'
import GovernmentSchemes from './pages/GovernmentSchemes'
import VideoConsultations from './pages/VideoConsultations'
import OfflineGuide from './pages/OfflineGuide'
import CareTools from './pages/CareTools'
import OfflineStatus from './components/OfflineStatus'

export default function App() {
  const { user } = useAuth()

  return (
    <div className={`app-shell ${user ? 'min-h-screen md:flex' : 'min-h-screen flex flex-col'}`}>
      <OfflineStatus />
      <Navbar />
      <div className="min-w-0 flex-1 flex flex-col">
        {user && (
          <header className="hidden h-[76px] items-center justify-between border-b border-line bg-white/90 px-8 backdrop-blur md:flex">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">Your care workspace</p>
              <p className="mt-1 text-sm font-semibold text-primary">Welcome, {user.full_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-ink/55 lg:block">Here for your health, every step of the way.</span>
              <Link to="/profile" aria-label="View your profile" className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary transition hover:bg-primary/15">
                {user.full_name?.charAt(0)?.toUpperCase()}
              </Link>
            </div>
          </header>
        )}
        <main className="page-enter flex-1">
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/offline-guide" element={<OfflineGuide />} />
            <Route path="/care-tools" element={<ProtectedRoute><CareTools /></ProtectedRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/emergency" element={<ProtectedRoute><EmergencyHelp /></ProtectedRoute>} />
            <Route path="/symptom-checker" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
            <Route path="/prediction-result" element={<ProtectedRoute><PredictionResult /></ProtectedRoute>} />
            <Route path="/hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute roles={['patient']}><PatientHistory /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute roles={['patient']}><ImageUpload /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute roles={['admin', 'doctor']}><Reports /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute roles={['patient']}><Reminders /></ProtectedRoute>} />
            <Route path="/family-profiles" element={<ProtectedRoute roles={['patient']}><FamilyProfiles /></ProtectedRoute>} />
            <Route path="/measurements" element={<ProtectedRoute roles={['patient']}><HealthMeasurements /></ProtectedRoute>} />
            <Route path="/report-explainer" element={<ProtectedRoute roles={['patient']}><ReportExplainer /></ProtectedRoute>} />
            <Route path="/government-schemes" element={<GovernmentSchemes />} />
            <Route path="/consultations" element={<ProtectedRoute roles={['patient', 'doctor']}><VideoConsultations /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
      {user && <Chatbot />}
    </div>
  )
}
