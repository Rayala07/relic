import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Skeleton } from "../../../components/ui/skeleton";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
      // Show loading pattern using exactly the same Library page loader style
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Skeleton className="h-6 w-24 bg-secondary" style={{ borderRadius: 0 }} />
        </div>
      );
    }

    if (!isSignedIn) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
