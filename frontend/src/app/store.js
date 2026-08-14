import { configureStore } from "@reduxjs/toolkit";

import itemReducer from "../features/items/itemSlice";
import uiReducer from "./uiSlice";

const store = configureStore({
  reducer: {
    items: itemReducer,
    ui: uiReducer,
  },
});

export default store;
