import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, isAuthLoading, handleLogout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If on a public auth page, entirely hide the layout navigation wrapper
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : user?.email?.substring(0, 2).toUpperCase() || '??';

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "LIBRARY", path: "/library" },
    { name: "COLLECTIONS", path: "/collections" },
    { name: "SAVE", path: "/save" },
    { name: "SEARCH", path: "/search" },
    { name: "GRAPH", path: "/graph" },
  ];

  const triggerLogout = async () => {
    setDropdownOpen(false);
    await handleLogout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[72px] bg-[#000000] border-b border-[#1a1a1a] z-50 px-6 flex items-center justify-between" style={{ fontFamily: "system-ui, sans-serif" }}>
      
      {/* LEFT: Branding */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <img src="/Relic_logo.png" alt="Relic logo" className="w-[24px] h-[24px] object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-150" />
          <span 
            className="text-white uppercase transition-colors duration-150" 
            style={{ fontSize: "16px", letterSpacing: "0.08em", fontWeight: 600 }}
          >
            Relic
          </span>
        </Link>
      </div>

      {/* CENTER: Navigation Links */}
      <div className="absolute left-[50%] translate-x-[-50%] flex items-center gap-6">
        {!isAuthLoading && user && navLinks.map((link) => {
          const isActive = link.path === "/" ? pathname === "/" : pathname.startsWith(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`uppercase transition-colors duration-150 hover:text-white ${isActive ? "text-white" : "text-[#666666]"}`}
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* RIGHT: Profile & Dropdown */}
      <div className="relative flex items-center min-w-[120px] justify-end" ref={dropdownRef}>
        {isAuthLoading ? (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'transparent',
            border: '1px solid transparent'
          }} />
        ) : !user ? (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[#666666] hover:text-white uppercase transition-colors" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>LOGIN</Link>
            <Link to="/register" className="bg-white text-black px-4 py-[8px] hover:bg-[#e0e0e0] uppercase transition-colors" style={{ fontSize: "11px", letterSpacing: "0.08em", fontWeight: 500 }}>SIGN UP</Link>
          </div>
        ) : (
          <>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-[32px] h-[32px] rounded-full bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center cursor-pointer hover:border-[#333333] transition-colors duration-150 outline-none"
            >
              <span className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                {initials}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-[40px] right-0 mt-2 bg-[#0a0a0a] border border-[#1a1a1a] py-[8px] min-w-[120px] shadow-none flex flex-col z-50" style={{ borderRadius: 0 }}>
                <button
                  onClick={triggerLogout}
                  className="w-full text-left px-4 py-2 uppercase text-[#666666] hover:text-white hover:bg-[#111111] transition-colors duration-150 cursor-pointer outline-none"
                  style={{ fontSize: "11px", letterSpacing: "0.08em", border: "none", background: "transparent" }}
                >
                  LOGOUT
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
