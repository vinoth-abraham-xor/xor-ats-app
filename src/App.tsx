import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { LoginPage } from '@/features/auth/LoginPage';
import { UserManagementPage } from '@/features/users/UserManagementPage';
import { ResourcesPage } from '@/features/resources/ResourcesPage';
import { RequirementsPage } from '@/features/requirements/RequirementsPage';
import { RequirementDetailsPage } from '@/features/requirements/RequirementDetailsPage';
import { ApplicationsPage } from '@/features/applications/ApplicationsPage';
import { CandidatePipelineBoard } from '@/features/applications/CandidatePipelineBoard';
import { AIRankingPage } from '@/features/applications/AIRankingPage';
import { EmployeeDashboard } from '@/features/employee/EmployeeDashboard';
import { SearchRequirements } from '@/features/employee/SearchRequirements';
import { EmployeeProfile } from '@/features/employee/EmployeeProfile';
import { MyApplications } from '@/features/employee/MyApplications';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { NotificationCenter } from '@/features/notifications/NotificationCenter';
import { TMGDashboard } from '@/features/dashboards/TMGDashboard';
import { ManagerDashboard } from '@/features/dashboards/ManagerDashboard';
import { HRDashboard } from '@/features/dashboards/HRDashboard';
import { AuditTrailPage } from '@/features/audit/AuditTrailPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart3, Briefcase, FileText, Users } from 'lucide-react';

function DashboardPage() {
  const { users, resources, jobRequirements } = useStore();

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Resources',
      value: resources.length,
      icon: Briefcase,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Job Requirements',
      value: jobRequirements.length,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Allocations',
      value: resources.filter((r) => r.status === 'ALLOCATED').length,
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to XOR-ATS Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            <p className="text-muted-foreground">No recent activities to display.</p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="font-semibold">
                  {users.filter((u) => u.status === 'ACTIVE').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available Resources</span>
                <span className="font-semibold">
                  {resources.filter((r) => r.status === 'AVAILABLE').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Open Requirements</span>
                <span className="font-semibold">
                  {jobRequirements.filter((r) => r.status === 'OPEN').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { auth } = useStore();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If route requires admin but user is employee, redirect to employee dashboard
  if (adminOnly && auth.user?.role === 'EMPLOYEE') {
    return <Navigate to="/employee/dashboard" />;
  }

  // If employee tries to access admin route, redirect
  if (auth.user?.role === 'EMPLOYEE' && !location.pathname.startsWith('/employee')) {
    return <Navigate to="/employee/dashboard" />;
  }

  return <>{children}</>;
}

function EmployeeRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useStore();

  if (!auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If admin (non-employee) tries to access employee routes, redirect to admin dashboard
  if (auth.user?.role && auth.user.role !== 'EMPLOYEE') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function App() {
  const basename = import.meta.env.PROD ? '/xor-ats-app' : '/';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute adminOnly>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute adminOnly>
              <UserManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <PrivateRoute adminOnly>
              <ResourcesPage />
            </PrivateRoute>
          }
        />
        {/* Redirect old bench route to new resources route */}
        <Route path="/bench" element={<Navigate to="/resources" replace />} />
        <Route
          path="/requirements"
          element={
            <PrivateRoute adminOnly>
              <RequirementsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/requirements/:id"
          element={
            <PrivateRoute adminOnly>
              <RequirementDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <PrivateRoute adminOnly>
              <ApplicationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/applications/pipeline"
          element={
            <PrivateRoute adminOnly>
              <CandidatePipelineBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/applications/ai-ranking"
          element={
            <PrivateRoute adminOnly>
              <AIRankingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee/dashboard"
          element={
            <EmployeeRoute>
              <EmployeeDashboard />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/search"
          element={
            <EmployeeRoute>
              <SearchRequirements />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <EmployeeRoute>
              <EmployeeProfile />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/applications"
          element={
            <EmployeeRoute>
              <MyApplications />
            </EmployeeRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute adminOnly>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute adminOnly>
              <NotificationCenter />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/tmg"
          element={
            <PrivateRoute adminOnly>
              <TMGDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <PrivateRoute adminOnly>
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/hr"
          element={
            <PrivateRoute adminOnly>
              <HRDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <PrivateRoute adminOnly>
              <AuditTrailPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
