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

interface ResourceAssignmentsProps {
  resourceId: string;
  resourceName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ResourceAssignments({ resourceId, resourceName, isOpen, onClose }: ResourceAssignmentsProps) {
  const { applications, jobRequirements } = useStore();
  const [activeTab, setActiveTab] = useState('all');

  const resourceApplications = useMemo(() => {
    return applications
      .filter(app => app.employeeId === resourceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [applications, resourceId]);

  const activeAssignments = useMemo(() => {
    return resourceApplications.filter(app =>
      !['REJECTED', 'WITHDRAWN', 'COMPLETED'].includes(app.status)
    );
  }, [resourceApplications]);

  const inInterviewAssignments = useMemo(() => {
    return resourceApplications.filter(app =>
      app.status.includes('INTERVIEW') || app.status === 'HR_ROUND'
    );
  }, [resourceApplications]);

  const completedAssignments = useMemo(() => {
    return resourceApplications.filter(app =>
      app.status === 'SELECTED' || app.status === 'COMPLETED'
    );
  }, [resourceApplications]);

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'SELECTED' || status === 'COMPLETED') return 'default';
    if (status === 'REJECTED' || status === 'WITHDRAWN') return 'destructive';
    if (status === 'ON_HOLD') return 'secondary';
    return 'outline';
  };

  const renderAssignmentCard = (app: typeof resourceApplications[0]) => {
    const requirement = jobRequirements.find(r => r.id === app.requirementId);

    return (
      <div
        key={app.id}
        className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {/* Requirement */}
          <div className="md:col-span-2">
            <div className="font-medium text-sm">{requirement?.title || 'Unknown'}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <span>{requirement?.location || '-'}</span>
              <span>•</span>
              <span>{requirement?.projectInfo || '-'}</span>
            </div>
          </div>

          {/* Current Stage */}
          <div>
            <Badge variant="outline" className="text-xs">
              {app.currentStage.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Status */}
          <div>
            <Badge variant={getStatusVariant(app.status)}>
              {app.status}
            </Badge>
          </div>

          {/* Info */}
          <div className="flex flex-col text-xs">
            <div>
              {app.source === 'ASSIGNED' ? '🎯 Assigned' : '👤 Self Applied'}
            </div>
            {app.aiScore && (
              <div className="text-green-600 font-medium">AI: {app.aiScore.toFixed(1)}%</div>
            )}
            <div className="text-muted-foreground mt-1">
              {format(new Date(app.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assignment Tracking - {resourceName}</DialogTitle>
          <DialogDescription>
            Complete assignment history and current status
          </DialogDescription>
        </DialogHeader>

        {resourceApplications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No assignments found for {resourceName}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({resourceApplications.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="interview">
                In Interview ({inInterviewAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Selected ({completedAssignments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {resourceApplications.map(app => renderAssignmentCard(app))}
            </TabsContent>

            <TabsContent value="active" className="space-y-3 mt-4">
              {activeAssignments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No active assignments
                </div>
              ) : (
                activeAssignments.map(app => renderAssignmentCard(app))
              )}
            </TabsContent>

            <TabsContent value="interview" className="space-y-3 mt-4">
              {inInterviewAssignments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No interviews in progress
                </div>
              ) : (
                inInterviewAssignments.map(app => renderAssignmentCard(app))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {completedAssignments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No completed assignments
                </div>
              ) : (
                completedAssignments.map(app => renderAssignmentCard(app))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
