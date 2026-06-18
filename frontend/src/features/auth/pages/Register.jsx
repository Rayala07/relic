import React from 'react';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 relative overflow-hidden">

      {/* Ambient background noise / gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Faint corner accent — top-left */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-120px",
          left: "-120px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Faint corner accent — bottom-right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-120px",
          right: "-120px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Wordmark — top-left anchor */}
      <div
        style={{
          position: "absolute",
          top: "32px",
          left: "40px",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "var(--foreground)",
          opacity: 0.9,
        }}
      >
        RELIC
      </div>

      {/* Tagline — top-right anchor */}
      <div
        style={{
          position: "absolute",
          top: "36px",
          right: "40px",
          fontSize: "10px",
          letterSpacing: "0.08em",
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
        }}
      >
        [ Made to Remember ]
      </div>

      {/* Bordered card wrapping the form */}
      <div
        className="w-full relative z-10"
        style={{
          maxWidth: "480px",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "40px",
          background: "var(--background)",
        }}
      >
        <RegisterForm />
      </div>

    </div>
  );
};

export default Register;