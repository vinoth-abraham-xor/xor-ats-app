import { Badge } from '@/components/core/badge';
import { CheckCircle, Circle, XCircle } from 'lucide-react';
import type { Application, ApplicationStatus } from '@/types';

interface ApplicationStageTrackerProps {
  application: Application;
}

const STAGE_FLOW: { status: ApplicationStatus; label: string }[] = [
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
];

export function ApplicationStageTracker({ application }: ApplicationStageTrackerProps) {
  // Find current stage index
  const currentIndex = STAGE_FLOW.findIndex(s => s.status === application.status);
  
  // Handle rejected/withdrawn/on_hold
  if (application.status === 'REJECTED') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
        <XCircle className="h-5 w-5 text-red-600" />
        <div>
          <div className="font-semibold text-red-900 dark:text-red-100">Application Rejected</div>
          {application.rejectionReason && (
            <div className="text-sm text-red-700 dark:text-red-300">Reason: {application.rejectionReason}</div>
          )}
        </div>
      </div>
    );
  }

  if (application.status === 'WITHDRAWN') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800">
        <XCircle className="h-5 w-5 text-gray-600" />
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">Application Withdrawn</div>
          {application.rejectionReason && (
            <div className="text-sm text-gray-700 dark:text-gray-300">Reason: {application.rejectionReason}</div>
          )}
        </div>
      </div>
    );
  }

  if (application.status === 'ON_HOLD') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
        <Circle className="h-5 w-5 text-yellow-600" />
        <div>
          <div className="font-semibold text-yellow-900 dark:text-yellow-100">Application On Hold</div>
          {application.holdReason && (
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Reason: {application.holdReason}</div>
          )}
          {application.reviewDate && (
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              Review Date: {new Date(application.reviewDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal flow
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Interview Progress</div>
        <Badge variant="info">{application.currentStage}</Badge>
      </div>
      
      {/* Progress Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
        
        <div className="space-y-4">
          {STAGE_FLOW.map((stage, index) => {
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={stage.status} className="relative flex items-center gap-3">
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  isPast ? 'bg-green-500' :
                  isCurrent ? 'bg-blue-500' :
                  'bg-gray-200 dark:bg-gray-800'
                }`}>
                  {isPast ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : isCurrent ? (
                    <div className="h-3 w-3 rounded-full bg-white animate-pulse"></div>
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <div className={`flex-1 ${
                  isCurrent ? 'font-semibold' :
                  isPast ? 'text-muted-foreground' :
                  'text-muted-foreground/60'
                }`}>
                  {stage.label}
                  {isCurrent && (
                    <div className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      Current Stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {application.aiScore !== undefined && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">AI Match Score</div>
          <div className="text-2xl font-bold">{application.aiScore}%</div>
        </div>
      )}
    </div>
  );
}
