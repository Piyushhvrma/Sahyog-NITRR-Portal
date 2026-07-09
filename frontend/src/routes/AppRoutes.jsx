// frontend/src/routes/AppRoutes.jsx
// SAHYOG 2.0 Route Configuration
// --------------------------------
// Earlier, all routes were written directly inside App.jsx.
// Now routes are separated here to keep App.jsx clean.
//
// Benefit:
// - App.jsx handles layout only.
// - AppRoutes.jsx handles routing only.
// - Later we can easily add RBAC routes, admin routes,
//   socket rooms, study room routes, CR election routes, etc.

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../pages/ProtectedRoute.jsx";
import PublicOnlyRoute from "../pages/PublicOnlyRoute.jsx";

import Home from "../pages/Home.jsx";
import BranchPage from "../pages/BranchPage.jsx";
import SemesterPage from "../pages/SemesterPage.jsx";
import Viewer from "../pages/Viewer.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";

import SignupPage from "../pages/SignupPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";

import BloodRequestPage from "../pages/BloodRequestPage.jsx";
import EmergencyBloodRequestPage from "../pages/EmergencyBloodRequestPage.jsx";
import ComingSoon from "../pages/ComingSoon.jsx";
import HelpPage from "../pages/HelpPage.jsx";
import AIHelpPage from "../pages/AIHelpPage.jsx";
import SahyogSupportPage from "../pages/SahyogSupportPage.jsx";
import EventsPage from "../pages/EventsPage.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import AdminPage from "../pages/AdminPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ========================= */}
      {/* FULLY PUBLIC ROUTES */}
      {/* ========================= */}
      {/* These routes can be opened without login. */}

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

      {/* ========================= */}
      {/* PUBLIC ONLY ROUTES */}
      {/* ========================= */}
      {/* Logged-in users should not visit login/signup again. */}

      <Route element={<PublicOnlyRoute />}>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ========================= */}
      {/* PROTECTED ROUTES */}
      {/* ========================= */}
      {/* These routes require login. */}

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/branch/:year" element={<BranchPage />} />
        <Route path="/semester/:year/:branch" element={<SemesterPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        <Route
          path="/viewer/:year/:branch/:semester"
          element={<Viewer />}
        />

        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* ========================= */}
      {/* FALLBACK ROUTE */}
      {/* ========================= */}
      {/* Any unknown URL redirects to home. */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}