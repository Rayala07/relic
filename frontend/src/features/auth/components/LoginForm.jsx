import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LoginForm = () => {
  const { handleLogin, loading, error } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(formData);
    } catch (err) {
      // Error handled natively by Redux/useAuth logic
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER */}
      <h2 
        className="text-[#666666] uppercase border-b border-[#1a1a1a] pb-4"
        style={{ fontSize: "11px", letterSpacing: "0.08em" }}
      >
        SIGN IN
      </h2>

      {/* ERROR */}
      {error && (
        <p className="text-[#ff3333] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          {error}
        </p>
      )}

      {/* FORM */}
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        
        {/* EMAIL INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="enter your email"
            disabled={loading}
            className="w-full bg-[#000000] text-white border-0 border-b border-[#1a1a1a] focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150 disabled:opacity-50"
            style={{ fontSize: "14px", letterSpacing: "0.01em", borderRadius: 0, color: "#ffffff", caretColor: "#ffffff" }}
          />
        </div>

        {/* PASSWORD INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            PASSWORD
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            className="w-full bg-[#000000] text-white border-0 border-b border-[#1a1a1a] focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150 disabled:opacity-50"
            style={{ fontSize: "14px", letterSpacing: "0.01em", borderRadius: 0, color: "#ffffff", caretColor: "#ffffff" }}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-white text-black hover:bg-[#e0e0e0] transition-colors duration-150 cursor-pointer uppercase disabled:opacity-50 disabled:cursor-wait"
          style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px", borderRadius: 0, border: "none", fontWeight: 500 }}
        >
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>

      {/* FOOTER */}
      <div className="pt-4 mt-2 border-t border-[#1a1a1a] text-center">
        <Link
          to="/register"
          className="text-[#666666] hover:text-white transition-colors duration-150 uppercase"
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          DON'T HAVE AN ACCOUNT? SIGN UP →
        </Link>
      </div>
      
    </div>
  );
};

export default LoginForm;
