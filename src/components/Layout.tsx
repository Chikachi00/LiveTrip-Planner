import { CalendarDays, GitCompare, LayoutDashboard, Plus } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new", label: "新建计划", icon: Plus },
  { to: "/compare", label: "比较", icon: GitCompare },
];

export const Layout = () => {
  return (
    <div className="min-h-screen bg-cloud text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
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

          <nav className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-white text-ink shadow-sm"
                        : "text-slate-500 hover:text-ink",
                    ].join(" ")
                  }
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
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
