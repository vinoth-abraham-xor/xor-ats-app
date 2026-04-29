import { useMemo } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/core/badge';
import { TrendingUp, Users, Clock, CheckCircle, Calendar } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export function HRDashboard() {
  const { jobRequirements, applications, resources } = useStore();

  // Funnel Metrics
  const funnelMetrics = useMemo(() => {
    const totalApplications = applications.length;
    const stages = {
      assigned: applications.filter(a => a.status === 'ASSIGNED').length,
      applied: applications.filter(a => a.status === 'APPLIED').length,
      shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
      interviewing: applications.filter(a => 
        a.status.includes('INTERVIEW') || a.status === 'AI_SCREENING'
      ).length,
      selected: applications.filter(a => a.status === 'SELECTED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    return {
      total: totalApplications,
      ...stages,
      conversionRate: totalApplications > 0 
        ? ((stages.selected / totalApplications) * 100).toFixed(1)
        : '0.0',
    };
  }, [applications]);

  // Time-to-Fill Average
  const timeToFill = useMemo(() => {
    const closedReqs = jobRequirements.filter(r => r.status === 'CLOSED_FILLED');
    if (closedReqs.length === 0) return 0;

    const totalDays = closedReqs.reduce((sum, req) => {
      const days = differenceInDays(new Date(req.updatedAt), new Date(req.createdAt));
      return sum + days;
    }, 0);

    return Math.round(totalDays / closedReqs.length);
  }, [jobRequirements]);

  // Onboarding Pipeline (Selected candidates)
  const onboardingPipeline = useMemo(() => {
    return applications
      .filter(app => app.status === 'SELECTED')
      .map(app => {
        const employee = resources.find(r => r.id === app.employeeId);
        const requirement = jobRequirements.find(r => r.id === app.requirementId);
        return {
          application: app,
          employee,
          requirement,
        };
      })
      .slice(0, 10);
  }, [applications, resources, jobRequirements]);

  // Compliance Metrics
  const complianceMetrics = useMemo(() => ({
    totalRequirements: jobRequirements.length,
    openRequirements: jobRequirements.filter(r => r.status === 'OPEN').length,
    filledRequirements: jobRequirements.filter(r => r.status === 'CLOSED_FILLED').length,
    onHoldRequirements: jobRequirements.filter(r => r.status === 'ON_HOLD').length,
    fillRate: jobRequirements.length > 0
      ? ((jobRequirements.filter(r => r.status === 'CLOSED_FILLED').length / jobRequirements.length) * 100).toFixed(1)
      : '0.0',
  }), [jobRequirements]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Hiring Metrics & Compliance Overview (View Only)
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
                <div className="text-2xl font-bold">{funnelMetrics.conversionRate}%</div>
                <div className="text-xs text-muted-foreground">
                  {funnelMetrics.selected} of {funnelMetrics.total}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Time-to-Fill</div>
                <div className="text-2xl font-bold">{timeToFill}</div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Fill Rate</div>
                <div className="text-2xl font-bold">{complianceMetrics.fillRate}%</div>
                <div className="text-xs text-muted-foreground">
                  {complianceMetrics.filledRequirements} filled
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Onboarding</div>
                <div className="text-2xl font-bold">{onboardingPipeline.length}</div>
                <div className="text-xs text-muted-foreground">selected candidates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hiring Funnel Chart */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Hiring Funnel</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Applications</span>
                <span className="text-sm font-bold">{funnelMetrics.total}</span>
              </div>
              <div className="bg-blue-500 h-12 rounded flex items-center justify-center text-white font-semibold">
                100%
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Shortlisted</span>
                <span className="text-sm font-bold">{funnelMetrics.shortlisted}</span>
              </div>
              <div 
                className="bg-indigo-500 h-10 rounded flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${(funnelMetrics.shortlisted / funnelMetrics.total) * 100}%` }}
              >
                {((funnelMetrics.shortlisted / funnelMetrics.total) * 100).toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Interviewing</span>
                <span className="text-sm font-bold">{funnelMetrics.interviewing}</span>
              </div>
              <div 
                className="bg-purple-500 h-10 rounded flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${(funnelMetrics.interviewing / funnelMetrics.total) * 100}%` }}
              >
                {((funnelMetrics.interviewing / funnelMetrics.total) * 100).toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Selected</span>
                <span className="text-sm font-bold">{funnelMetrics.selected}</span>
              </div>
              <div 
                className="bg-green-500 h-10 rounded flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${(funnelMetrics.selected / funnelMetrics.total) * 100}%` }}
              >
                {funnelMetrics.conversionRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Pipeline */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Onboarding Pipeline
          </h2>
          {onboardingPipeline.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No candidates in onboarding
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Candidate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Position</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {onboardingPipeline.map(({ application, employee, requirement }) => (
                    <tr key={application.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{employee?.name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{employee?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{requirement?.title || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{requirement?.location}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success">SELECTED</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={application.source === 'SELF_APPLY' ? 'info' : 'secondary'}>
                          {application.source}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Compliance Summary */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Requirement Status Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Open</span>
                <Badge variant="info">{complianceMetrics.openRequirements}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Filled</span>
                <Badge variant="success">{complianceMetrics.filledRequirements}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">On Hold</span>
                <Badge variant="warning">{complianceMetrics.onHoldRequirements}</Badge>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Application Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <Badge variant="info">{funnelMetrics.interviewing}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Selected</span>
                <Badge variant="success">{funnelMetrics.selected}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rejected</span>
                <Badge variant="destructive">{funnelMetrics.rejected}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
