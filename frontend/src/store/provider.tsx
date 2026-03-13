/**
 * store/provider.tsx
 *
 * Redux Provider wrapper component.
 *
 * Next.js App Router renders the `layout.tsx` on the server by default.
 * However, the Redux <Provider> requires client-side React context.
 * This component is marked "use client" so it runs in the browser,
 * and wraps the entire app tree with the Redux store.
 *
 * Usage: Import and wrap your root layout children with <ReduxProvider>.
 */

"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ReactNode } from "react";

/** Props for the ReduxProvider component */
interface ReduxProviderProps {
  /** The child components that will have access to the Redux store */
  children: ReactNode;
}

/**
 * ReduxProvider
 * Provides the global Redux store to all child components via React context.
 * Any component inside this provider can call `useSelector` and `useDispatch`.
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
