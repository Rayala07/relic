import { configureStore } from "@reduxjs/toolkit";

import itemReducer from "../features/items/itemSlice";

const store = configureStore({
  reducer: {
    items: itemReducer,
  },
});

export default store;
