import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const withGuest = (WrappedComponent) => {
  return (props) => {
    const { user, isAuthLoading } = useAuth();

    if (isAuthLoading) {
      // Do not flash anything during login state check as requested
      return null;
    }

    if (user) {
      return <Navigate to="/" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withGuest;
