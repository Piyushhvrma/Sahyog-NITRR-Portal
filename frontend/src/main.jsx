import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles.css';
import "./styles2/NotificationPage.css";
import "./styles2/AdminAnnouncement.css";
import "./styles2/ViewerPage.css";
import "./styles2/NavbarNotification.css";
import "./styles2/HelpPages.css";
import "./styles2/BloodRequestPage.css";
import "./styles2/AuthPages.css";
import "./styles2/AboutPage.css";
import "./styles2/RoomsPage.css";
import "./styles2/EventsPage.css";


const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);