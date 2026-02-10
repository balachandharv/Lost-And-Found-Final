import React from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ReportProvider } from "./context/ReportContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

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
import Notifications from "./pages/Notifications";

// Support Pages
import HelpCenter from "./pages/HelpCenter";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Security from "./pages/Security";
import Accessibility from "./pages/Accessibility";
import Sitemap from "./pages/Sitemap";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes - Anyone can access */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/items" element={<ItemsFeed />} />
        <Route path="/item/:id" element={<ItemDetails />} />

        {/* Protected Routes - Login Required */}
        <Route path="/report-lost" element={
          <ProtectedRoute>
            <ReportLost />
          </ProtectedRoute>
        } />
        <Route path="/report-found" element={
          <ProtectedRoute>
            <ReportFound />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        {/* Admin Only Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-authority" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminAuthority />
          </ProtectedRoute>
        } />

        {/* Support Routes - Public */}
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/guidelines" element={<CommunityGuidelines />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/security" element={<Security />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/sitemap" element={<Sitemap />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();

  // Hide navbar and footer on authentication pages
  const authPages = ['/login', '/verify-email', '/admin-login'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <AnimatedRoutes />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </ReportProvider>
    </AuthProvider>
  );
}

export default App;
