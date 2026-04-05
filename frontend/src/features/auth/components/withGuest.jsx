import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/auth.service";
import { useDispatch } from "react-redux";
import { setUser, clearAuth } from "../authSlice";

const withGuest = (WrappedComponent) => {
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
