import { Outlet, NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { logout } from "../signals/store";
import { settingsApi } from "../services/api";

export default function Layout() {
  const navigate = useNavigate();
  const { adminId } = useParams<{ adminId: string }>();

  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    settingsApi.get().then((s) => setBio(s.bio ?? ""));
  }, []);

  function startEdit() {
    setDraft(bio);
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function saveBio() {
    setSaving(true);
    try {
      await settingsApi.update({ bio: draft });
      setBio(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
  }

  const navItems = [
    { to: `/${adminId}`, label: "דשבורד", icon: "📊", end: true },
    { to: `/${adminId}/appointments`, label: "תורים", icon: "📅", end: false },
    { to: `/${adminId}/clients`, label: "לקוחות", icon: "👥", end: false },
    { to: `/${adminId}/settings`, label: "הגדרות", icon: "⚙️", end: false },
  ];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-ink flex flex-col py-6 px-3 gap-2">
        {/* Logo */}
        <div className="px-2 mb-3 text-center">
          <div className="text-4xl mb-1">✂️</div>
          <h1 className="font-sketch text-2xl text-amber leading-tight">
            מנהל תורים
          </h1>
          <span className="text-white/40 text-xs">Admin Panel</span>
        </div>

        {/* Bio */}
        <div className="mx-1 mb-3 px-3 py-2 rounded border border-white/10 bg-white/5 text-right">
          {editing ? (
            <div className="flex flex-col gap-1.5">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="כמה מילים על העסק שלך..."
                className="w-full bg-transparent text-white/80 text-xs resize-none outline-none placeholder-white/30 leading-relaxed"
                dir="rtl"
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={cancelEdit}
                  className="text-white/40 hover:text-white/70 text-xs transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={saveBio}
                  disabled={saving}
                  className="text-amber hover:text-amber/80 text-xs font-medium transition-colors"
                >
                  {saving ? "..." : "שמור"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-1.5">
              <button
                onClick={startEdit}
                title="ערוך תיאור"
                className="text-white/30 hover:text-white/60 transition-colors mt-0.5 shrink-0 text-xs"
              >
                ✏️
              </button>
              <p
                className="text-white/50 text-xs leading-relaxed flex-1 cursor-pointer hover:text-white/70 transition-colors"
                onClick={startEdit}
                dir="rtl"
              >
                {bio || "הוסף תיאור קצר על העסק שלך..."}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
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

      <main className="flex-1 min-w-0 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
