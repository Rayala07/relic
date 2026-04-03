import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/auth.service";
import { useDispatch } from "react-redux";
import { setUser, clearAuth } from "../authSlice";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { user } = useAuth();
    const dispatch = useDispatch();
    const [isChecking, setIsChecking] = useState(!user);

    useEffect(() => {
      let mounted = true;
      const verifySession = async () => {
        if (!user) {
          try {
            const response = await authService.getMe();
            if (mounted && response.success && response.user) {
              dispatch(setUser(response.user));
            } else {
              dispatch(clearAuth());
            }
          } catch (err) {
            if (mounted) {
              dispatch(clearAuth());
            }
          } finally {
            if (mounted) {
              setIsChecking(false);
            }
          }
        } else {
           setIsChecking(false);
        }
      };
      
      verifySession();
      
      return () => { mounted = false; };
    }, [user, dispatch]);

    if (isChecking) {
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
