import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-text">
          © {currentYear} SAHYOG Club, NIT Raipur. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;