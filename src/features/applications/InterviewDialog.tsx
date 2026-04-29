import { useState } from 'react';
import { useStore } from '@/store';
import type { Application, InterviewStage } from '@/types';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Badge } from '@/components/core/badge';
import { Label } from '@/components/core/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Plus, CheckCircle, XCircle, Pause, Edit, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewDialogProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InterviewDialog({ application, isOpen, onClose }: InterviewDialogProps) {
  const { interviewStages, addInterviewStage, updateInterviewStage, users, resources } = useStore();
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageName, setStageName] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!application) return null;

  const appStages = interviewStages
    .filter(stage => stage.applicationId === application.id)
    .sort((a, b) => a.sequence - b.sequence);

  const getEmployee = (empId: string) => {
    return users.find(u => u.id === empId) || resources.find(r => r.id === empId);
  };

  const employee = getEmployee(application.employeeId);

  const handleAddStage = () => {
    if (application && stageName) {
      addInterviewStage({
        applicationId: application.id,
        name: stageName,
        sequence: appStages.length + 1,
        interviewer: interviewer || undefined,
        scheduledAt: scheduledDate || undefined,
        outcome: 'PENDING',
      });
      setStageName('');
      setInterviewer('');
      setScheduledDate('');
      setFeedback('');
      setIsAddingStage(false);
    }
  };

  const handleEditStage = (stage: InterviewStage) => {
    setEditingStageId(stage.id);
    setStageName(stage.name);
    setInterviewer(stage.interviewer || '');
    setScheduledDate(stage.scheduledAt ? stage.scheduledAt.substring(0, 16) : '');
    setFeedback(stage.feedback || '');
  };

  const handleSaveEdit = () => {
    if (editingStageId) {
      updateInterviewStage(editingStageId, {
        name: stageName,
        interviewer: interviewer || undefined,
        scheduledAt: scheduledDate || undefined,
        feedback: feedback || undefined,
      });
      setStageName('');
      setInterviewer('');
      setScheduledDate('');
      setFeedback('');
      setEditingStageId(null);
    }
  };

  const handleCancelEdit = () => {
    setStageName('');
    setInterviewer('');
    setScheduledDate('');
    setFeedback('');
    setEditingStageId(null);
    setIsAddingStage(false);
  };

  const handleUpdateOutcome = (stage: InterviewStage, outcome: 'PASS' | 'FAIL' | 'HOLD') => {
    updateInterviewStage(stage.id, {
      outcome,
      completedAt: outcome !== 'HOLD' ? new Date().toISOString() : undefined,
      feedback: feedback || undefined,
    });
    setFeedback('');
  };

  const handleResume = (stage: InterviewStage) => {
    updateInterviewStage(stage.id, {
      outcome: 'PENDING',
      completedAt: undefined,
    });
  };

  const getOutcomeBadge = (outcome: string) => {
    const variants: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
      PASS: 'success',
      FAIL: 'destructive',
      HOLD: 'warning',
      PENDING: 'secondary',
    };
    return variants[outcome] || 'secondary';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Tracking</DialogTitle>
          <DialogDescription>
            Manage interview stages for {employee?.name || 'Unknown Candidate'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Application Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Candidate:</span> <span className="font-medium">{employee?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span> <Badge variant="info">{application.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Source:</span> <Badge variant="secondary">{application.source}</Badge>
              </div>
              {application.aiScore && (
                <div>
                  <span className="text-muted-foreground">AI Score:</span> <span className="font-medium">{application.aiScore}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Interview Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Interview Stages</h3>
              {!isAddingStage && !editingStageId && (
                <Button size="sm" onClick={() => setIsAddingStage(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stage
                </Button>
              )}
            </div>

            {/* Add/Edit Stage Form */}
            {(isAddingStage || editingStageId) && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="text-sm font-medium mb-2">
                  {editingStageId ? 'Edit Interview Stage' : 'Add New Interview Stage'}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="stageName">Stage Name</Label>
                    <Input
                      id="stageName"
                      placeholder="e.g., Technical Round 1"
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interviewer">Interviewer</Label>
                    <Input
                      id="interviewer"
                      placeholder="e.g., John Manager"
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback/Remarks</Label>
                  <textarea
                    id="feedback"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                    placeholder="Enter feedback or remarks..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {editingStageId ? (
                    <>
                      <Button size="sm" onClick={handleSaveEdit} disabled={!stageName}>
                        Save Changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={handleAddStage} disabled={!stageName}>
                        Add
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Stages List */}
            {appStages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No interview stages added yet. Click "Add Stage" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {appStages.map((stage, index) => (
                  <div key={stage.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold">Stage {index + 1}: {stage.name}</span>
                          <Badge variant={getOutcomeBadge(stage.outcome)}>{stage.outcome}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {stage.interviewer && (
                            <div>Interviewer: {stage.interviewer}</div>
                          )}
                          {stage.scheduledAt && (
                            <div>Scheduled: {format(new Date(stage.scheduledAt), 'MMM dd, yyyy hh:mm a')}</div>
                          )}
                          {stage.completedAt && (
                            <div>Completed: {format(new Date(stage.completedAt), 'MMM dd, yyyy')}</div>
                          )}
                          {stage.feedback && (
                            <div className="col-span-2">Feedback: {stage.feedback}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        {/* Edit button - always available */}
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Edit Stage"
                          onClick={() => handleEditStage(stage)}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>

                        {/* Resume button for HOLD status */}
                        {stage.outcome === 'HOLD' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Resume Interview"
                            onClick={() => handleResume(stage)}
                          >
                            <RotateCcw className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}

                        {/* Pass/Fail/Hold buttons for PENDING status */}
                        {stage.outcome === 'PENDING' && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Pass"
                              onClick={() => handleUpdateOutcome(stage, 'PASS')}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Fail"
                              onClick={() => handleUpdateOutcome(stage, 'FAIL')}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Hold"
                              onClick={() => handleUpdateOutcome(stage, 'HOLD')}
                            >
                              <Pause className="h-4 w-4 text-yellow-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
