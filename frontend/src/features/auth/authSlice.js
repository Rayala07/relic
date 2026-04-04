import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
      state.isAuthLoading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.isAuthLoading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isAuthLoading = false;
    },
    setAuthLoading: (state, action) => {
      state.isAuthLoading = action.payload;
    },
  },
});

export const { setUser, setLoading, setError, clearAuth, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;
