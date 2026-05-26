import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function DashboardNavbar() {

  const [openMenu, setOpenMenu] = useState(false)
  const location = useLocation()

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Courses", path: "/courses" },
    { label: "Schedule", path: "/schedule" },
    { label: "Analytics", path: "/analytics" },
    { label: "Explore", path: "/explore" },
  ];

  useEffect(() => {
    setOpenMenu(false);
  }, [location.pathname]);

  return (
    <nav aria-label="Main navigation" className=" bg-surface/95 border-b border-border-dim backdrop-blur-xl shrink-0">
      <div className="px-6 py-3 flex justify-between items-center ">
        <div className="md:flex gap-3 font-sf items-center">
          <span className="text-base tracking-tight font-semibold text-slate-100 cursor-pointer">AcademicFlow</span>

          <div aria-hidden="true" className="hidden md:block w-px h-4 bg-white/10 rounded-sm" />

          <ul className="hidden md:flex gap-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    className={`text-xs lg:text-sm text-text-sec px-2.5 py-1 rounded-sm cursor-pointer ${isActive ? "nav-active font-medium" : ""
                      } hover:bg-white/5`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="lg:hidden bg-surface-hi font-mono text-xs text-text-sec border border-border-dim px-3 py-1 mr-3 rounded-md">Fall 2024 · W3</div>
            <span className="hidden lg:block bg-surface-hi font-mono text-xs text-text-sec border border-border-dim px-3 py-1 mr-3 rounded-md">Fall 2024 · Week 3/12</span>
          </div>

          <button
            type="button"
            aria-label="User profile"
            className="flex items-center gap-2 lg:cursor-pointer lg:hover:bg-white/5 lg:px-1.5 lg:py-1 lg:rounded-lg"
          >

            <div className="hidden lg:flex flex-col items-end font-sf">
              <span className="text-xs text-medium text-slate-200">Dr. Alan Turing</span>
              <span className="text-[9px] font-mono text-text-mut">a.turing@flow.edu</span>
            </div>

            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-avatar cursor-pointer">
              AT
            </div>
          </button>

          <button
            type="button"
            aria-expanded={openMenu}
            aria-controls="mobile-nav-menu"
            aria-label="Toggle navigation menu"
            className="md:hidden flex flex-col gap-1 cursor-pointer"
            onClick={() => setOpenMenu(prev => !prev)}
          >
            {!openMenu ? (
              <>
                <span className="block w-5 h-[1.5px] bg-text-sec rounded-sm" />
                <span className="block w-5 h-[1.5px] bg-text-sec rounded-sm" />
                <span className="block w-5 h-[1.5px] bg-text-sec rounded-sm" />
              </>
            ) : (
              <span className="text-text-primary text-lg font-bold">✕</span>
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav-menu"
        className={`px-3 border-t border-border-dim ${openMenu ? "block" : "hidden"}`}>
        <ul>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenMenu(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full text-left text-sm text-text-sec px-3 py-2.5 rounded-sm cursor-pointer ${isActive ? "nav-active font-medium" : ""
                    } hover:bg-white/5`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default DashboardNavbar;