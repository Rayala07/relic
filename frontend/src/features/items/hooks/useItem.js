import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import itemService from "../services/item.service";
import {
  setCurrentItem,
  setLoading,
  setError,
  clearItemState,
} from "../itemSlice";

/**
 * Custom hook to handle saving items to the backend.
 * Uses Redux to track global loading and error states.
 */
export const useItem = () => {
  const dispatch = useDispatch();
  
  // Pulling global state from Redux
  const { currentItem, loading, error } = useSelector((state) => state.items);

  // Local UI state specifically for the save page flow
  // "idle" | "done" | "error"
  const [pageState, setPageState] = useState("idle");

  /**
   * Clears the current item and resets the UI back to the initial state
   */
  const resetUI = () => {
    dispatch(clearItemState());
    setPageState("idle");
  };

  /**
   * Submits the URL and Title to the backend.
   * The backend returns a response immediately while background tasks (like extraction) run.
   * We do not wait for the background tasks; we just show "done" immediately.
   */
  const handleSaveItem = async ({ url, title }) => {
    // 1. Reset any previous state and mark as loading
    dispatch(clearItemState());
    dispatch(setLoading(true));

    try {
      // 2. Call the API to save the item
      const res = await itemService.save({ url, title });
      
      // 3. Store the newly created item in Redux
      dispatch(setCurrentItem(res.data ?? res));
      
      // 4. Turn off loading and jump straight to the "done" page state
      dispatch(setLoading(false));
      setPageState("done");
    } catch (err) {
      // 5. If it fails, capture the error and show the "error" page state
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      
      dispatch(setError(errorMessage));
      setPageState("error");
    }
  };

  return {
    currentItem,
    loading,
    error,
    pageState,
    handleSaveItem,
    resetUI,
  };
};
