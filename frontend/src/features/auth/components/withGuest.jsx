import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const withGuest = (WrappedComponent) => {
  return (props) => {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
      // Do not flash anything during login state check as requested
      return null;
    }

    if (isSignedIn) {
      return <Navigate to="/" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withGuest;
