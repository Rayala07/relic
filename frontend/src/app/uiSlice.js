import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isSaveModalOpen: false,
  },
  reducers: {
    openSaveModal: (state) => {
      state.isSaveModalOpen = true;
    },
    closeSaveModal: (state) => {
      state.isSaveModalOpen = false;
    },
  },
});

export const { openSaveModal, closeSaveModal } = uiSlice.actions;
export default uiSlice.reducer;
