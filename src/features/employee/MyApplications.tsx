import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/core/badge';
import { ApplicationStageTracker } from '@/components/ApplicationStageTracker';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/core/card';
import { Button } from '@/components/core/button';
import { Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function MyApplications() {
  const { auth, applications, jobRequirements, interviewStages } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  if (!auth.user) return null;

  // Get my applications
  const myApplications = applications.filter(app => app.employeeId === auth.user!.id);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track your application progress and interview stages
          </p>
        </div>

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
