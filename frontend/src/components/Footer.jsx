import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-text">
          © {currentYear} SAHYOG Club | Designed by
        </span>

        <a
          href="https://www.linkedin.com/in/piyush-verma-25550728a/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-name"
        >
          Piyush Kumar Verma
        </a>

        <a
          href="https://www.linkedin.com/in/piyush-verma-25550728a/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-linkedin"
          aria-label="LinkedIn Profile"
        >
          in
        </a>
      </div>
    </footer>
  );
};

export default Footer;