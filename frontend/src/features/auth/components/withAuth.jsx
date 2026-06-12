import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Skeleton } from "../../../components/ui/skeleton";

const withAuth = (WrappedComponent, FallbackSkeleton = null) => {
  return (props) => {
    const { isLoaded, user } = useAuth();
    const isSignedIn = !!user;

    if (!isLoaded) {
      if (FallbackSkeleton) {
        return <FallbackSkeleton />;
      }
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
