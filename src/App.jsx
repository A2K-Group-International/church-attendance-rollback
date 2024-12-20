import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./authentication/ProtectedRoute";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Attendance from "./pages/admin/Attendance";
import UsersPage from "./pages/admin/UserPage";
// import Schedule from "./pages/admin/Schedule";
import AdminRotas from "./pages/admin/AdminRotas";
import AdminCalendar from "./pages/admin/AdminCalendar";
import UserAnnouncements from "./pages/user/UserAnnouncements";
import UserAnnouncementsInfo from "./pages/user/UserAnnouncementsInfo";
import EventsPage from "./pages/user/EventsPage";
import FamilyPage from "./pages/user/FamilyPage";
import EventInfo from "./pages/user/EventInfo";
import VolunteersPage from "./pages/admin/VolunteersPage";
import GroupsPage from "./pages/admin/GroupsPage";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerEvents from "./pages/volunteer/VolunteerEvents";
import VolunteerAnnouncements from "./pages/volunteer/VolunteerAnnouncements";
import VolunteerAnnouncementsInfo from "./pages/volunteer/VolunteerAnnoucementsInfo";
import VolunteerMainCalendar from "./pages/volunteer/VolunteerMainCalendar";
import VolunteerProfile from "./pages/volunteer/VolunteerProfile";
import VolunteerDuties from "./pages/volunteer/VolunteerDuties";
import CategoryPage from "./pages/admin/CategoryPage";
import VolunteerClasses from "./pages/volunteer/VolunteerClasses";
import VolunteerClass from "./pages/volunteer/VolunteerClass";
import VolunteerUpload from "./pages/volunteer/VolunteerUpload";
import VolunteerMeetingPage from "./pages/volunteer/VolunteerMeetingPage";
import VolunteerRequests from "./pages/volunteer/VolunteerRequests";
import { Toaster } from "./shadcn/toaster";
import NewSchedule from "./pages/admin/EventPage";
import EventPage from "./pages/admin/EventPage";
import MeetingPage from "./pages/admin/MeetingPage";
import ParishionerRequest from "./pages/user/ParishionerRequest";
import { useContext } from "react";
import { UserContext } from "./context/UserContext"; // Adjust the import path as necessary
import UniversalSidebar from "./components/UniversalSidebar"; // Adjust the import path as necessary

function AppContent() {
  const { userData } = useContext(UserContext); // Get user role from context
  const location = useLocation(); // Get the current path
  const shouldShowSidebar = location.pathname !== "/";

  return (
    <>
      <Toaster />
      {shouldShowSidebar ? (
        <UniversalSidebar>
          <Routes>
            {/* Add all your routes here */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-rotas"
              element={
                <ProtectedRoute>
                  <AdminRotas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parishioner-request"
              element={
                <ProtectedRoute>
                  <ParishionerRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteers"
              element={
                <ProtectedRoute>
                  <VolunteersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <GroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/event"
              element={
                <ProtectedRoute>
                  <EventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meeting"
              element={
                <ProtectedRoute>
                  <MeetingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-meeting"
              element={
                <ProtectedRoute>
                  <VolunteerMeetingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-calendar"
              element={
                <ProtectedRoute>
                  <AdminCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events-page"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/event-info/:eventId"
              element={
                <ProtectedRoute>
                  <EventInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-announcements"
              element={
                <ProtectedRoute>
                  <UserAnnouncements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/family"
              element={
                <ProtectedRoute>
                  <FamilyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-dashboard"
              element={
                <ProtectedRoute>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-schedule"
              element={
                <ProtectedRoute>
                  <VolunteerEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-announcements"
              element={
                <ProtectedRoute>
                  <VolunteerAnnouncements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-announcements-info/:postId"
              element={
                <ProtectedRoute>
                  <VolunteerAnnouncementsInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-announcements-info/:postId"
              element={
                <ProtectedRoute>
                  <UserAnnouncementsInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-duties"
              element={
                <ProtectedRoute>
                  <VolunteerDuties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-profile"
              element={
                <ProtectedRoute>
                  <VolunteerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-main-calendar"
              element={
                <ProtectedRoute>
                  <VolunteerMainCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-classes"
              element={
                <ProtectedRoute>
                  <VolunteerClasses />
                </ProtectedRoute>
              }
            />
            <Route path="/volunteer-classes/:id" element={<VolunteerClass />} />
            <Route
              path="/volunteer-upload"
              element={
                <ProtectedRoute>
                  <VolunteerUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer-requests"
              element={
                <ProtectedRoute>
                  <VolunteerRequests />
                </ProtectedRoute>
              }
            />
          </Routes>
        </UniversalSidebar>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    // <Router basename="/portal">
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
