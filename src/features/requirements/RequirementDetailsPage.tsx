import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/core/button';
import { Badge } from '@/components/core/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/core/card';
import { 
  ArrowLeft, 
  UserPlus, 
  Users, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  ArrowRight,
  Calendar,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { EnhancedAssignDialog } from '@/features/applications/EnhancedAssignDialog';
import { MoveStageDialog } from '@/features/applications/MoveStageDialog';
import { InterviewDialog } from '@/features/applications/InterviewDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/core/dialog';
import { Label } from '@/components/core/label';
import { Input } from '@/components/core/input';
import type { Application } from '@/types';

export function RequirementDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    jobRequirements, 
    applications, 
    users, 
    resources, 
    auth,
    shortlistApplication,
    rejectApplication,
    holdApplication,
    resumeApplication,
    assignCandidate
  } = useStore();

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isMoveStageDialogOpen, setIsMoveStageDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const requirement = jobRequirements.find(r => r.id === id);
  
  if (!requirement) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Requirement not found</div>
          <Button className="mt-4" onClick={() => navigate('/requirements')}>
            Back to Requirements
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const requirementApplications = applications.filter(app => app.requirementId === requirement.id);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'ALL') return requirementApplications;
    if (statusFilter === 'ACTIVE') {
      return requirementApplications.filter(app => 
        app.status !== 'REJECTED' && 
        app.status !== 'WITHDRAWN' && 
        app.status !== 'COMPLETED'
      );
    }
    if (statusFilter === 'INTERVIEWS') {
      return requirementApplications.filter(app => 
        app.status.includes('INTERVIEW') || app.status === 'HR_ROUND'
      );
    }
    return requirementApplications.filter(app => app.status === statusFilter);
  }, [requirementApplications, statusFilter]);

  const getEmployee = (empId: string) => {
    return users.find(u => u.id === empId) || resources.find(r => r.id === empId);
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
      ONBOARDING: 'info',
      COMPLETED: 'success',
      REJECTED: 'destructive',
      WITHDRAWN: 'secondary',
      ON_HOLD: 'warning',
    };
    return variants[status] || 'secondary';
  };

  const handleAssign = (requirementId: string, employeeId: string) => {
    if (auth.user) {
      assignCandidate(requirementId, employeeId, auth.user.id);
    }
  };

  const handleReject = () => {
    if (selectedApplication && rejectReason && auth.user) {
      rejectApplication(selectedApplication.id, rejectReason, auth.user.id);
      setIsRejectDialogOpen(false);
      setRejectReason('');
      setSelectedApplication(null);
    }
  };

  const handleHold = () => {
    if (selectedApplication && holdReason && reviewDate && auth.user) {
      holdApplication(selectedApplication.id, holdReason, reviewDate, auth.user.id);
      setIsHoldDialogOpen(false);
      setHoldReason('');
      setReviewDate('');
      setSelectedApplication(null);
    }
  };

  const stats = {
    total: requirementApplications.length,
    active: requirementApplications.filter(app => 
      app.status !== 'REJECTED' && app.status !== 'WITHDRAWN' && app.status !== 'COMPLETED'
    ).length,
    shortlisted: requirementApplications.filter(app => app.status === 'SHORTLISTED').length,
    interviews: requirementApplications.filter(app => 
      app.status.includes('INTERVIEW') || app.status === 'HR_ROUND'
    ).length,
    selected: requirementApplications.filter(app => 
      app.status === 'SELECTED' || app.status === 'ONBOARDING' || app.status === 'COMPLETED'
    ).length,
    rejected: requirementApplications.filter(app => app.status === 'REJECTED').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/requirements')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requirements
            </Button>
            <h1 className="text-3xl font-bold">{requirement.title}</h1>
            <p className="text-muted-foreground mt-1">{requirement.projectInfo}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={requirement.status === 'OPEN' ? 'success' : 'secondary'}>
              {requirement.status}
            </Badge>
            <Badge variant="secondary">{requirement.priority} Priority</Badge>
          </div>
        </div>

        {/* Requirement Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium">{requirement.location}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Positions</div>
                <div className="font-medium">{requirement.positions}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Experience</div>
                <div className="font-medium">{requirement.experience.min}-{requirement.experience.max} years</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">REQ ID</div>
                <div className="font-medium">REQ-{requirement.id.slice(0, 8)}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">Required Skills</div>
              <div className="flex flex-wrap gap-1">
                {requirement.skills.map(skill => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Candidates</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold mt-1">{stats.active}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Shortlisted</div>
            <div className="text-2xl font-bold mt-1">{stats.shortlisted}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">In Interviews</div>
            <div className="text-2xl font-bold mt-1">{stats.interviews}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Selected</div>
            <div className="text-2xl font-bold mt-1">{stats.selected}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Rejected</div>
            <div className="text-2xl font-bold mt-1">{stats.rejected}</div>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Active ({stats.active})
            </Button>
            <Button
              variant={statusFilter === 'INTERVIEWS' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('INTERVIEWS')}
            >
              Interviews ({stats.interviews})
            </Button>
            <Button
              variant={statusFilter === 'SELECTED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('SELECTED')}
            >
              Selected ({stats.selected})
            </Button>
          </div>
          <Button onClick={() => setIsAssignDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Candidate
          </Button>
        </div>

        {/* Candidates List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <div className="text-muted-foreground">No candidates found</div>
            <Button className="mt-4" onClick={() => setIsAssignDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign First Candidate
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map(app => {
              const employee = getEmployee(app.employeeId);
              return (
                <Card key={app.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {employee?.name || 'Unknown Candidate'}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                          {employee && 'email' in employee && employee.email}
                          {employee && 'designation' in employee && ` • ${employee.designation}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getStatusBadge(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                        {app.aiScore !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            AI Score: {app.aiScore}%
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Stage:</span>
                        <div className="font-medium">{app.currentStage}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Source:</span>
                        <div className="font-medium">{app.source}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Applied:</span>
                        <div className="font-medium">{format(new Date(app.createdAt), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Move to Stage"
                        onClick={() => {
                          setSelectedApplication(app);
                          setIsMoveStageDialogOpen(true);
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Move Stage
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Manage Interviews"
                        onClick={() => {
                          setSelectedApplication(app);
                          setIsInterviewDialogOpen(true);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Interviews
                      </Button>
                      {app.status === 'APPLIED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (auth.user) {
                              shortlistApplication(app.id, auth.user.id);
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Shortlist
                        </Button>
                      )}
                      {(app.status === 'APPLIED' || app.status === 'SHORTLISTED') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1 text-red-600" />
                          Reject
                        </Button>
                      )}
                      {app.status !== 'ON_HOLD' && app.status !== 'REJECTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app);
                            setIsHoldDialogOpen(true);
                          }}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Hold
                        </Button>
                      )}
                      {app.status === 'ON_HOLD' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (auth.user) {
                              resumeApplication(app.id, auth.user.id);
                            }
                          }}
                        >
                          <Play className="h-4 w-4 mr-1 text-green-600" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialogs */}
        <EnhancedAssignDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          selectedRequirement={requirement.id}
          onAssign={handleAssign}
        />

        <MoveStageDialog
          application={selectedApplication}
          isOpen={isMoveStageDialogOpen}
          onClose={() => {
            setIsMoveStageDialogOpen(false);
            setSelectedApplication(null);
          }}
        />

        <InterviewDialog
          application={selectedApplication}
          isOpen={isInterviewDialogOpen}
          onClose={() => {
            setIsInterviewDialogOpen(false);
            setSelectedApplication(null);
          }}
        />

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Provide a reason for rejection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Reason</Label>
                <textarea
                  id="rejectReason"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsRejectDialogOpen(false); setRejectReason(''); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hold Dialog */}
        <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Put Application on Hold</DialogTitle>
              <DialogDescription>
                Temporarily pause this application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="holdReason">Reason</Label>
                <textarea
                  id="holdReason"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Enter hold reason..."
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewDate">Review Date</Label>
                <Input
                  id="reviewDate"
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsHoldDialogOpen(false); setHoldReason(''); setReviewDate(''); }}>
                Cancel
              </Button>
              <Button onClick={handleHold} disabled={!holdReason || !reviewDate}>
                Put on Hold
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

