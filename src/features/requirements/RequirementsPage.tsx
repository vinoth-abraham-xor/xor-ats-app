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
import type { JobRequirement } from '@/types';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Badge } from '@/components/core/badge';
import { Plus, Search, Pause, Play, Edit, ArrowUpDown, Filter, Eye, Calendar, Users, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { ExportButton } from '@/components/ExportButton';

export function RequirementsPage() {
  const navigate = useNavigate();
  const { jobRequirements, addJobRequirement, updateJobRequirement, holdRequirement, resumeRequirement, auth, applications } = useStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [holdReason, setHoldReason] = useState('');
  const [reviewDate, setReviewDate] = useState('');

  // Form state for create/edit
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    projectInfo: string;
    skills: string;
    experienceMin: number;
    experienceMax: number;
    positions: number;
    location: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    deadline: string;
  }>({
    title: '',
    description: '',
    projectInfo: '',
    skills: '',
    experienceMin: 0,
    experienceMax: 0,
    positions: 1,
    location: '',
    priority: 'MEDIUM',
    deadline: '',
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
      DRAFT: 'secondary',
      OPEN: 'success',
      ON_HOLD: 'warning',
      CLOSED_FILLED: 'info',
      CLOSED_CANCELLED: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
      URGENT: 'destructive',
      HIGH: 'warning',
      MEDIUM: 'info',
      LOW: 'secondary',
    };
    return variants[priority] || 'secondary';
  };

  const getApplicationCount = (reqId: string) => {
    return applications.filter(app => app.requirementId === reqId).length;
  };

  const filteredRequirements = useMemo(() => {
    let filtered = jobRequirements;

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    // Location filter
    if (locationFilter !== 'ALL') {
      filtered = filtered.filter(req => req.location === locationFilter);
    }

    // Global search filter
    if (globalFilter) {
      const searchLower = globalFilter.toLowerCase();
      filtered = filtered.filter(req => {
        const requirementId = `req-${req.id.slice(0, 4)}`.toLowerCase();
        const title = req.title.toLowerCase();
        const description = req.description.toLowerCase();
        const projectInfo = req.projectInfo.toLowerCase();
        const skills = req.skills.join(' ').toLowerCase();
        const location = req.location.toLowerCase();
        const status = req.status.toLowerCase();
        const priority = req.priority.toLowerCase();

        // Search across all relevant fields
        return (
          requirementId.includes(searchLower) ||
          title.includes(searchLower) ||
          description.includes(searchLower) ||
          projectInfo.includes(searchLower) ||
          skills.includes(searchLower) ||
          location.includes(searchLower) ||
          status.includes(searchLower) ||
          priority.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [jobRequirements, statusFilter, priorityFilter, locationFilter, globalFilter]);

  const uniqueLocations = Array.from(new Set(jobRequirements.map(r => r.location)));

  const columns = useMemo<ColumnDef<JobRequirement>[]>(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Job Requirement
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-lg">
            <div className="text-xs text-muted-foreground mb-0.5">REQ-{row.original.id.slice(0, 4)}</div>
            <div className="font-semibold text-base leading-tight mb-1" title={row.original.title}>
              {row.original.title}
            </div>
            <div className="text-xs text-muted-foreground mb-2 line-clamp-1" title={row.original.projectInfo}>
              {row.original.projectInfo}
            </div>
            <div className="flex flex-wrap gap-1">
              {row.original.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {row.original.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{row.original.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        size: 400,
      },
      {
        accessorKey: 'details',
        header: 'Details',
        cell: ({ row }) => (
          <div className="text-sm space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>{row.original.experience.min}-{row.original.experience.max} years</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>{row.original.positions} position{row.original.positions > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{row.original.location}</span>
            </div>
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: 'priority',
        header: 'Priority & Status',
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant={getPriorityBadge(row.original.priority)} className="text-xs">
              {row.original.priority}
            </Badge>
            <div>
              <Badge variant={getStatusBadge(row.original.status)} className="text-xs">
                {row.original.status.replace('_', ' ')}
              </Badge>
            </div>
            {row.original.status === 'ON_HOLD' && row.original.holdReason && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1" title={row.original.holdReason}>
                {row.original.holdReason}
              </div>
            )}
          </div>
        ),
        size: 130,
      },
      {
        accessorKey: 'deadline',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Deadline
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) =>
          row.original.deadline ? format(new Date(row.original.deadline), 'MMM dd, yyyy') : '-',
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.deadline ? new Date(rowA.original.deadline).getTime() : 0;
          const dateB = rowB.original.deadline ? new Date(rowB.original.deadline).getTime() : 0;
          return dateA - dateB;
        },
        enableSorting: true,
        size: 120,
      },
      {
        accessorKey: 'applications',
        header: 'Applications',
        cell: ({ row }) => {
          const appliedCount = getApplicationCount(row.original.id);
          const totalPositions = row.original.positions;
          const percentage = totalPositions > 0 ? (appliedCount / totalPositions) * 100 : 0;

          return (
            <div className="space-y-1">
              <div className="text-sm font-medium">
                {appliedCount} / {totalPositions}
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    percentage >= 100 ? 'bg-green-500' :
                    percentage >= 50 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        },
        size: 120,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="View Details"
              onClick={() => navigate(`/requirements/${row.original.id}`)}
            >
              <Eye className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Edit Requirement"
              onClick={() => openEditDialog(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {row.original.status === 'OPEN' && (
              <Button
                variant="ghost"
                size="icon"
                title="Hold Requirement"
                onClick={() => {
                  setSelectedRequirement(row.original);
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
                title="Resume Requirement"
                onClick={() => {
                  if (auth.user) {
                    resumeRequirement(row.original.id, auth.user.id);
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
    [applications, auth.user, resumeRequirement, navigate]
  );

  const table = useReactTable({
    data: filteredRequirements,
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

  const handleHold = () => {
    if (selectedRequirement && auth.user && holdReason && reviewDate) {
      holdRequirement(selectedRequirement.id, holdReason, reviewDate, auth.user.id);
      setIsHoldDialogOpen(false);
      setHoldReason('');
      setReviewDate('');
      setSelectedRequirement(null);
    }
  };

  const handleCreateRequirement = () => {
    if (auth.user && formData.title && formData.description) {
      addJobRequirement({
        title: formData.title,
        description: formData.description,
        projectInfo: formData.projectInfo,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: {
          min: formData.experienceMin,
          max: formData.experienceMax,
        },
        positions: formData.positions,
        location: formData.location,
        status: 'OPEN',
        priority: formData.priority,
        deadline: formData.deadline || undefined,
        createdBy: auth.user.id,
      });
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditRequirement = () => {
    if (selectedRequirement && auth.user && formData.title && formData.description) {
      updateJobRequirement(selectedRequirement.id, {
        title: formData.title,
        description: formData.description,
        projectInfo: formData.projectInfo,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: {
          min: formData.experienceMin,
          max: formData.experienceMax,
        },
        positions: formData.positions,
        location: formData.location,
        priority: formData.priority,
        deadline: formData.deadline || undefined,
      });
      setIsCreateDialogOpen(false);
      setIsEditMode(false);
      setSelectedRequirement(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      projectInfo: '',
      skills: '',
      experienceMin: 0,
      experienceMax: 0,
      positions: 1,
      location: '',
      priority: 'MEDIUM',
      deadline: '',
    });
  };

  const openEditDialog = (req: JobRequirement) => {
    setSelectedRequirement(req);
    setIsEditMode(true);
    setFormData({
      title: req.title,
      description: req.description,
      projectInfo: req.projectInfo,
      skills: req.skills.join(', '),
      experienceMin: req.experience.min,
      experienceMax: req.experience.max,
      positions: req.positions,
      location: req.location,
      priority: req.priority,
      deadline: req.deadline || '',
    });
    setIsCreateDialogOpen(true);
  };

  const stats = {
    open: jobRequirements.filter(r => r.status === 'OPEN').length,
    onHold: jobRequirements.filter(r => r.status === 'ON_HOLD').length,
    closed: jobRequirements.filter(r => r.status.startsWith('CLOSED')).length,
    totalPositions: jobRequirements.reduce((sum, r) => sum + r.positions, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Requirements</h1>
            <p className="text-muted-foreground mt-1">
              Manage open positions and track applications
            </p>
          </div>
          <Button onClick={() => {
            setIsEditMode(false);
            resetForm();
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Requirement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Open</div>
            <div className="text-2xl font-bold mt-1">{stats.open}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">On Hold</div>
            <div className="text-2xl font-bold mt-1">{stats.onHold}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Closed</div>
            <div className="text-2xl font-bold mt-1">{stats.closed}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Positions</div>
            <div className="text-2xl font-bold mt-1">{stats.totalPositions}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requirements..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters:</span>
            </div>
            <ExportButton
              data={table.getFilteredRowModel().rows.map(row => {
                const appCount = applications.filter(app => app.requirementId === row.original.id).length;
                return {
                  title: row.original.title,
                  project: row.original.projectInfo,
                  location: row.original.location,
                  experience: `${row.original.experience.min}-${row.original.experience.max} years`,
                  positions: row.original.positions,
                  applications: appCount,
                  status: row.original.status,
                  priority: row.original.priority,
                  createdDate: format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
                  deadline: row.original.deadline ? format(new Date(row.original.deadline), 'MMM dd, yyyy') : '-',
                };
              })}
              columns={[
                { header: 'Title', dataKey: 'title', width: 45 },
                { header: 'Project', dataKey: 'project', width: 38 },
                { header: 'Location', dataKey: 'location', width: 28 },
                { header: 'Experience', dataKey: 'experience', width: 24 },
                { header: 'Pos', dataKey: 'positions', width: 18 },
                { header: 'Apps', dataKey: 'applications', width: 18 },
                { header: 'Status', dataKey: 'status', width: 22 },
                { header: 'Priority', dataKey: 'priority', width: 20 },
                { header: 'Created', dataKey: 'createdDate', width: 28 },
                { header: 'Deadline', dataKey: 'deadline', width: 28 },
              ]}
              filename="job-requirements"
              title="Job Requirements Report"
              subtitle={`Total Requirements: ${jobRequirements.length} | Open: ${jobRequirements.filter((r: JobRequirement) => r.status === 'OPEN').length}`}
              orientation="landscape"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex gap-2">
                {['ALL', 'OPEN', 'ON_HOLD', 'CLOSED_FILLED'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Priority:</span>
              <select
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Location:</span>
              <select
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="ALL">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || locationFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setLocationFilter('ALL');
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Requirement Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Requirement' : 'Create New Requirement'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update requirement details' : 'Add a new job requirement to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Full Stack Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Detailed job description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="projectInfo">Project/Client Info *</Label>
                <Input
                  id="projectInfo"
                  placeholder="e.g., TechCorp Solutions - E-commerce Platform"
                  value={formData.projectInfo}
                  onChange={(e) => setFormData({ ...formData, projectInfo: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="skills">Required Skills (comma-separated) *</Label>
                <Input
                  id="skills"
                  placeholder="e.g., React, Node.js, TypeScript, AWS"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expMin">Min Experience (years) *</Label>
                <Input
                  id="expMin"
                  type="number"
                  min="0"
                  value={formData.experienceMin}
                  onChange={(e) => setFormData({ ...formData, experienceMin: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expMax">Max Experience (years) *</Label>
                <Input
                  id="expMax"
                  type="number"
                  min="0"
                  value={formData.experienceMax}
                  onChange={(e) => setFormData({ ...formData, experienceMax: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="positions">Number of Positions *</Label>
                <Input
                  id="positions"
                  type="number"
                  min="1"
                  value={formData.positions}
                  onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Pune, Bangalore"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditMode(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={isEditMode ? handleEditRequirement : handleCreateRequirement}
              disabled={!formData.title || !formData.description || !formData.projectInfo}
            >
              {isEditMode ? 'Update Requirement' : 'Create Requirement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold Dialog */}
      <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold Requirement</DialogTitle>
            <DialogDescription>
              Put this requirement on hold. You can resume it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holdReason">Reason for Hold</Label>
              <Input
                id="holdReason"
                placeholder="e.g., Budget approval pending"
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
              Hold Requirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
