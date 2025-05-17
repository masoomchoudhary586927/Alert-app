import React from "react";
import { useRoutes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/authContext";

import Login from "./components/auth/login";
import Register from "./components/auth/register";
import StaffLogin from "./components/auth/Staff_Login/StaffLogin";
import EmergencyAlert from "./Pages/Main/EmergencyAlert";
import AboutPage from "./Pages/AboutPage/AboutPage";
import NewsPage from "./Pages/News/News";
import TeamPage from "./Pages/TeamPage/TeamPage";
import ContactPage from "./Pages/Contact/Contact";
import PersonProfile from "./Pages/PersonProfile/PersonProfile";
import PoliceDashboard from "./Pages/Staff-Pages/PolicePage";
import FireBrigadeDashboard from "./Pages/Staff-Pages/FireBrigadePage";
import AmbulancePage from "./Pages/Staff-Pages/AmbulancePage";
import DisasterDashboard from "./Pages/Staff-Pages/DisasterPage";
import AdminDashboard from "./Pages/Staff-Pages/AdminPage";

import Navbar from "./components/auth/Navbar/Navbar";
import Footer from "./Pages/Footer/Footer";
import ReportStatus from "./Pages/ReportStatus/ReportStatus";


function AppContent() {
  const { currentUser } = useAuth();

  const routesArray = [
    { path: "*", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/staff-Login", element: <StaffLogin /> },
    { path: "/home", element: <EmergencyAlert /> },
    { path: "/about", element: <AboutPage /> },
    { path: "/news", element: <NewsPage /> },
    { path: "/team", element: <TeamPage /> },
    { path: "/contact", element: <ContactPage /> },
    { path: "/profile", element: <PersonProfile /> },
    { path: "/police-dashboard", element: <PoliceDashboard /> },
    { path: "/fire-brigade-dashboard", element: <FireBrigadeDashboard /> },
    { path: "/ambulance-dashboard", element: <AmbulancePage /> },
    { path: "/disaster-dashboard", element: <DisasterDashboard /> },
    { path: "/admin-dashboard", element: <AdminDashboard /> },
    { path: "/reportstatus",element :<ReportStatus/>}
  ];

  const routesElement = useRoutes(routesArray);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {currentUser && <Navbar />}
      <main className="flex-grow">{routesElement}</main>
      {currentUser && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
