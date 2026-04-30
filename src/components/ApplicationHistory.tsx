import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { Badge } from '@/components/core/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/tabs';

interface ApplicationHistoryProps {
  employeeId: string;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationHistory({ employeeId, employeeName, isOpen, onClose }: ApplicationHistoryProps) {
  const { applications, jobRequirements } = useStore();
  const [activeTab, setActiveTab] = useState('all');

  const employeeApplications = useMemo(() => {
    return applications
      .filter(app => app.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [applications, employeeId]);

  const activeApplications = useMemo(() => {
    return employeeApplications.filter(app =>
      !['REJECTED', 'WITHDRAWN', 'COMPLETED'].includes(app.status)
    );
  }, [employeeApplications]);

  const completedApplications = useMemo(() => {
    return employeeApplications.filter(app =>
      app.status === 'SELECTED' || app.status === 'COMPLETED'
    );
  }, [employeeApplications]);

  const rejectedApplications = useMemo(() => {
    return employeeApplications.filter(app =>
      app.status === 'REJECTED' || app.status === 'WITHDRAWN'
    );
  }, [employeeApplications]);

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'SELECTED' || status === 'COMPLETED') return 'default';
    if (status === 'REJECTED' || status === 'WITHDRAWN') return 'destructive';
    if (status === 'ON_HOLD') return 'secondary';
    return 'outline';
  };

  const renderApplicationCard = (app: typeof employeeApplications[0]) => {
    const requirement = jobRequirements.find(r => r.id === app.requirementId);

    return (
      <div
        key={app.id}
        className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Requirement Info */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Requirement</div>
            <div className="font-medium text-sm">{requirement?.title || 'Unknown'}</div>
            <div className="text-xs text-muted-foreground">{requirement?.location || '-'}</div>
          </div>

          {/* Status & Stage */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Status & Stage</div>
            <div className="flex flex-col gap-1">
              <Badge variant={getStatusVariant(app.status)} className="w-fit">
                {app.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {app.currentStage.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Source & AI Score */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Source & Score</div>
            <div className="flex flex-col gap-1">
              <Badge variant="outline" className="w-fit">
                {app.source === 'ASSIGNED' ? '🎯 Assigned' : '👤 Self Applied'}
              </Badge>
              {app.aiScore && (
                <span className="text-sm font-medium text-green-600">
                  AI: {app.aiScore.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Timeline</div>
            <div className="text-xs">
              <div>Applied: {format(new Date(app.createdAt), 'MMM dd, yyyy')}</div>
              <div className="text-muted-foreground">
                Updated: {format(new Date(app.updatedAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Notes if any */}
        {app.applicationNote && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-1">Notes</div>
            <div className="text-sm">{app.applicationNote}</div>
          </div>
        )}

        {/* Rejection/Hold reason if any */}
        {app.rejectionReason && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-red-600 mb-1">Rejection Reason</div>
            <div className="text-sm text-red-600">{app.rejectionReason}</div>
          </div>
        )}
        {app.holdReason && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-yellow-600 mb-1">Hold Reason</div>
            <div className="text-sm text-yellow-600">{app.holdReason}</div>
            {app.reviewDate && (
              <div className="text-xs text-muted-foreground">
                Review: {format(new Date(app.reviewDate), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Tracking - {employeeName}</DialogTitle>
          <DialogDescription>
            Complete application history and current status
          </DialogDescription>
        </DialogHeader>

        {employeeApplications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No applications found for {employeeName}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({employeeApplications.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeApplications.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Selected ({completedApplications.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {employeeApplications.map(app => renderApplicationCard(app))}
            </TabsContent>

            <TabsContent value="active" className="space-y-3 mt-4">
              {activeApplications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No active applications
                </div>
              ) : (
                activeApplications.map(app => renderApplicationCard(app))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {completedApplications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No completed applications
                </div>
              ) : (
                completedApplications.map(app => renderApplicationCard(app))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-3 mt-4">
              {rejectedApplications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No rejected applications
                </div>
              ) : (
                rejectedApplications.map(app => renderApplicationCard(app))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
