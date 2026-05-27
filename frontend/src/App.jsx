import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProfilePage from "./pages/ProfilePage.jsx";
import BloodRequestPage from "./pages/BloodRequestPage.jsx";
import EmergencyBloodRequestPage from "./pages/EmergencyBloodRequestPage.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import AIHelpPage from "./pages/AIHelpPage.jsx";
import SahyogSupportPage from "./pages/SahyogSupportPage.jsx";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import PublicOnlyRoute from "./pages/PublicOnlyRoute.jsx";

import Home from "./pages/Home.jsx";
import BranchPage from "./pages/BranchPage.jsx";
import SemesterPage from "./pages/SemesterPage.jsx";
import Viewer from "./pages/Viewer.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";

export default function App() {
  return (
    <div className="app-wrapper">
      <Navbar />

      <main className="page-container">
        <Routes>
          {/* FULLY PUBLIC ROUTES */}
          <Route path="/blood-request" element={<BloodRequestPage />} />
          <Route
            path="/blood-request/emergency"
            element={<EmergencyBloodRequestPage />}
          />
          <Route path="/coming-soon/:featureName" element={<ComingSoon />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/help/ai" element={<AIHelpPage />} />
          <Route path="/help/sahyog" element={<SahyogSupportPage />} />

          {/* PUBLIC ONLY ROUTES */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/branch/:year" element={<BranchPage />} />
            <Route path="/semester/:year/:branch" element={<SemesterPage />} />
            <Route
              path="/viewer/:year/:branch/:semester"
              element={<Viewer />}
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}