import { useState } from 'react';
import { useStore } from '@/store';
import type { Application, ApplicationStatus } from '@/types';
import { Button } from '@/components/core/button';
import { Label } from '@/components/core/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/core/dialog';

interface MoveStageDialogProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

const STAGE_OPTIONS: { status: ApplicationStatus; label: string }[] = [
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'APPLIED', label: 'Applied' },
  { status: 'AI_SCREENING', label: 'AI Screening' },
  { status: 'SHORTLISTED', label: 'Shortlisted' },
  { status: 'INTERVIEW_L1', label: 'Interview L1' },
  { status: 'INTERVIEW_L2', label: 'Interview L2' },
  { status: 'HR_ROUND', label: 'HR Round' },
  { status: 'SELECTED', label: 'Selected' },
  { status: 'ONBOARDING', label: 'Onboarding' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'REJECTED', label: 'Rejected' },
  { status: 'WITHDRAWN', label: 'Withdrawn' },
  { status: 'ON_HOLD', label: 'On Hold' },
];

export function MoveStageDialog({ application, isOpen, onClose }: MoveStageDialogProps) {
  const { moveApplicationToStage, auth, users, resources, jobRequirements } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [reason, setReason] = useState('');

  if (!application) return null;

  const employee = users.find(u => u.id === application.employeeId) || 
                   resources.find(r => r.id === application.employeeId);
  const requirement = jobRequirements.find(r => r.id === application.requirementId);

  const handleMove = () => {
    if (selectedStatus && auth.user) {
      const stageLabel = STAGE_OPTIONS.find(s => s.status === selectedStatus)?.label || selectedStatus;
      
      moveApplicationToStage(
        application.id,
        selectedStatus as ApplicationStatus,
        stageLabel,
        auth.user.id,
        reason || undefined
      );

      setSelectedStatus('');
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Application to Stage</DialogTitle>
          <DialogDescription>
            Manually change the interview stage for this candidate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Info */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Candidate:</span>
                <div className="font-medium">{employee?.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Requirement:</span>
                <div className="font-medium">{requirement?.title}</div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Current Stage:</span>
                <div className="font-medium">{application.currentStage} ({application.status})</div>
              </div>
            </div>
          </div>

          {/* Stage Selection */}
          <div className="space-y-2">
            <Label htmlFor="stage">New Stage</Label>
            <select
              id="stage"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
            >
              <option value="">Select stage</option>
              {STAGE_OPTIONS.map(stage => (
                <option 
                  key={stage.status} 
                  value={stage.status}
                  disabled={stage.status === application.status}
                >
                  {stage.label} {stage.status === application.status ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <textarea
              id="reason"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              placeholder="Why are you moving this candidate to this stage?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              This will be recorded in the audit trail
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setSelectedStatus(''); setReason(''); }}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedStatus || selectedStatus === application.status}>
            Move to Stage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
