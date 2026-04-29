import { useMemo } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Users, Briefcase, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';

export function TMGDashboard() {
  const { resources, jobRequirements, applications } = useStore();
  const navigate = useNavigate();

  // Resource Stats
  const resourceStats = useMemo(() => ({
    total: resources.length,
    available: resources.filter(r => r.status === 'AVAILABLE').length,
    inInterview: resources.filter(r => r.status === 'IN_INTERVIEW').length,
    allocated: resources.filter(r => r.status === 'ALLOCATED').length,
    utilizationRate: ((resources.length - resources.filter(r => r.status === 'AVAILABLE').length) / resources.length * 100).toFixed(1),
  }), [resources]);

  // Requirement Stats
  const reqStats = useMemo(() => ({
    total: jobRequirements.length,
    open: jobRequirements.filter(r => r.status === 'OPEN').length,
    onHold: jobRequirements.filter(r => r.status === 'ON_HOLD').length,
    closed: jobRequirements.filter(r => r.status === 'CLOSED_FILLED').length,
    urgent: jobRequirements.filter(r => r.priority === 'URGENT' && r.status === 'OPEN').length,
  }), [jobRequirements]);

  // Applications Stats
  const appStats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'ASSIGNED').length,
    active: applications.filter(a => !['REJECTED', 'WITHDRAWN', 'SELECTED'].includes(a.status)).length,
    selected: applications.filter(a => a.status === 'SELECTED').length,
  }), [applications]);

  // Requirements needing assignment
  const requirementsNeedingAssignment = useMemo(() => {
    return jobRequirements.filter(req => {
      if (req.status !== 'OPEN') return false;
      const reqApplications = applications.filter(app => app.requirementId === req.id);
      return reqApplications.length < req.positions;
    }).slice(0, 5);
  }, [jobRequirements, applications]);

  // Hold items requiring review
  const holdItemsForReview = useMemo(() => {
    const SLA_DAYS = 7;
    return jobRequirements.filter(req => {
      if (req.status !== 'ON_HOLD') return false;
      if (!req.reviewDate) return true;
      const daysSinceHold = differenceInDays(new Date(), new Date(req.reviewDate));
      return daysSinceHold >= SLA_DAYS;
    }).slice(0, 5);
  }, [jobRequirements]);

  // Recent applications
  const recentApplications = useMemo(() => {
    return applications
      .filter(app => app.status === 'APPLIED' || app.status === 'ASSIGNED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [applications]);

  const getEmployee = (id: string) => {
    return resources.find(r => r.id === id);
  };

  const getRequirement = (id: string) => {
    return jobRequirements.find(r => r.id === id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">TMG Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Talent Management Overview
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Resources Available</div>
                <div className="text-2xl font-bold">{resourceStats.available}</div>
                <div className="text-xs text-muted-foreground">of {resourceStats.total} total</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Open Requirements</div>
                <div className="text-2xl font-bold">{reqStats.open}</div>
                <div className="text-xs text-destructive">{reqStats.urgent} urgent</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pending Assignments</div>
                <div className="text-2xl font-bold">{appStats.pending}</div>
                <div className="text-xs text-muted-foreground">awaiting action</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Utilization Rate</div>
                <div className="text-2xl font-bold">{resourceStats.utilizationRate}%</div>
                <div className="text-xs text-muted-foreground">{resourceStats.allocated + resourceStats.inInterview} allocated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Requirements Needing Assignment */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Requirements Needing Assignment</h2>
              <Button size="sm" variant="outline" onClick={() => navigate('/requirements')}>
                View All
              </Button>
            </div>
            {requirementsNeedingAssignment.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                All requirements have sufficient candidates
              </div>
            ) : (
              <div className="space-y-3">
                {requirementsNeedingAssignment.map(req => {
                  const appCount = applications.filter(a => a.requirementId === req.id).length;
                  return (
                    <div key={req.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{req.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {appCount} of {req.positions} positions filled
                        </div>
                      </div>
                      <Badge variant={req.priority === 'URGENT' ? 'destructive' : 'warning'}>
                        {req.priority}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hold Items Requiring Review */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Hold Items for Review
              </h2>
            </div>
            {holdItemsForReview.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hold items requiring review
              </div>
            ) : (
              <div className="space-y-3">
                {holdItemsForReview.map(req => (
                  <div key={req.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="font-medium">{req.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Reason: {req.holdReason || 'Not specified'}
                    </div>
                    {req.reviewDate && (
                      <div className="text-xs text-orange-600 mt-1">
                        Review date: {format(new Date(req.reviewDate), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Button size="sm" variant="outline" onClick={() => navigate('/applications')}>
              View All
            </Button>
          </div>
          {recentApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent applications
            </div>
          ) : (
            <div className="space-y-2">
              {recentApplications.map(app => {
                const employee = getEmployee(app.employeeId);
                const req = getRequirement(app.requirementId);
                return (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{employee?.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{req?.title}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={app.source === 'SELF_APPLY' ? 'info' : 'secondary'}>
                        {app.source}
                      </Badge>
                      <Badge variant={app.status === 'ASSIGNED' ? 'warning' : 'info'}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
