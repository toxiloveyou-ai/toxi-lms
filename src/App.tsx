import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Layout
import EduLogin from './pages/edu/EduLogin';
import EduLayout from './components/edu/EduLayout';
import EduGuard from './components/auth/EduGuard';
import EduVerify from './pages/edu/EduVerify';
import LandingPage from './pages/public/LandingPage';
import CoursesPage from './pages/public/CoursesPage';
import AboutChinesePage from './pages/public/AboutChinesePage';
import MethodPage from './pages/public/MethodPage';

// Student Pages
import EduOverview from './pages/edu/EduOverview';
import EduDashboard from './pages/edu/EduDashboard';
import EduClassroom from './pages/edu/EduClassroom';
import EduLibrary from './pages/edu/EduLibrary';
import EduLesson from './pages/edu/EduLesson';
import EduPractice from './pages/edu/EduPractice';
import EduProfile from './pages/edu/EduProfile';
import EduExplore from './pages/edu/EduExplore';
import EduReferral from './pages/edu/EduReferral';
import EduCertificateView from './pages/edu/EduCertificateView';

// Learning Logic
import EduLessonPlayer from './pages/edu/EduLessonPlayer';
import EduLearn from './pages/edu/EduLearn';
import EduHomework from './pages/edu/EduHomework';
import EduExamRoom from './pages/edu/EduExamRoom';

// Teacher & Admin
import EduTeacher from './pages/edu/EduTeacher';
import EduTeacherDashboard from './pages/edu/EduTeacherDashboard';
import EduAdminWorkspace from './pages/edu/admin/EduAdminWorkspace';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/edu/login" element={<EduLogin />} />
        <Route path="/login" element={<Navigate to="/edu/login" replace />} />
        <Route path="/verify/:code" element={<EduVerify />} />

        {/* Protected Edu System */}
        <Route element={<EduGuard />}>
          <Route path="/edu" element={<EduLayout />}>
            <Route index element={<Navigate to="/edu/overview" replace />} />
            <Route path="overview" element={<EduOverview />} />
            <Route path="dashboard" element={<EduDashboard />} />
            <Route path="classroom/:classId" element={<EduClassroom />} />
            <Route path="library" element={<EduLibrary />} />
            <Route path="lesson/:id" element={<EduLesson />} />
            <Route path="practice" element={<EduPractice />} />
            <Route path="profile" element={<EduProfile />} />
            <Route path="explore" element={<EduExplore />} />
            <Route path="referral" element={<EduReferral />} />
            <Route path="teacher/:id" element={<EduTeacher />} />
            <Route path="management" element={<EduTeacherDashboard />} />
            <Route path="course/:courseId/lesson/:lessonId" element={<EduLessonPlayer />} />
            <Route path="course/:id/learn" element={<EduLearn />} />
            <Route path="homework/:id" element={<EduHomework />} />
            <Route path="course/:courseId/exam" element={<EduExamRoom />} />
            <Route path="certificate/:certId" element={<EduCertificateView />} />
          </Route>

          {/* Admin/Teacher Workspace */}
          <Route path="/edu/admin" element={<EduAdminWorkspace />} />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/about/chinese" element={<AboutChinesePage />} />
        <Route path="/method" element={<MethodPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
