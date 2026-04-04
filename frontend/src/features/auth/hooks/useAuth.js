import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import authService from "../services/auth.service";
import { setUser, setLoading, setError, clearAuth, setAuthLoading } from "../authSlice";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, isAuthLoading } = useSelector((state) => state.auth);
  
  // Track to ensure strict mode doesn't execute twice concurrently
  const hasFetched = useRef(false);

  useEffect(() => {
    if (isAuthLoading && !user && !hasFetched.current) {
      hasFetched.current = true;
      authService.getMe()
        .then((res) => {
          if (res.success && res.user) {
            dispatch(setUser(res.user));
          } else {
            dispatch(clearAuth());
          }
        })
        .catch(() => {
          dispatch(clearAuth());
        })
        .finally(() => {
          dispatch(setAuthLoading(false));
        });
    }
  }, [dispatch, isAuthLoading, user]);

  const handleRegister = async (userData) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.register(userData);
      if (response.success) {
        dispatch(setUser(response.user));
        navigate("/login");
      }
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.login(credentials);
      if (response.success) {
        dispatch(setUser(response.user));
        navigate("/");
      }
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(setLoading(true));
      await authService.logout();
      dispatch(clearAuth());
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
      dispatch(setError("Failed to logout"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    loading,
    error,
    isAuthLoading,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};
