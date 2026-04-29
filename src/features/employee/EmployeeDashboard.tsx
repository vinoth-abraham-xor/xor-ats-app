import { useState } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/core/button';
import { Badge } from '@/components/core/badge';
import { Briefcase, Calendar, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Label } from '@/components/core/label';
import { Input } from '@/components/core/input';

export function EmployeeDashboard() {
  const { auth, applications, jobRequirements, interviewStages, updateApplication, addNotification } = useStore();
  const navigate = useNavigate();
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!auth.user) return null;

  // Get my applications
  const myApplications = applications.filter(app => app.employeeId === auth.user!.id);

  // Get my assignments (ASSIGNED status)
  const myAssignments = myApplications.filter(app => app.source === 'ASSIGNED' && app.status === 'ASSIGNED');

  // Get active applications (not rejected/withdrawn)
  const activeApplications = myApplications.filter(app =>
    app.status !== 'REJECTED' && app.status !== 'WITHDRAWN'
  );

  // Get upcoming interviews
  const upcomingInterviews = interviewStages.filter(stage => {
    const app = myApplications.find(a => a.id === stage.applicationId);
    return app && stage.outcome === 'PENDING' && stage.scheduledAt;
  }).sort((a, b) => {
    const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return dateA - dateB;
  });

  const getRequirement = (reqId: string) => {
    return jobRequirements.find(r => r.id === reqId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
      ASSIGNED: 'info',
      APPLIED: 'secondary',
      SHORTLISTED: 'success',
      AI_SCREENING: 'info',
      INTERVIEW_L1: 'warning',
      INTERVIEW_L2: 'warning',
      HR_ROUND: 'warning',
      SELECTED: 'success',
      REJECTED: 'destructive',
      ON_HOLD: 'warning',
    };
    return variants[status] || 'secondary';
  };

  const handleAccept = () => {
    if (selectedApplication && auth.user) {
      updateApplication(selectedApplication, {
        status: 'AI_SCREENING',
        currentStage: 'AI Screening',
        acceptedAt: new Date().toISOString(),
      });

      addNotification({
        type: 'APPLICATION',
        recipientId: '1',
        title: 'Assignment Accepted',
        message: `${auth.user.name} accepted the assignment`,
        read: false,
      });

      setIsAcceptDialogOpen(false);
      setSelectedApplication(null);
    }
  };

  const handleReject = () => {
    if (selectedApplication && auth.user && rejectReason) {
      updateApplication(selectedApplication, {
        status: 'WITHDRAWN',
        currentStage: 'Withdrawn',
        rejectedAt: new Date().toISOString(),
        rejectionReason: rejectReason,
      });

      addNotification({
        type: 'REJECTION',
        recipientId: '1',
        title: 'Assignment Rejected',
        message: `${auth.user.name} rejected: ${rejectReason}`,
        read: false,
      });

      setIsRejectDialogOpen(false);
      setSelectedApplication(null);
      setRejectReason('');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {auth.user.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Assignments</div>
                <div className="text-2xl font-bold">{myAssignments.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Applications</div>
                <div className="text-2xl font-bold">{activeApplications.length}</div>
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
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Search className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Open Roles</div>
                <div className="text-2xl font-bold">
                  {jobRequirements.filter(r => r.status === 'OPEN').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={() => navigate('/employee/search')}>
            <Search className="mr-2 h-4 w-4" />
            Browse Open Roles
          </Button>
          <Button variant="outline" onClick={() => navigate('/employee/applications')}>
            <Briefcase className="mr-2 h-4 w-4" />
            My Applications
          </Button>
        </div>

        {/* Pending Assignments */}
        {myAssignments.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Pending Assignments</h2>
            <div className="space-y-2">
              {myAssignments.map(app => {
                const req = getRequirement(app.requirementId);
                return (
                  <div key={app.id} className="bg-card rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{req?.title || 'Unknown'}</h3>
                          <Badge variant="info">ASSIGNED</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Project: {req?.projectInfo}</div>
                          <div>Location: {req?.location}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app.id);
                            setIsAcceptDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApplication(app.id);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Applications</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/employee/applications'}
              >
                View All →
              </Button>
            </div>
            {activeApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active applications yet
              </div>
            ) : (
              <div className="space-y-2">
                {activeApplications.slice(0, 5).map(app => {
                  const req = getRequirement(app.requirementId);
                  return (
                    <div key={app.id} className="bg-card rounded-lg border p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{req?.title}</div>
                          <div className="text-xs text-muted-foreground">
                            REQ-{app.requirementId.slice(0, 4)}
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(app.status)} className="text-xs">
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stage: {app.currentStage}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Upcoming Interviews</h2>
            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming interviews
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingInterviews.slice(0, 5).map(stage => {
                  const app = myApplications.find(a => a.id === stage.applicationId);
                  const req = app ? getRequirement(app.requirementId) : null;
                  return (
                    <div key={stage.id} className="bg-card rounded-lg border p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{stage.name}</div>
                          <div className="text-xs text-muted-foreground">{req?.title}</div>
                        </div>
                      </div>
                      {stage.scheduledAt && (
                        <div className="text-xs text-muted-foreground">
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

      {/* Accept Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Assignment</DialogTitle>
            <DialogDescription>
              Confirm that you're interested and available for this opportunity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              By accepting, you'll move to the AI Screening stage and the TMG team will be notified.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAccept}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Assignment</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this opportunity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason for Rejection</Label>
              <Input
                id="rejectReason"
                placeholder="e.g., Not interested in this technology stack"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
