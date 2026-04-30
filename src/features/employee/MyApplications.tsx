import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/core/badge';
import { ApplicationStageTracker } from '@/components/ApplicationStageTracker';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/core/card';
import { Button } from '@/components/core/button';
import { Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ExportButton } from '@/components/ExportButton';

export function MyApplications() {
  const { auth, applications, jobRequirements, interviewStages, users, resources } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  if (!auth.user) return null;

  const isAdmin = ['ADMIN', 'HR', 'TMG', 'MANAGER'].includes(auth.user.role);

  // Get applications based on role
  const myApplications = useMemo(() => {
    if (isAdmin && selectedUserId) {
      return applications.filter(app => app.employeeId === selectedUserId);
    }
    if (isAdmin && !selectedUserId) {
      return applications; // Show all for admin
    }
    return applications.filter(app => app.employeeId === auth.user!.id);
  }, [applications, auth.user, isAdmin, selectedUserId]);

  const filteredApplications = useMemo(() => {
    if (selectedFilter === 'ALL') return myApplications;
    if (selectedFilter === 'ACTIVE') {
      return myApplications.filter(app => 
        app.status !== 'REJECTED' && 
        app.status !== 'WITHDRAWN' &&
        app.status !== 'COMPLETED'
      );
    }
    if (selectedFilter === 'CLOSED') {
      return myApplications.filter(app => 
        app.status === 'REJECTED' || 
        app.status === 'WITHDRAWN' ||
        app.status === 'COMPLETED'
      );
    }
    return myApplications;
  }, [myApplications, selectedFilter]);

  const getRequirement = (reqId: string) => {
    return jobRequirements.find(r => r.id === reqId);
  };

  const getMyInterviews = (appId: string) => {
    return interviewStages
      .filter(stage => stage.applicationId === appId)
      .sort((a, b) => a.sequence - b.sequence);
  };

  const stats = {
    total: myApplications.length,
    active: myApplications.filter(app => 
      app.status !== 'REJECTED' && 
      app.status !== 'WITHDRAWN' &&
      app.status !== 'COMPLETED'
    ).length,
    interviews: myApplications.filter(app => 
      app.status.includes('INTERVIEW') || app.status === 'HR_ROUND'
    ).length,
    selected: myApplications.filter(app => 
      app.status === 'SELECTED' || 
      app.status === 'ONBOARDING' ||
      app.status === 'COMPLETED'
    ).length,
  };

  // Get all employees for admin dropdown
  const allEmployees = useMemo(() => {
    const userEmployees = users.map(u => ({ id: u.id, name: u.name, type: 'USER' as const }));
    const resourceEmployees = resources.map(r => ({ id: r.id, name: r.name, type: 'RESOURCE' as const }));
    return [...userEmployees, ...resourceEmployees].sort((a, b) => a.name.localeCompare(b.name));
  }, [users, resources]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isAdmin ? 'Application Tracking' : 'My Applications'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? 'Track all employee/resource applications and their progress'
                : 'Track your application progress and interview stages'
              }
            </p>
          </div>
          {filteredApplications.length > 0 && (
            <ExportButton
              data={filteredApplications.map(app => {
                const req = getRequirement(app.requirementId);
                const employee = users.find(u => u.id === app.employeeId) ||
                                resources.find(r => r.id === app.employeeId);
                return {
                  employeeName: employee?.name || 'Unknown',
                  requirement: req?.title || 'Unknown',
                  location: req?.location || '-',
                  currentStage: app.currentStage,
                  status: app.status,
                  source: app.source,
                  aiScore: app.aiScore ? app.aiScore.toFixed(1) : '-',
                  appliedOn: format(new Date(app.createdAt), 'MMM dd, yyyy'),
                  lastUpdated: format(new Date(app.updatedAt), 'MMM dd, yyyy'),
                };
              })}
              columns={[
                ...(isAdmin ? [{ header: 'Employee', dataKey: 'employeeName', width: 40 }] : []),
                { header: 'Requirement', dataKey: 'requirement', width: 50 },
                { header: 'Location', dataKey: 'location', width: 30 },
                { header: 'Stage', dataKey: 'currentStage', width: 30 },
                { header: 'Status', dataKey: 'status', width: 28 },
                { header: 'Source', dataKey: 'source', width: 25 },
                { header: 'AI Score', dataKey: 'aiScore', width: 22 },
                { header: 'Applied', dataKey: 'appliedOn', width: 28 },
                { header: 'Updated', dataKey: 'lastUpdated', width: 28 },
              ]}
              filename={isAdmin ? 'application-tracking' : 'my-applications'}
              title={isAdmin ? 'Application Tracking Report' : 'My Applications'}
              subtitle={`Total: ${filteredApplications.length} | Active: ${stats.active} | Selected: ${stats.selected}`}
              orientation="landscape"
            />
          )}
        </div>

        {/* Admin: Employee Selector */}
        {isAdmin && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Employee:</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-64 px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Employees</option>
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.type})
                </option>
              ))}
            </select>
            {selectedUserId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserId('')}
              >
                Clear Filter
              </Button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Applications</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold mt-1">{stats.active}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">In Interviews</div>
            <div className="text-2xl font-bold mt-1">{stats.interviews}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Selected/Onboarding</div>
            <div className="text-2xl font-bold mt-1">{stats.selected}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('ALL')}
          >
            All ({myApplications.length})
          </Button>
          <Button
            variant={selectedFilter === 'ACTIVE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('ACTIVE')}
          >
            Active ({stats.active})
          </Button>
          <Button
            variant={selectedFilter === 'CLOSED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('CLOSED')}
          >
            Closed ({myApplications.length - stats.active})
          </Button>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <div>No applications found</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map(app => {
              const req = getRequirement(app.requirementId);
              const interviews = getMyInterviews(app.id);

              return (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {req?.title || 'Unknown Position'}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                          REQ-{app.requirementId.slice(0, 4)} • {req?.projectInfo || ''}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Applied on {format(new Date(app.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <Badge variant={app.source === 'ASSIGNED' ? 'info' : 'secondary'}>
                        {app.source}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ApplicationStageTracker application={app} />
                    
                    {interviews.length > 0 && (
                      <div className="space-y-2 pt-4 border-t">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Interview Schedule
                        </div>
                        {interviews.map((interview, idx) => (
                          <div key={interview.id} className="text-sm pl-6">
                            <div className="flex items-center justify-between">
                              <span>{idx + 1}. {interview.name}</span>
                              <Badge variant={
                                interview.outcome === 'PASS' ? 'success' :
                                interview.outcome === 'FAIL' ? 'destructive' :
                                interview.outcome === 'HOLD' ? 'warning' : 'secondary'
                              } className="text-xs">
                                {interview.outcome}
                              </Badge>
                            </div>
                            {interview.scheduledAt && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(interview.scheduledAt), 'MMM dd, yyyy hh:mm a')}
                                {interview.interviewer && ` • ${interview.interviewer}`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
