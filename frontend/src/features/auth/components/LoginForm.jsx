import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";

const LoginForm = () => {
  const isLoaded = true; // Supabase is always loaded

  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // clear error when typing
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Supabase will automatically redirect back to your app after login
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error("Google Auth Error:", error.message);
    }
  };


  return (
    <div className="w-full flex flex-col gap-6">

      {/* HEADER */}
      <h2
        className="text-muted-foreground uppercase border-b border-border pb-4"
        style={{ fontSize: "11px", letterSpacing: "0.08em" }}
      >
        SIGN IN
      </h2>

      {/* ERROR */}
      {error && (
        <p className="text-destructive uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          {error}
        </p>
      )}

      {/* FORM */}
      <form onSubmit={onSubmit} className="flex flex-col gap-6">

        {/* EMAIL INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="enter your email"
            disabled={loading || !isLoaded}
            className="w-full bg-background text-foreground border-0 border-b border-border focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150 disabled:opacity-50"
            style={{ fontSize: "14px", letterSpacing: "0.01em", borderRadius: 0, color: "var(--foreground)", caretcolor: "var(--foreground)" }}
          />
        </div>

        {/* PASSWORD INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            PASSWORD
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading || !isLoaded}
            className="w-full bg-background text-foreground border-0 border-b border-border focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150 disabled:opacity-50"
            style={{ fontSize: "14px", letterSpacing: "0.01em", borderRadius: 0, color: "var(--foreground)", caretcolor: "var(--foreground)" }}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !isLoaded}
          className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150 cursor-pointer uppercase disabled:opacity-50 disabled:cursor-wait"
          style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px", borderRadius: 0, border: "none", fontWeight: 500 }}
        >
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>
      {/* --- Google Auth Button --- */}
      <div className="w-full flex flex-col gap-6">

        {/* OR DIVIDER */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-border"></div>
          <span
            className="text-xs text-muted-foreground uppercase tracking-wider"
            style={{ fontSize: "10px", letterSpacing: "0.08em" }}
          >
            OR
          </span>
          <div className="flex-1 h-[1px] bg-border"></div>
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          aria-label="Continue with Google"
          disabled={loading || !isLoaded}
          className="w-full h-[40px] px-[12px] flex items-center justify-center gap-[12px] rounded-[4px] border border-[#DADCE0] dark:border-[#8E918F] bg-[#FFFFFF] dark:bg-[#131314] text-[#3C4043] dark:text-[#E3E3E3] hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E1E] active:bg-[#F1F3F4] dark:active:bg-[#282828] transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#131314]"
          style={{ 
            fontFamily: "'Roboto', arial, sans-serif", 
            fontSize: "14px", 
            fontWeight: 500, 
            letterSpacing: "0.25px"
          }}
        >
          {/* Official Google G Logo */}
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Continue with Google
        </button>
      </div>

      {/* FOOTER */}
      <div className="pt-4 mt-2 border-t border-border text-center">
        <Link
          to="/register"
          className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase"
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          DON'T HAVE AN ACCOUNT? SIGN UP →
        </Link>
      </div>

    </div>
  );
};

export default LoginForm;
