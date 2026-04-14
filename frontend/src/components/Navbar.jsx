import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/",        label: "Home"          },
  { to: "/planner", label: "Route Planner" },
  { to: "/admin",   label: "Admin"         },
];

function Navbar() {
  const location = useLocation();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-14 max-sm:px-6
        bg-rail-bg/75 backdrop-blur-xl border-b border-white/6 transition-colors duration-300"
    >
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 no-underline opacity-100 hover:opacity-80 transition-opacity">
        <div className="w-[40px] h-[40px] rounded-xl shrink-0 flex items-center justify-center
          bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] shadow-lg shadow-blue-700/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
            fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 15h10v4H7z"/>
            <path d="m5 5 2 2h10l2-2"/>
            <path d="M9 21v-2"/><path d="M15 21v-2"/>
            <path d="m5 7-2 10"/><path d="m19 7 2 10"/>
          </svg>
        </div>
        <span className="font-display font-black italic text-2xl text-white tracking-tight">RailRoute</span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1.5">
        {links.map(({ to, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={`px-5 py-2 rounded-full text-[15px] font-medium no-underline tracking-wide transition-all whitespace-nowrap
                ${active
                  ? "text-white bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] shadow-lg shadow-blue-700/40 hover:brightness-110"
                  : "text-rail-muted hover:text-rail-text hover:bg-white/7"
                }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right badge */}
      <div className="flex items-center gap-3 max-sm:hidden">
        <div className="w-px h-5 bg-white/8" />
        <span className="flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase text-rail-dim">
          <span className="pill-dot w-2 h-2 rounded-full bg-rail-success" />
          v4.0.8 Live
        </span>
      </div>
    </nav>
  );
}

export default Navbar;