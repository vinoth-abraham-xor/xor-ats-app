import { useMemo } from 'react';
import { useStore } from '@/store';
import type { ApplicationStatus, Application } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/core/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/core/card';

const pipelineColumns: {
  key: string;
  title: string;
  statuses: ApplicationStatus[];
}[] = [
  {
    key: 'ASSIGNED',
    title: 'Assigned',
    statuses: ['ASSIGNED'],
  },
  {
    key: 'APPLIED',
    title: 'Applied',
    statuses: ['APPLIED', 'AI_SCREENING', 'SHORTLISTED'],
  },
  {
    key: 'INTERVIEWS',
    title: 'Interviews',
    statuses: ['INTERVIEW_L1', 'INTERVIEW_L2', 'HR_ROUND'],
  },
  {
    key: 'OFFER',
    title: 'Offer / Onboarding',
    statuses: ['SELECTED', 'ONBOARDING'],
  },
  {
    key: 'ON_HOLD',
    title: 'On Hold',
    statuses: ['ON_HOLD'],
  },
  {
    key: 'CLOSED',
    title: 'Completed / Rejected',
    statuses: ['COMPLETED', 'REJECTED', 'WITHDRAWN'],
  },
];

function getStatusVariant(status: ApplicationStatus): 'success' | 'warning' | 'info' | 'secondary' | 'destructive' {
  const variants: Record<ApplicationStatus, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
    ASSIGNED: 'info',
    APPLIED: 'secondary',
    SHORTLISTED: 'success',
    AI_SCREENING: 'info',
    INTERVIEW_L1: 'warning',
    INTERVIEW_L2: 'warning',
    HR_ROUND: 'warning',
    SELECTED: 'success',
    ONBOARDING: 'info',
    COMPLETED: 'success',
    REJECTED: 'destructive',
    WITHDRAWN: 'secondary',
    ON_HOLD: 'warning',
  };
  return variants[status] || 'secondary';
}

export function CandidatePipelineBoard() {
  const { applications, jobRequirements, users, resources } = useStore();

  const grouped = useMemo(() => {
    const groups: Record<string, Application[]> = {};
    pipelineColumns.forEach(col => {
      groups[col.key] = [];
    });

    applications.forEach(app => {
      const column = pipelineColumns.find(col => col.statuses.includes(app.status));
      const key = column?.key ?? 'OTHER';
      if (!groups[key]) groups[key] = [];
      groups[key].push(app);
    });

    // Sort each column by created date (newest first)
    Object.keys(groups).forEach(key => {
      groups[key] = groups[key].slice().sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });

    return groups;
  }, [applications]);

  const getEmployee = (empId: string) => {
    return users.find(u => u.id === empId) || resources.find(r => r.id === empId);
  };

  const getRequirement = (reqId: string) => {
    return jobRequirements.find(r => r.id === reqId);
  };

  const total = applications.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Candidate Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Visual view of all applications across the hiring pipeline
          </p>
        </div>

        {/* Summary */}
        <div className="flex flex-wrap gap-4">
          {pipelineColumns.map(col => {
            const count = grouped[col.key]?.length ?? 0;
            const percentage = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={col.key} className="bg-card rounded-lg border p-4 min-w-[180px]">
                <div className="text-sm text-muted-foreground">{col.title}</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kanban Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineColumns.map(column => {
            const apps = grouped[column.key] || [];
            return (
              <div
                key={column.key}
                className="min-w-[260px] max-w-xs flex-1 bg-muted/40 rounded-lg border border-border flex flex-col"
              >
                <div className="px-3 py-2 border-b flex items-center justify-between">
                  <div className="text-sm font-semibold">{column.title}</div>
                  <Badge variant="secondary" className="text-xs">
                    {apps.length}
                  </Badge>
                </div>
                <div className="p-2 space-y-2 overflow-y-auto max-h-[60vh]">
                  {apps.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No candidates in this stage
                    </div>
                  ) : (
                    apps.map(app => {
                      const employee = getEmployee(app.employeeId);
                      const req = getRequirement(app.requirementId);
                      return (
                        <Card key={app.id} className="border shadow-none">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex flex-col gap-1">
                              <span>{employee?.name || 'Unknown Candidate'}</span>
                              <span className="text-xs font-normal text-muted-foreground">
                                {employee && 'email' in employee ? employee.email : ''}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">REQ-{app.requirementId.slice(0, 4)}</span>{' '}
                                {req?.title && <span className="ml-1">– {req.title}</span>}
                              </div>
                              {req?.projectInfo && (
                                <div className="truncate">{req.projectInfo}</div>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <Badge variant={getStatusVariant(app.status)}>
                                {app.status.replace('_', ' ')}
                              </Badge>
                              {app.aiScore !== undefined && (
                                <span className="text-muted-foreground">AI: {app.aiScore}%</span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground/80">
                              Created on{' '}
                              {new Date(app.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: '2-digit',
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
