import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AdminVerify from "./pages/AdminVerify";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import RaiseComplaint from "./pages/RaiseComplaint";
import CustomerProfile from "./pages/CustomerProfile";
import MainLayout from "./layouts/MainLayout";
import SalesLayout from "./layouts/SalesLayout";

import Overview from "./pages/sales/Overview";
import TicketCreation from "./pages/sales/TicketCreation";
import WarrantyTool from "./pages/sales/WarrantyTool";
import LogisticsManager from "./pages/sales/LogisticsManager";
import StatusTracker from "./pages/sales/StatusTracker";

import ServiceLayout from "./layouts/ServiceLayout";
import ServiceDashboard from "./pages/service/ServiceDashboard";
import RecentTickets from "./pages/service/RecentTickets";

import AdminLayout from "./layouts/AdminLayout";
import DashboardOverview from "./pages/admin/DashboardOverview";
import MasterTicketManagement from "./pages/admin/MasterTicketManagement";
import UserManagement from "./pages/admin/UserManagement";
import FinancialOversight from "./pages/admin/FinancialOversight";
import SystemLogs from "./pages/admin/SystemLogs";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Routes>
          {/* Public Home Route - Accessible to everyone */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/admin-verify" element={<AdminVerify />} />

          {/* Customer Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/profile" element={<CustomerProfile />} />
              <Route path="/dashboard/about" element={<About />} />
              <Route path="/dashboard/services" element={<Services />} />
              <Route path="/dashboard/contact" element={<Contact />} />
              <Route path="/dashboard/complaint" element={<RaiseComplaint />} />
            </Route>
          </Route>

          {/* Sales & BD Routes */}
          <Route element={<ProtectedRoute allowedRoles={["sales"]} />}>
            <Route element={<SalesLayout />}>
              <Route path="/sales" element={<Overview />} />
              <Route path="/sales/ticket" element={<TicketCreation />} />
              <Route path="/sales/warranty" element={<WarrantyTool />} />
              <Route path="/sales/logistics" element={<LogisticsManager />} />
              <Route path="/sales/tracker" element={<StatusTracker />} />
            </Route>
          </Route>

          {/* Service & Engineer Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["service_manager", "engineer"]} />
            }
          >
            <Route element={<ServiceLayout />}>
              <Route path="/service" element={<ServiceDashboard />} />
              <Route path="/service/recent" element={<RecentTickets />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<DashboardOverview />} />
              <Route
                path="/admin/tickets"
                element={<MasterTicketManagement />}
              />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/financial" element={<FinancialOversight />} />
              <Route path="/admin/logs" element={<SystemLogs />} />
            </Route>
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
