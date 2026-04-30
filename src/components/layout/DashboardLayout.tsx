import { ReactNode, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { Button } from '@/components/core/button';
import {
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  GitPullRequest,
  Search,
  UserCircle,
  ClipboardList,
  ListChecks
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useStore();

  // Role-based navigation
  const navigation = useMemo(() => {
    const user = auth.user;

    // Employee navigation (role === 'EMPLOYEE')
    if (user && user.role === 'EMPLOYEE') {
      return [
        { name: 'Dashboard', href: '/employee/dashboard', icon: BarChart3 },
        { name: 'Browse Jobs', href: '/employee/search', icon: Search },
        { name: 'My Applications', href: '/employee/applications', icon: ClipboardList },
        { name: 'My Profile', href: '/employee/profile', icon: UserCircle },
      ];
    }

    // Admin/TMG/Manager/HR navigation
    return [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
      { name: 'Requirements', href: '/requirements', icon: FileText },
      { name: 'Applications', href: '/applications', icon: GitPullRequest },
      { name: 'Pipeline', href: '/applications/pipeline', icon: GitPullRequest },
      { name: 'AI Screening', href: '/applications/ai-ranking', icon: BarChart3 },
      { name: 'App Tracking', href: '/employee/my-applications', icon: ListChecks },
      { name: 'Resources', href: '/resources', icon: Briefcase },
      { name: 'User Management', href: '/users', icon: Users },
      { name: 'Settings', href: '/settings', icon: Settings },
    ];
  }, [auth.user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">XOR-ATS</h1>
              <p className="text-xs text-sidebar-foreground/70">ATS Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {auth.user?.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {auth.user?.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {auth.user?.role}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
