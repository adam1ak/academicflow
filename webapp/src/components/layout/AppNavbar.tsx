import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import LogoutModal from "../ui/LogoutModal";
import { useAuth } from "../../context/AuthContext";
import { tokenStorage } from "../../services/tokenStorage";

import api from "../../api/client"

import { usePlan } from "../../context/PlanContext";
import PlanSelector from "../plan/PlanSelector";
import CreatePlanModal from "../plan/CreatePlanModal";

function AppNavbar() {

  const { setIsLogged } = useAuth()

  const { activePlan, setActivePlanId, refreshPlans } = usePlan()

  const [openMenu, setOpenMenu] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const location = useLocation()

  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [selectorPos, setSelectorPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false)

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Courses", path: "/courses" },
    { label: "Schedule", path: "/schedule" },
    { label: "Analytics", path: "/analytics" },
    { label: "Explore", path: "/explore" },
  ];

  useEffect(() => {
    setOpenMenu(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsSelectorOpen(false)
      }
    }

    if (isSelectorOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSelectorOpen])

  const handleToggleSelector = () => {
    if (!isSelectorOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setSelectorPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setIsSelectorOpen((prev) => !prev)
  };

  const handleLogout = async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken()

      await api.post("/api/v1/logout", {
        refresh_token: refreshToken
      })
    } catch (error) {
      console.error("Backend token revocation failed: ", error)
    } finally {
      tokenStorage.clear()
      setIsLogged(false)
      setIsLoginModalOpen(false)
    }
  }

  return (
    <>
      <LogoutModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onConfirm={handleLogout} />

      <PlanSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        createPlanModal={() => {
          setIsCreatePlanModalOpen(true)
          setIsSelectorOpen(false)
        }}
        position={selectorPos}
        innerRef={dropdownRef}
      />

      {isCreatePlanModalOpen && (
        <CreatePlanModal
          onClose={() => setIsCreatePlanModalOpen(false)}
          onSuccess={ async (newPlanId) => {
            await refreshPlans()

            setActivePlanId(newPlanId)
          }}
        />
      )}

      <header className="bg-surface/95 border-b border-dim backdrop-blur-xl shrink-0">

        <div className="px-6 py-3 flex justify-between items-center ">
          <div className="md:flex gap-3 font-sf items-center">
            <h1 className="text-base tracking-tight font-semibold text-slate-100 cursor-pointer">
              AcademicFlow
            </h1>

            <div aria-hidden="true" className="hidden md:block w-px h-4 bg-white/10 rounded-sm" />

            <nav aria-label="Desktop navigation">
              <ul className="hidden md:flex gap-4">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        className={`text-xs lg:text-sm text-sec px-2.5 py-1 rounded-sm ${isActive ? "nav-active font-medium" : ""
                          } hover:bg-white/5`}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex  items-center gap-4">
            <div className="flex">
              <div
                ref={triggerRef}
                onClick={handleToggleSelector}
                className="flex gap-3 items-center bg-surface-hi text-sec border border-dim px-3 py-1 mr-3 rounded-md cursor-pointer select-none">
                <div 
                  className="w-2 h-2 rounded-full transition-colors duration-200 bg-current"
                  style={{
                      backgroundColor: activePlan?.accent_color
                        ? `var(--color-accent-${activePlan.accent_color})`
                        : "currentColor"
                  }}
                />
                <p className="font-mono text-xs">{activePlan ? activePlan.name : "Select Plan"}</p>
                <div className="text-[9px]">▾</div>
              </div>

              <span className="hidden xl:block bg-surface-hi font-mono text-xs text-sec border border-dim px-3 py-1 mr-3 rounded-md">Fall 2024 · Week 3/12</span>
            </div>

            <button
              type="button"
              aria-label="User profile"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 lg:hover:bg-white/5 lg:px-1.5 lg:py-1 lg:rounded-lg"
            >
              <div className="hidden lg:flex flex-col items-end font-sf">
                <span className="text-xs font-medium text-slate-200">Dr. Alan Turing</span>
                <span className="text-[9px] font-mono text-mut">a.turing@flow.edu</span>
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
              className="md:hidden flex flex-col gap-1"
              onClick={() => setOpenMenu(prev => !prev)}
            >
              {!openMenu ? (
                <>
                  <span className="block w-5 h-[1.5px] bg-sec rounded-sm" />
                  <span className="block w-5 h-[1.5px] bg-sec rounded-sm" />
                  <span className="block w-5 h-[1.5px] bg-sec rounded-sm" />
                </>
              ) : (
                <span className="text-text-primary text-lg font-bold">✕</span>
              )}
            </button>
          </div>
        </div>

        <nav
          id="mobile-nav-menu"
          aria-label="Mobile navigation"
          className={`px-3 border-t border-dim ${openMenu ? "block" : "hidden"}`}>
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setOpenMenu(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full text-left text-sm text-sec px-3 py-2.5 rounded-sm ${isActive ? "nav-active font-medium" : ""
                      } hover:bg-white/5`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
    </>
  );
}

export default AppNavbar;