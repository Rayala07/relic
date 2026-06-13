import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../../config/supabaseClient";

const AuthContext = createContext({
  user: null,
  isLoaded: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Fetch initial session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsLoaded(true);
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// To match Clerk's hook naming in components:
export const useUser = () => {
  const { user, isLoaded } = useAuth();
  // Map Supabase user properties to match the Clerk format expected by our UI
  const mappedUser = user ? {
    id: user.id,
    firstName: user.user_metadata?.first_name || user.email?.split("@")[0] || "User",
    lastName: user.user_metadata?.last_name || "",
    primaryEmailAddress: { emailAddress: user.email },
  } : null;

  return { user: mappedUser, isLoaded };
};
