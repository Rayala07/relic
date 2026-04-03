import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentItem: null,
  loading: false,
  error: null,
};

const itemSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearItemState: (state) => {
      state.currentItem = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setCurrentItem,
  setLoading,
  setError,
  clearItemState,
} = itemSlice.actions;

export default itemSlice.reducer;
