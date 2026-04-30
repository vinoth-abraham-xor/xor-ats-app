import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useStore } from '@/store';
import type { Application } from '@/types';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Badge } from '@/components/core/badge';
import { Search, UserPlus, CheckCircle, XCircle, Pause, Play, Calendar, ArrowUpDown, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Label } from '@/components/core/label';
import { InterviewDialog } from './InterviewDialog';
import { EnhancedAssignDialog } from './EnhancedAssignDialog';
import { MoveStageDialog } from './MoveStageDialog';
import { ExportButton } from '@/components/ExportButton';

export function ApplicationsPage() {
  const {
    applications,
    jobRequirements,
    resources,
    users,
    assignCandidate,
    shortlistApplication,
    rejectApplication,
    holdApplication,
    resumeApplication,
    auth,
  } = useStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [selectedRequirement, setSelectedRequirement] = useState<string>('ALL');

  // Dialogs
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isMoveStageDialogOpen, setIsMoveStageDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [reviewDate, setReviewDate] = useState('');

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

  const getEmployee = (empId: string) => {
    return users.find(u => u.id === empId) || resources.find(r => r.id === empId);
  };

  const getRequirement = (reqId: string) => {
    return jobRequirements.find(r => r.id === reqId);
  };

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Requirement filter
    if (selectedRequirement !== 'ALL') {
      filtered = filtered.filter(app => app.requirementId === selectedRequirement);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'ALL') {
      filtered = filtered.filter(app => app.source === sourceFilter);
    }

    // Global search filter
    if (globalFilter) {
      const searchLower = globalFilter.toLowerCase();
      filtered = filtered.filter(app => {
        // Get employee details
        const employee = users.find(u => u.id === app.employeeId) ||
                        resources.find(r => r.id === app.employeeId);
        const employeeName = employee?.name?.toLowerCase() || '';
        const employeeEmail = employee && 'email' in employee ? employee.email.toLowerCase() : '';

        // Get requirement details
        const requirement = jobRequirements.find(r => r.id === app.requirementId);
        const requirementTitle = requirement?.title?.toLowerCase() || '';
        const requirementProject = requirement?.projectInfo?.toLowerCase() || '';
        const requirementId = `req-${app.requirementId.slice(0, 4)}`.toLowerCase();

        // Search in multiple fields
        return (
          employeeName.includes(searchLower) ||
          employeeEmail.includes(searchLower) ||
          requirementTitle.includes(searchLower) ||
          requirementProject.includes(searchLower) ||
          requirementId.includes(searchLower) ||
          app.status.toLowerCase().includes(searchLower) ||
          app.source.toLowerCase().includes(searchLower) ||
          app.currentStage.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [applications, selectedRequirement, statusFilter, sourceFilter, globalFilter, users, resources, jobRequirements]);

  const columns = useMemo<ColumnDef<Application>[]>(
    () => [
      {
        accessorKey: 'employeeId',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Candidate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const employee = getEmployee(row.original.employeeId);
          const email = employee && 'email' in employee ? employee.email : '';
          return (
            <div className="max-w-[200px]">
              <div className="font-medium text-sm">{employee?.name || 'Unknown'}</div>
              {email && (
                <div className="text-xs text-muted-foreground truncate" title={email}>
                  {email}
                </div>
              )}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const empA = getEmployee(rowA.original.employeeId);
          const empB = getEmployee(rowB.original.employeeId);
          return (empA?.name || '').localeCompare(empB?.name || '');
        },
        enableSorting: true,
        size: 200,
      },
      {
        accessorKey: 'requirementId',
        header: 'Requirement',
        cell: ({ row }) => {
          const req = getRequirement(row.original.requirementId);
          return (
            <div className="max-w-sm">
              <div className="font-medium text-sm line-clamp-1" title={req?.title}>
                <span className="text-xs text-muted-foreground">REQ-{row.original.requirementId.slice(0, 4)}</span>
                {req?.title && <span className="ml-1">· {req.title}</span>}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5" title={req?.projectInfo}>
                {req?.projectInfo || ''}
              </div>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1">
              <Badge variant={getStatusBadge(row.original.status)} className="text-xs">
                {row.original.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge
                variant={row.original.source === 'ASSIGNED' ? 'outline' : 'secondary'}
                className="text-xs"
              >
                {row.original.source === 'ASSIGNED' ? 'Assigned' : 'Self Apply'}
              </Badge>
              {row.original.aiScore && (
                <span>· {row.original.aiScore}%</span>
              )}
            </div>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        size: 180,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Applied
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm" title={format(new Date(row.original.createdAt), 'MMM dd, yyyy')}>
            {format(new Date(row.original.createdAt), 'MMM dd')}
          </div>
        ),
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original.createdAt).getTime() - new Date(rowB.original.createdAt).getTime();
        },
        enableSorting: true,
        size: 80,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Move to Stage"
              onClick={() => {
                setSelectedApplication(row.original);
                setIsMoveStageDialogOpen(true);
              }}
            >
              <ArrowRight className="h-4 w-4 text-purple-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Manage Interviews"
              onClick={() => {
                setSelectedApplication(row.original);
                setIsInterviewDialogOpen(true);
              }}
            >
              <Calendar className="h-4 w-4 text-blue-600" />
            </Button>
            {row.original.status === 'APPLIED' && (
              <Button
                variant="ghost"
                size="icon"
                title="Shortlist"
                onClick={() => {
                  if (auth.user) {
                    shortlistApplication(row.original.id, auth.user.id);
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {(row.original.status === 'APPLIED' || row.original.status === 'SHORTLISTED') && (
              <Button
                variant="ghost"
                size="icon"
                title="Reject"
                onClick={() => {
                  setSelectedApplication(row.original);
                  setIsRejectDialogOpen(true);
                }}
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            )}
            {row.original.status !== 'ON_HOLD' && row.original.status !== 'REJECTED' && (
              <Button
                variant="ghost"
                size="icon"
                title="Hold"
                onClick={() => {
                  setSelectedApplication(row.original);
                  setIsHoldDialogOpen(true);
                }}
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {row.original.status === 'ON_HOLD' && (
              <Button
                variant="ghost"
                size="icon"
                title="Resume"
                onClick={() => {
                  if (auth.user) {
                    resumeApplication(row.original.id, auth.user.id);
                  }
                }}
              >
                <Play className="h-4 w-4 text-green-600" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [auth.user, shortlistApplication, resumeApplication]
  );

  const table = useReactTable({
    data: filteredApplications,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleAssign = (requirementId: string, employeeId: string) => {
    if (requirementId && employeeId && auth.user) {
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
    total: applications.length,
    assigned: applications.filter(a => a.status === 'ASSIGNED').length,
    applied: applications.filter(a => a.status === 'APPLIED').length,
    shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
    inInterview: applications.filter(a =>
      a.status === 'INTERVIEW_L1' || a.status === 'INTERVIEW_L2' || a.status === 'HR_ROUND'
    ).length,
    selected: applications.filter(a => a.status === 'SELECTED').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Applications Pipeline</h1>
            <p className="text-muted-foreground mt-1">
              Track candidate applications and progress
            </p>
          </div>
          {auth.user?.role === 'TMG' && (
            <Button onClick={() => setIsAssignDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Candidate
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Assigned</div>
            <div className="text-2xl font-bold mt-1">{stats.assigned}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Applied</div>
            <div className="text-2xl font-bold mt-1">{stats.applied}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Shortlisted</div>
            <div className="text-2xl font-bold mt-1">{stats.shortlisted}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">In Interview</div>
            <div className="text-2xl font-bold mt-1">{stats.inInterview}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Selected</div>
            <div className="text-2xl font-bold mt-1">{stats.selected}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <ExportButton
              data={table.getFilteredRowModel().rows.map(row => {
                const employee = users.find(u => u.id === row.original.employeeId) ||
                                resources.find(r => r.id === row.original.employeeId);
                const requirement = jobRequirements.find(r => r.id === row.original.requirementId);
                return {
                  candidateName: employee?.name || 'Unknown',
                  candidateEmail: employee && 'email' in employee ? employee.email : '-',
                  requirementTitle: requirement?.title || 'Unknown',
                  project: requirement?.projectInfo || '-',
                  currentStage: row.original.currentStage,
                  status: row.original.status,
                  appliedDate: format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
                  lastUpdated: format(new Date(row.original.updatedAt), 'MMM dd, yyyy'),
                };
              })}
              columns={[
                { header: 'Candidate Name', dataKey: 'candidateName', width: 38 },
                { header: 'Email', dataKey: 'candidateEmail', width: 43 },
                { header: 'Requirement', dataKey: 'requirementTitle', width: 43 },
                { header: 'Project', dataKey: 'project', width: 30 },
                { header: 'Stage', dataKey: 'currentStage', width: 26 },
                { header: 'Status', dataKey: 'status', width: 28 },
                { header: 'Applied', dataKey: 'appliedDate', width: 26 },
                { header: 'Updated', dataKey: 'lastUpdated', width: 26 },
              ]}
              filename="applications"
              title="Applications Report"
              subtitle={`Total Applications: ${applications.length} | Active: ${applications.filter((a: Application) => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN').length}`}
              orientation="landscape"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3 flex-wrap">
	            <div className="flex items-center gap-2">
	              <span className="text-sm font-medium">Requirement:</span>
	              <select
	                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm min-w-[200px]"
	                value={selectedRequirement}
	                onChange={(e) => setSelectedRequirement(e.target.value)}
	              >
	                <option value="ALL">All Requirements</option>
	                {jobRequirements.map(req => (
	                  <option key={req.id} value={req.id}>
	                    REQ-{req.id.slice(0, 4)} – {req.title}
	                  </option>
	                ))}
	              </select>
	            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex gap-2">
                {['ALL', 'ASSIGNED', 'APPLIED', 'SHORTLISTED', 'AI_SCREENING'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'ALL' ? 'ALL' : status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Source:</span>
              <select
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="ALL">All Sources</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="SELF_APPLY">Self Apply</option>
              </select>
            </div>

            {(selectedRequirement !== 'ALL' || statusFilter !== 'ALL' || sourceFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRequirement('ALL');
                  setStatusFilter('ALL');
                  setSourceFilter('ALL');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 text-left text-sm font-medium">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Assign Dialog */}
      <EnhancedAssignDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        selectedRequirement={selectedRequirement}
        onAssign={handleAssign}
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
              <Input
                id="rejectReason"
                placeholder="e.g., Skills not matching requirements"
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
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold Dialog */}
      <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold Application</DialogTitle>
            <DialogDescription>
              Put this application on hold temporarily
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holdReason">Reason</Label>
              <Input
                id="holdReason"
                placeholder="e.g., Awaiting candidate response"
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
            <Button variant="outline" onClick={() => setIsHoldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleHold} disabled={!holdReason || !reviewDate}>
              Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Dialog */}
      <InterviewDialog
        application={selectedApplication}
        isOpen={isInterviewDialogOpen}
        onClose={() => {
          setIsInterviewDialogOpen(false);
          setSelectedApplication(null);
        }}
      />

      {/* Move Stage Dialog */}
      <MoveStageDialog
        application={selectedApplication}
        isOpen={isMoveStageDialogOpen}
        onClose={() => {
          setIsMoveStageDialogOpen(false);
          setSelectedApplication(null);
        }}
      />
    </DashboardLayout>
  );
}
