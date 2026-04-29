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
} from '@tanstack/react-table';
import { useStore } from '@/store';
import type { BenchResource } from '@/types';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Badge } from '@/components/core/badge';
import { Plus, Search, Archive, ArchiveRestore, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Label } from '@/components/core/label';

export function ResourcesPage() {
  const { resources, addResource, archiveResource, unarchiveResource, auth } = useStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<BenchResource | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    skills: '',
    experience: 0,
    location: '',
    domain: '',
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
      AVAILABLE: 'success',
      IN_INTERVIEW: 'warning',
      ALLOCATED: 'info',
      UNAVAILABLE: 'secondary',
      ARCHIVED: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const handleAddResource = () => {
    if (formData.name && formData.email && formData.designation && formData.skills) {
      addResource({
        name: formData.name,
        email: formData.email,
        phone: '',
        designation: formData.designation,
        skills: formData.skills.split(',').map(s => ({
          name: s.trim(),
          level: 'INTERMEDIATE' as const,
        })).filter(s => s.name),
        experience: formData.experience,
        location: formData.location,
        preferredLocation: [formData.location],
        noticePeriod: 0,
        status: 'AVAILABLE',
        availability: new Date().toISOString(),
      });
      setFormData({
        name: '',
        email: '',
        designation: '',
        skills: '',
        experience: 0,
        location: '',
        domain: '',
      });
      setIsAddDialogOpen(false);
    }
  };

  const columns = useMemo<ColumnDef<BenchResource>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Candidate',
        cell: ({ row }) => (
          <div className="max-w-[220px]">
            <div className="font-medium text-sm">{row.original.name}</div>
            <div className="text-xs text-muted-foreground truncate" title={row.original.email}>
              {row.original.email}
            </div>
            {row.original.phone && (
              <div className="text-xs text-muted-foreground">
                {row.original.phone}
              </div>
            )}
          </div>
        ),
        size: 220,
      },
      {
        accessorKey: 'designation',
        header: 'Role & Experience',
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium">{row.original.designation}</div>
            <div className="text-xs text-muted-foreground">{row.original.experience} years</div>
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: 'skills',
        header: 'Skills',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.skills.slice(0, 4).map((skill) => (
              <Badge key={skill.name} variant="secondary" className="text-xs">
                {skill.name}
              </Badge>
            ))}
            {row.original.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{row.original.skills.length - 4}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <div className="text-sm">{row.original.location}</div>
        ),
        size: 100,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={getStatusBadge(row.original.status)} className="text-xs">
            {row.original.status}
          </Badge>
        ),
        size: 120,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.status === 'ARCHIVED' ? (
              <Button
                variant="ghost"
                size="sm"
                title="Unarchive"
                onClick={() => {
                  if (auth.user) {
                    unarchiveResource(row.original.id, auth.user.id);
                  }
                }}
              >
                <ArchiveRestore className="h-4 w-4 mr-1" />
                Unarchive
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                title="Archive"
                onClick={() => {
                  setSelectedResource(row.original);
                  setIsArchiveDialogOpen(true);
                }}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            )}
          </div>
        ),
      },
    ],
    [auth.user, unarchiveResource]
  );

  const filteredData = useMemo(() => {
    if (showArchived) {
      return resources.filter(r => r.status === 'ARCHIVED');
    }
    return resources.filter(r => r.status !== 'ARCHIVED');
  }, [resources, showArchived]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
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

  const stats = {
    total: resources.filter(r => r.status !== 'ARCHIVED').length,
    available: resources.filter(r => r.status === 'AVAILABLE').length,
    inInterview: resources.filter(r => r.status === 'IN_INTERVIEW').length,
    allocated: resources.filter(r => r.status === 'ALLOCATED').length,
    archived: resources.filter(r => r.status === 'ARCHIVED').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Resources</h1>
            <p className="text-muted-foreground mt-1">
              Manage all employee resources in the organization - they can login with password: <strong>password</strong>
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active Resources</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-2xl font-bold mt-1">{stats.available}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">In Interview</div>
            <div className="text-2xl font-bold mt-1">{stats.inInterview}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Allocated</div>
            <div className="text-2xl font-bold mt-1">{stats.allocated}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Archived</div>
            <div className="text-2xl font-bold mt-1">{stats.archived}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showArchived ? 'default' : 'outline'}
            onClick={() => setShowArchived(!showArchived)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
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

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length} of {resources.length} resources
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Resource Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Bench Resource</DialogTitle>
            <DialogDescription>
              Create a new employee. They can login with email and default password: <strong>password</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Login Username) *</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john.doe@xoriant.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                placeholder="e.g., Senior Developer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years) *</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="skills">Skills (comma-separated) *</Label>
              <Input
                id="skills"
                placeholder="e.g., React, Node.js, TypeScript"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Pune"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain (optional)</Label>
              <Input
                id="domain"
                placeholder="e.g., FinTech, Healthcare"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddResource}
              disabled={!formData.name || !formData.email || !formData.designation || !formData.skills || !formData.location}
            >
              Add Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Bench Resource</DialogTitle>
            <DialogDescription>
              Move this resource out of active bench. They will no longer appear in assignment lists.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedResource && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="font-medium">{selectedResource.name}</div>
                <div className="text-muted-foreground">{selectedResource.email}</div>
                <div className="text-muted-foreground">{selectedResource.designation}</div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="archiveReason">Reason for Archiving</Label>
              <textarea
                id="archiveReason"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                placeholder="e.g., Resigned, Moved to another project, Relocated, etc."
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                This will be recorded in the audit trail for historical tracking
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsArchiveDialogOpen(false); setArchiveReason(''); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedResource && auth.user && archiveReason) {
                  archiveResource(selectedResource.id, archiveReason, auth.user.id);
                  setIsArchiveDialogOpen(false);
                  setArchiveReason('');
                  setSelectedResource(null);
                }
              }}
              disabled={!archiveReason}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
