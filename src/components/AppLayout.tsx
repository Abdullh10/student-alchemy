import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  FileText,
  Settings as SettingsIcon,
  Menu,
  X,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalSearch } from "@/components/GlobalSearch";

const navItems = [
  { title: "لوحة التحكم", url: "/", icon: LayoutDashboard },
  { title: "الشعب والطلاب", url: "/classes", icon: Users },
  { title: "الشارات", url: "/badges", icon: Award },
  { title: "التقارير", url: "/reports", icon: FileText },
  { title: "إعدادات التقييم", url: "/settings", icon: SettingsIcon },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const activeTitle = navItems.find((n) => n.url === location.pathname)?.title
    ?? (location.pathname.startsWith("/students/") ? "ملف الطالب" : location.pathname.startsWith("/classes/") ? "كشف المتابعة" : "");

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 right-0 z-50 h-screen w-64 gradient-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 print:hidden ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 p-5 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-sidebar-foreground truncate">كشف المتابعة الذكي</h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.school || "منصة المعلم"}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden mr-auto text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Link to="/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{(profile?.full_name || "م").slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{profile?.full_name || "المعلم"}</p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate">{profile?.specialization || ""}</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 lg:px-6 print:hidden">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-semibold text-foreground">{activeTitle}</h2>
          <div className="flex-1" />
          <GlobalSearch />
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
