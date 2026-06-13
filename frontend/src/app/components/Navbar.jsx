import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "../../features/auth/components/AuthProvider";
import { Search } from "lucide-react";
import { ModeToggle } from "../../components/ModeToggle";
import { motion } from "motion/react";

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
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

  // Global keyboard shortcuts for navigation
  useEffect(() => {
    if (!user) return; // only active when logged in

    const handleShortcut = (e) => {
      const isMod = e.metaKey || e.ctrlKey; // CMD on Mac, CTRL on Windows
      if (!isMod) return;

      const tag = document.activeElement?.tagName.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable;

      // CMD/CTRL + K → Search
      // Block browser's address bar/search trigger first, then navigate
      if (e.key === "k") {
        e.preventDefault(); // Must be called before any async work
        e.stopPropagation();
        navigate("/search");
        return;
      }

      // CMD/CTRL + S → Save
      // Block browser's "Save Page As" dialog, then navigate
      // Exception: allow normal behavior inside text inputs so forms work
      if (e.key === "s") {
        if (!isTyping) {
          e.preventDefault(); // Must be called before any async work
          e.stopPropagation();
          navigate("/save");
        }
        return;
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [user, navigate]);

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
    { name: "SAVE", path: "/save", hint: "⌘S" },
  ];

  const triggerLogout = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    await signOut();
  };

  const isLinkActive = (link) =>
    link.path === "/" ? pathname === "/" : pathname.startsWith(link.path);

  return (
    <div ref={menuRef} className="relative z-50">
      {/* ── NAVBAR BAR ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 h-[72px] bg-background border-b border-border z-50 flex items-center justify-between px-6 w-full box-border font-sans">
        
        {/* LEFT: Branding — never shrinks */}
        <div className="shrink-0 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <img
              src="/Relic_logo.png"
              alt="Relic logo"
              className="w-6 h-6 object-contain opacity-80"
            />
            <span className="text-foreground text-base tracking-[0.1em] font-heading font-bold uppercase whitespace-nowrap">
              RELIC
            </span>
          </Link>
        </div>

        {/* CENTER: Desktop nav links — hidden below 1024px */}
        {isLoaded && user && (
          <div 
            className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 shrink min-w-0 overflow-hidden"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              const isTarget = hoveredLink ? hoveredLink === link.path : active;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onMouseEnter={() => setHoveredLink(link.path)}
                  className={`relative px-4 py-2 rounded-md text-[11px] tracking-[0.08em] uppercase no-underline whitespace-nowrap shrink-0 transition-colors duration-300 z-10 ${
                    active 
                      ? isTarget ? 'text-background font-medium' : 'text-foreground font-medium'
                      : isTarget ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isTarget && (
                    <motion.div
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-md -z-10 ${active ? 'bg-foreground' : 'bg-foreground/10'}`}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* RIGHT: Profile + hamburger — never shrinks */}
        <div className="shrink-0 flex items-center gap-3">

          {/* Search Trigger Placeholder */}
          {isLoaded && user && (
            <Link
              to="/search"
              className="hidden sm:flex items-center gap-12 px-3 py-1.5 rounded-md bg-background border border-border text-muted-foreground no-underline text-xs transition-colors hover:border-muted-foreground hover:text-foreground"
            >
              <span>Search <span className="opacity-60">(CMD/CTRL + K)</span></span>
              <Search size={14} />
            </Link>
          )}

          {isLoaded && user && (
            <ModeToggle />
          )}

          {/* Hamburger — only visible below 1024px */}
          {isLoaded && user && (
            <button
              className="lg:hidden flex flex-col gap-1 items-center justify-center p-2 bg-transparent border-none cursor-pointer"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              <span className={`block w-[18px] h-[1px] bg-foreground transition-all duration-200 ${menuOpen ? 'translate-y-[5px] rotate-45' : ''}`} />
              <span className={`block w-[18px] h-[1px] bg-foreground transition-all duration-200 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-[18px] h-[1px] bg-foreground transition-all duration-200 ${menuOpen ? '-translate-y-[5px] -rotate-45' : ''}`} />
            </button>
          )}

          {/* Profile circle & dropdown */}
          <div className="relative flex items-center" ref={dropdownRef}>
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-transparent border border-transparent" />
            ) : !user ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-[11px] tracking-[0.08em] uppercase no-underline transition-colors text-muted-foreground hover:text-foreground">
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="bg-foreground text-background px-4 py-2 text-[11px] tracking-[0.08em] font-medium uppercase no-underline transition-colors whitespace-nowrap hover:bg-accent"
                >
                  SIGN UP
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center cursor-pointer outline-none shrink-0"
                >
                  <span className="text-muted-foreground text-[11px] tracking-[0.08em] uppercase">
                    {initials}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-10 right-0 mt-2 bg-background border border-border py-2 min-w-[120px] flex flex-col z-[60] rounded-none">
                    <button
                      onClick={triggerLogout}
                      className="w-full text-left px-4 py-2 text-[11px] tracking-[0.08em] uppercase text-muted-foreground bg-transparent border-none cursor-pointer transition-colors hover:text-foreground hover:bg-accent"
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
        <div className="fixed top-[72px] left-0 right-0 bg-background border-b border-border z-[49] px-6">
          {navLinks.map((link, idx) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block py-4 text-[11px] tracking-[0.08em] uppercase no-underline transition-colors ${idx < navLinks.length - 1 ? 'border-b border-border' : ''} ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="flex items-center justify-between py-4">
            <span className="text-[11px] tracking-[0.08em] uppercase text-muted-foreground">THEME</span>
            <ModeToggle />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
