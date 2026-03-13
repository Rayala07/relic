/**
 * landing/reduxSlice/landingSlice.ts
 *
 * Redux slice for the landing page UI state.
 *
 * A "slice" in Redux Toolkit combines:
 *  - The initial state
 *  - Reducer functions (which handle state updates)
 *  - Action creators (automatically generated from reducer names)
 *
 * This slice tracks:
 *  - `navScrolled`    → Whether the user has scrolled past the top (used to
 *                        show the navbar's glass blur background)
 *  - `activeSection`  → Which section is currently in view (for future use
 *                        e.g. highlighting the active nav link)
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** Shape of the landing page UI state */
interface LandingState {
  /** True when the user has scrolled at least 20px from the top */
  navScrolled: boolean;
  /** ID of the section currently in the viewport (e.g. "hero", "features") */
  activeSection: string;
}

/** Default state — page starts at the top with no active section */
const initialState: LandingState = {
  navScrolled: false,
  activeSection: "hero",
};

const landingSlice = createSlice({
  name: "landing",
  initialState,
  reducers: {
    /**
     * setNavScrolled
     * Called by the Navbar component's scroll event listener.
     * Toggles the glass background on the sticky navbar.
     */
    setNavScrolled(state, action: PayloadAction<boolean>) {
      state.navScrolled = action.payload;
    },

    /**
     * setActiveSection
     * Updated by scroll/intersection observers as the user moves
     * through the page. Can be used to highlight the active nav link.
     */
    setActiveSection(state, action: PayloadAction<string>) {
      state.activeSection = action.payload;
    },
  },
});

// Export the action creators so components can dispatch them
export const { setNavScrolled, setActiveSection } = landingSlice.actions;

// Export the reducer to be registered in the store
export default landingSlice.reducer;
