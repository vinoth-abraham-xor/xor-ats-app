import { useMemo } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Briefcase, Users, Calendar, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export function ManagerDashboard() {
  const { auth, jobRequirements, applications, resources, interviewStages } = useStore();
  const navigate = useNavigate();

  if (!auth.user) return null;

  // My requirements (created by me)
  const myRequirements = useMemo(() => {
    return jobRequirements.filter(req => req.createdBy === auth.user!.id);
  }, [jobRequirements, auth.user]);

  // Stats for my requirements
  const stats = useMemo(() => ({
    total: myRequirements.length,
    open: myRequirements.filter(r => r.status === 'OPEN').length,
    filled: myRequirements.filter(r => r.status === 'CLOSED_FILLED').length,
    onHold: myRequirements.filter(r => r.status === 'ON_HOLD').length,
  }), [myRequirements]);

  // Candidates by stage (funnel view)
  const candidatesByStage = useMemo(() => {
    const myReqIds = myRequirements.map(r => r.id);
    const myApplications = applications.filter(app => myReqIds.includes(app.requirementId));
    
    return {
      assigned: myApplications.filter(a => a.status === 'ASSIGNED').length,
      applied: myApplications.filter(a => a.status === 'APPLIED').length,
      shortlisted: myApplications.filter(a => a.status === 'SHORTLISTED').length,
      interviewing: myApplications.filter(a => 
        a.status.includes('INTERVIEW') || a.status === 'AI_SCREENING'
      ).length,
      selected: myApplications.filter(a => a.status === 'SELECTED').length,
      rejected: myApplications.filter(a => a.status === 'REJECTED').length,
    };
  }, [myRequirements, applications]);

  // Upcoming interviews
  const upcomingInterviews = useMemo(() => {
    const myReqIds = myRequirements.map(r => r.id);
    const myApplications = applications.filter(app => myReqIds.includes(app.requirementId));
    
    return interviewStages
      .filter(stage => {
        const app = myApplications.find(a => a.id === stage.applicationId);
        return app && stage.outcome === 'PENDING' && stage.scheduledAt;
      })
      .sort((a, b) => {
        const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [myRequirements, applications, interviewStages]);

  // Active requirements
  const activeRequirements = useMemo(() => {
    return myRequirements
      .filter(req => req.status === 'OPEN')
      .map(req => {
        const reqApplications = applications.filter(app => app.requirementId === req.id);
        return {
          requirement: req,
          applicationCount: reqApplications.length,
          selectedCount: reqApplications.filter(a => a.status === 'SELECTED').length,
        };
      })
      .slice(0, 5);
  }, [myRequirements, applications]);

  const getEmployee = (id: string) => {
    return resources.find(r => r.id === id);
  };

  const getApplication = (id: string) => {
    return applications.find(a => a.id === id);
  };

  const getRequirement = (appId: string) => {
    const app = getApplication(appId);
    return app ? jobRequirements.find(r => r.id === app.requirementId) : null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your requirements and hiring pipeline
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">My Requirements</div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">{stats.open} open</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Candidates in Pipeline</div>
                <div className="text-2xl font-bold">{candidatesByStage.interviewing}</div>
                <div className="text-xs text-muted-foreground">active interviews</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Upcoming Interviews</div>
                <div className="text-2xl font-bold">{upcomingInterviews.length}</div>
                <div className="text-xs text-muted-foreground">scheduled</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Selected</div>
                <div className="text-2xl font-bold">{candidatesByStage.selected}</div>
                <div className="text-xs text-muted-foreground">candidates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Funnel */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Candidate Funnel</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Assigned</div>
              <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(candidatesByStage.assigned / Math.max(candidatesByStage.assigned, 1)) * 100}%`, minWidth: '40px' }}
                >
                  {candidatesByStage.assigned}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Applied</div>
              <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(candidatesByStage.applied / Math.max(candidatesByStage.assigned, 1)) * 100}%`, minWidth: '40px' }}
                >
                  {candidatesByStage.applied}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Shortlisted</div>
              <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                <div 
                  className="bg-purple-500 h-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(candidatesByStage.shortlisted / Math.max(candidatesByStage.assigned, 1)) * 100}%`, minWidth: '40px' }}
                >
                  {candidatesByStage.shortlisted}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Interviewing</div>
              <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                <div 
                  className="bg-orange-500 h-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(candidatesByStage.interviewing / Math.max(candidatesByStage.assigned, 1)) * 100}%`, minWidth: '40px' }}
                >
                  {candidatesByStage.interviewing}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Selected</div>
              <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                <div 
                  className="bg-green-500 h-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(candidatesByStage.selected / Math.max(candidatesByStage.assigned, 1)) * 100}%`, minWidth: '40px' }}
                >
                  {candidatesByStage.selected}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Active Requirements */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Requirements</h2>
              <Button size="sm" variant="outline" onClick={() => navigate('/requirements')}>
                View All
              </Button>
            </div>
            {activeRequirements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active requirements
              </div>
            ) : (
              <div className="space-y-3">
                {activeRequirements.map(({ requirement, applicationCount, selectedCount }) => (
                  <div key={requirement.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium">{requirement.title}</div>
                      <Badge variant={requirement.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                        {requirement.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCount} of {requirement.positions} positions filled
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {applicationCount} total applications
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Interviews</h2>
            </div>
            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming interviews
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map(stage => {
                  const app = getApplication(stage.applicationId);
                  const employee = app ? getEmployee(app.employeeId) : null;
                  const req = getRequirement(stage.applicationId);
                  return (
                    <div key={stage.id} className="p-3 bg-muted rounded-lg">
                      <div className="font-medium">{stage.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Candidate: {employee?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        For: {req?.title || 'Unknown'}
                      </div>
                      {stage.scheduledAt && (
                        <div className="text-xs text-blue-600 mt-2">
                          {format(new Date(stage.scheduledAt), 'MMM dd, yyyy hh:mm a')}
                        </div>
                      )}
                      {stage.interviewer && (
                        <div className="text-xs text-muted-foreground">
                          Interviewer: {stage.interviewer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
