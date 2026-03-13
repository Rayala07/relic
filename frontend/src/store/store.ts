/**
 * store/store.ts
 *
 * Central Redux store for the Relic application.
 *
 * Redux Toolkit's `configureStore` automatically sets up:
 *  - Redux DevTools Extension support (for debugging in browser)
 *  - Thunk middleware (for async actions if needed later)
 *  - Immutability checks in development mode
 *
 * Currently contains:
 *  - landingReducer → manages UI state for the landing page (navbar, sections)
 */

import { configureStore } from "@reduxjs/toolkit";
import landingReducer from "@/landing/reduxSlice/landingSlice";

export const store = configureStore({
  reducer: {
    // The "landing" slice handles all landing page UI state
    landing: landingReducer,
  },
});

// -------------------------------------------------------------------------
// TypeScript types derived from the store itself.
// These are used throughout the app for type-safe Redux hooks.
// -------------------------------------------------------------------------

/** RootState: The complete shape of the Redux store's state */
export type RootState = ReturnType<typeof store.getState>;

/** AppDispatch: The type of the dispatch function (supports thunks) */
export type AppDispatch = typeof store.dispatch;
