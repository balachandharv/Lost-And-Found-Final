import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminAuthority from "./pages/AdminAuthority";

import ItemsFeed from "./pages/ItemsFeed";
import ItemDetails from "./pages/ItemDetails";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import Profile from "./pages/Profile";

import { AuthProvider } from "./context/AuthContext";
import { ReportProvider } from "./context/ReportContext";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<ItemsFeed />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/report-lost" element={<ReportLost />} />
        <Route path="/report-found" element={<ReportFound />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-authority" element={<AdminAuthority />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <BrowserRouter>
          <Navbar />
          <AnimatedRoutes />
        </BrowserRouter>
      </ReportProvider>
    </AuthProvider>
  );
}

export default App;
