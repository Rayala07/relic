import { useDispatch, useSelector } from "react-redux";
import authService from "../services/auth.service";
import { setUser, setLoading, setError, clearAuth } from "../authSlice";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

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
    handleRegister,
    handleLogin,
    handleLogout,
  };
};
