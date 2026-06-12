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
