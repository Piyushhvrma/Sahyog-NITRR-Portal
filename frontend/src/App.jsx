// frontend/src/App.jsx
// SAHYOG 2.0 App Layout
// ----------------------
// App.jsx should not contain heavy route logic now.
// It only controls common layout:
//
// Navbar
// Page container
// AppRoutes
// Footer

import React from "react";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <div className="app-wrapper">
      <Navbar />

      <main className="page-container">
        <AppRoutes />
      </main>

      <Footer />
    </div>
  );
}