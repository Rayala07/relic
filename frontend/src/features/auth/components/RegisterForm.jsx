import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";

const RegisterForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("SIGN UP");
  const [error, setError] = useState("");
  
  // OTP Verification State
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const onRegister = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setStatusText("CREATING ACCOUNT...");
    setError("");

    try {
      await signUp.create({
        firstName: formData.name,
        emailAddress: formData.email,
        password: formData.password,
      });

      setStatusText("SENDING CODE...");
      // Send the email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Change the UI to show the OTP input
      setPendingVerification(true);
    } catch (err) {
      console.error("Register Error:", err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError("Error creating account");
      }
      setStatusText("SIGN UP");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/");
      } else {
        console.warn("Verify incomplete:", result);
        setError("Verification incomplete. Please check your code.");
      }
    } catch (err) {
      console.error("Verify Error:", err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError("Invalid verification code");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="w-full flex flex-col gap-6">
        <h2 className="text-muted-foreground uppercase border-b border-border pb-4" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          VERIFY EMAIL
        </h2>
        <p className="text-muted-foreground" style={{ fontSize: "14px" }}>
          We sent a verification code to <span className="text-foreground">{formData.email}</span>
        </p>
        
        {error && (
          <p className="text-destructive uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            {error}
          </p>
        )}

        <form onSubmit={onVerify} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              VERIFICATION CODE
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              placeholder="enter 6-digit code"
              disabled={loading}
              className="w-full bg-background text-foreground border-0 border-b border-border focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150 disabled:opacity-50"
              style={{ fontSize: "14px", letterSpacing: "0.01em", borderRadius: 0, color: "var(--foreground)", caretcolor: "var(--foreground)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150 cursor-pointer uppercase disabled:opacity-50 disabled:cursor-wait"
            style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px", borderRadius: 0, border: "none", fontWeight: 500 }}
          >
            {loading ? "VERIFYING..." : "VERIFY EMAIL"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* HEADER */}
      <h2 
        className="text-muted-foreground uppercase border-b border-border pb-4"
        style={{ fontSize: "11px", letterSpacing: "0.08em" }}
      >
        CREATE ACCOUNT
      </h2>

      {/* ERROR */}
      {error && (
        <p className="text-destructive uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          {error}
        </p>
      )}

      {/* FORM */}
      <form onSubmit={onRegister} className="flex flex-col gap-6">
        
        {/* NAME INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            FULL NAME
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="your name"
            disabled={loading || !isLoaded}
            className="w-full bg-background text-foreground border-0 border-b border-border focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150 disabled:opacity-50"
            style={{ fontSize: "14px", letterSpacing: "0.01em", borderRadius: 0, color: "var(--foreground)", caretcolor: "var(--foreground)" }}
          />
        </div>

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
          {statusText}
        </button>
      </form>

      {/* FOOTER */}
      <div className="pt-4 mt-2 border-t border-border text-center">
        <Link
          to="/login"
          className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase"
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          ALREADY HAVE AN ACCOUNT? SIGN IN →
        </Link>
      </div>
      
    </div>
  );
};

export default RegisterForm;
