import {
  Building2,
  CalendarDays,
  GitCompare,
  LayoutDashboard,
  Plus,
  Settings,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Plans", icon: LayoutDashboard },
  { to: "/new", label: "New", icon: Plus },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/venues", label: "Venues", icon: Building2 },
  { to: "/settings", label: "Data", icon: Settings },
];

export const Layout = () => {
  return (
    <div className="min-h-screen bg-cloud text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <CalendarDays size={20} />
            </span>
            <span>
              <span className="block text-base font-semibold leading-tight">
                LiveTrip Planner
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">
                Concert travel decisions, calmer.
              </span>
            </span>
          </NavLink>

          <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-white text-ink shadow-sm"
                        : "text-slate-500 hover:text-ink",
                    ].join(" ")
                  }
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};
