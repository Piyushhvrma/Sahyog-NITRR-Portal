import React from "react";
import { Link, useParams } from "react-router-dom";

const ComingSoon = () => {
  const { featureName } = useParams();

  const formatFeatureName = (name) => {
    if (!name) return "This Feature";

    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">🚀</div>

        <h1>{formatFeatureName(featureName)}</h1>

        <h2>Feature Coming Soon</h2>

        <p>
          This module is currently under development. We are working to make
          this feature useful, smooth, and student-friendly for the SAHYOG
          community.
        </p>

        <p className="stay-tuned-text">
          Stay tuned! This feature will be available soon.
        </p>

        <Link to="/" className="coming-soon-btn">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;