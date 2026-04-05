import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { user, isAuthLoading } = useAuth();

    if (isAuthLoading) {
      // Show loading pattern using exactly the same Library page loader style
      return (
        <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6" style={{ fontFamily: "system-ui, sans-serif" }}>
          <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            LOADING
          </p>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
