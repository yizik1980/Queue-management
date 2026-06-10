import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../signals/store';

const navItems = [
  { to: '/',             label: 'דשבורד',   icon: '📊', end: true },
  { to: '/appointments', label: 'תורים',    icon: '📅', end: false },
  { to: '/clients',      label: 'לקוחות',   icon: '👥', end: false },
  { to: '/settings',     label: 'הגדרות',   icon: '⚙️', end: false },
];

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-ink flex flex-col py-6 px-3 gap-2">
        {/* Logo */}
        <div className="px-2 mb-4 text-center">
          <div className="text-4xl mb-1">✂️</div>
          <h1 className="font-sketch text-2xl text-amber leading-tight">מנהל תורים</h1>
          <span className="text-white/40 text-xs">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="text-lg">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          className="nav-link text-crimson/80 hover:text-crimson hover:bg-crimson/10 mt-2 border-0 bg-transparent w-full text-right"
          onClick={handleLogout}
        >
          <span className="text-lg">🚪</span>
          יציאה
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
