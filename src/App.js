import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ReportProvider } from "./context/ReportContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import EmailVerification from "./pages/EmailVerification";
import ItemsFeed from "./pages/ItemsFeed";
import ItemDetails from "./pages/ItemDetails";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAuthority from "./pages/AdminAuthority";

// Support Pages
import HelpCenter from "./pages/HelpCenter";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/items" element={<ItemsFeed />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/report-lost" element={<ReportLost />} />
        <Route path="/report-found" element={<ReportFound />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-authority" element={<AdminAuthority />} />

        {/* Support Routes */}
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/guidelines" element={<CommunityGuidelines />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ReportProvider>
    </AuthProvider>
  );
}

export default App;
