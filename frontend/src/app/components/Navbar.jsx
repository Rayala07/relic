import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { ModeToggle } from "../../components/ModeToggle";

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      // Close hamburger menu if clicking outside of it
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // If on a public auth page, entirely hide the layout navigation wrapper
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const initials = user?.firstName
    ? user.firstName[0].toUpperCase() + (user.lastName ? user.lastName[0].toUpperCase() : "")
    : user?.primaryEmailAddress?.emailAddress?.substring(0, 2).toUpperCase() || '??';

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "LIBRARY", path: "/library" },
    { name: "COLLECTIONS", path: "/collections" },
    { name: "SAVE", path: "/save" },
    { name: "SEARCH", path: "/search" },
  ];

  const triggerLogout = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    await signOut();
  };

  const isLinkActive = (link) =>
    link.path === "/" ? pathname === "/" : pathname.startsWith(link.path);

  const linkStyle = (active) => ({
    fontSize: "11px",
    letterSpacing: "0.08em",
    color: active ? "var(--foreground)" : "var(--muted-foreground)",
    textTransform: "uppercase",
    textDecoration: "none",
    transition: "color 0.15s",
    whiteSpace: "nowrap",
    flexShrink: 0,
  });

  return (
    <div ref={menuRef} style={{ position: "relative", zIndex: 50 }}>
      {/* ── NAVBAR BAR ─────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "72px",
          background: "var(--background)",
          borderBottom: "1px solid var(--border)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          fontFamily: "system-ui, sans-serif",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* LEFT: Branding — never shrinks */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <img
              src="/Relic_logo.png"
              alt="Relic logo"
              style={{ width: 24, height: 24, objectFit: "contain", opacity: 0.8 }}
            />
            <span
              className="relic-logo-text"
              style={{ color: "var(--foreground)", fontSize: "16px", letterSpacing: "0.08em", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              Relic
            </span>
          </Link>
        </div>

        {/* CENTER: Desktop nav links — hidden below 1024px */}
        {isLoaded && user && (
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "24px", flexShrink: 1, minWidth: 0, overflow: "hidden" }}>
            <ModeToggle />
            <div style={{ width: "1px", height: "16px", background: "var(--border)" }}></div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                style={linkStyle(isLinkActive(link))}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isLinkActive(link) ? "var(--foreground)" : "var(--muted-foreground)"; }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* RIGHT: Profile + hamburger — never shrinks */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>

          {/* Hamburger — only visible below 1024px */}
          {isLoaded && user && (
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              style={{
                background: "none",
                border: "none",
                padding: "8px",
                cursor: "pointer",
                display: "none", // shown via CSS below 1024px
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 18,
                  height: 1,
                  background: "var(--foreground)",
                  transition: "transform 0.2s ease, opacity 0.2s ease",
                  transform: menuOpen ? "translateY(5px) rotate(45deg)" : "none",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 18,
                  height: 1,
                  background: "var(--foreground)",
                  transition: "opacity 0.2s ease",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 18,
                  height: 1,
                  background: "var(--foreground)",
                  transition: "transform 0.2s ease, opacity 0.2s ease",
                  transform: menuOpen ? "translateY(-5px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          )}

          {/* Profile circle & dropdown */}
          <div className="profile-area" ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {!isLoaded ? (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "transparent", border: "1px solid transparent" }} />
            ) : !user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Link to="/login" style={linkStyle(false)} onMouseEnter={e => e.currentTarget.style.color="var(--foreground)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted-foreground)"}>LOGIN</Link>
                <Link
                  to="/register"
                  style={{ background: "var(--foreground)", color: "var(--background)", padding: "8px 16px", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 500, textTransform: "uppercase", textDecoration: "none", transition: "background 0.15s", whiteSpace: "nowrap" }}
                  onMouseEnter={e => e.currentTarget.style.background="var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.background="var(--foreground)"}
                >
                  SIGN UP
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--background)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", outline: "none", flexShrink: 0,
                  }}
                >
                  <span style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {initials}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute", top: "40px", right: 0, marginTop: "8px",
                      background: "var(--background)", border: "1px solid var(--border)",
                      paddingTop: "8px", paddingBottom: "8px", minWidth: "120px",
                      display: "flex", flexDirection: "column", zIndex: 60,
                      borderRadius: 0,
                    }}
                  >
                    <button
                      onClick={triggerLogout}
                      style={{
                        width: "100%", textAlign: "left", padding: "8px 16px",
                        fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase",
                        color: "var(--muted-foreground)", background: "transparent", border: "none",
                        cursor: "pointer", transition: "color 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color="var(--foreground)"; e.currentTarget.style.background="var(--accent)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color="var(--muted-foreground)"; e.currentTarget.style.background="transparent"; }}
                    >
                      LOGOUT
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE DROPDOWN PANEL ──────────────────────────────────── */}
      {menuOpen && user && (
        <div
          style={{
            position: "fixed",
            top: "72px",
            left: 0,
            right: 0,
            background: "var(--background)",
            borderBottom: "1px solid var(--border)",
            zIndex: 49,
            padding: "0 24px",
          }}
        >
          {navLinks.map((link, idx) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "16px 0",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: active ? "var(--foreground)" : "var(--muted-foreground)",
                  textDecoration: "none",
                  borderBottom: idx < navLinks.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color="var(--foreground)"}
                onMouseLeave={e => e.currentTarget.style.color= active ? "var(--foreground)" : "var(--muted-foreground)"}
              >
                {link.name}
              </Link>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
            <span style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>THEME</span>
            <ModeToggle />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
