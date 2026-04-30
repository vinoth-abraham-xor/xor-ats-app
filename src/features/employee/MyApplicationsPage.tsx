import { useMemo, useState } from 'react';
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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/core/button';
import { Badge } from '@/components/core/badge';
import { Input } from '@/components/core/input';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ExportButton } from '@/components/ExportButton';
import { useNavigate } from 'react-router-dom';
import type { Application } from '@/types';

interface ApplicationWithDetails extends Application {
  requirementTitle: string;
  requirementLocation: string;
  requirementStatus: string;
}

export function MyApplicationsPage() {
  const { applications, jobRequirements, auth } = useStore();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const isAdmin = auth.user && ['ADMIN', 'HR', 'TMG', 'MANAGER'].includes(auth.user.role);
  const currentUserId = auth.user?.id;

  // Filter applications based on user role
  const myApplications = useMemo((): ApplicationWithDetails[] => {
    let filtered = applications;

    // If not admin, show only user's applications
    if (!isAdmin && currentUserId) {
      filtered = applications.filter(app => app.employeeId === currentUserId);
    }

    return filtered.map(app => {
      const requirement = jobRequirements.find(r => r.id === app.requirementId);
      return {
        ...app,
        requirementTitle: requirement?.title || 'Unknown',
        requirementLocation: requirement?.location || '-',
        requirementStatus: requirement?.status || '-',
      };
    });
  }, [applications, jobRequirements, isAdmin, currentUserId]);

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'SELECTED' || status === 'COMPLETED') return 'default';
    if (status === 'REJECTED' || status === 'WITHDRAWN') return 'destructive';
    if (status === 'ON_HOLD') return 'secondary';
    return 'outline';
  };

  const columns = useMemo<ColumnDef<ApplicationWithDetails>[]>(
    () => [
      {
        accessorKey: 'requirementTitle',
        header: 'Requirement',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.requirementTitle}</div>
            <div className="text-xs text-muted-foreground">{row.original.requirementLocation}</div>
          </div>
        ),
      },
      {
        accessorKey: 'currentStage',
        header: 'Current Stage',
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.currentStage.replace(/_/g, ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={getStatusVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.source === 'ASSIGNED' ? 'Assigned' : 'Self Applied'}
          </Badge>
        ),
      },
      {
        accessorKey: 'aiScore',
        header: 'AI Score',
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.aiScore ? (
              <span className="font-medium">{row.original.aiScore.toFixed(1)}%</span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Applied On',
        cell: ({ row }) => (
          <div className="text-sm">{format(new Date(row.original.createdAt), 'MMM dd, yyyy')}</div>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        cell: ({ row }) => (
          <div className="text-sm">{format(new Date(row.original.updatedAt), 'MMM dd, yyyy')}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/applications?highlight=${row.original.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        ),
      },
    ],
    [navigate]
  );

  const table = useReactTable({
    data: myApplications,
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'All Applications Tracking' : 'My Applications'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? 'Track all employee applications across requirements'
              : 'Track your job applications and their current status'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">Total Applications</div>
            <div className="text-2xl font-bold">{myApplications.length}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold">
              {myApplications.filter(a => !['REJECTED', 'WITHDRAWN', 'COMPLETED'].includes(a.status)).length}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">Selected</div>
            <div className="text-2xl font-bold">
              {myApplications.filter(a => a.status === 'SELECTED' || a.status === 'COMPLETED').length}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">In Progress</div>
            <div className="text-2xl font-bold">
              {myApplications.filter(a => ['APPLIED', 'SHORTLISTED', 'AI_SCREENING', 'INTERVIEW_L1', 'INTERVIEW_L2', 'HR_ROUND'].includes(a.status)).length}
            </div>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <ExportButton
            data={table.getFilteredRowModel().rows.map(row => ({
              requirement: row.original.requirementTitle,
              location: row.original.requirementLocation,
              currentStage: row.original.currentStage,
              status: row.original.status,
              source: row.original.source,
              aiScore: row.original.aiScore ? row.original.aiScore.toFixed(1) : '-',
              appliedOn: format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
              lastUpdated: format(new Date(row.original.updatedAt), 'MMM dd, yyyy'),
            }))}
            columns={[
              { header: 'Requirement', dataKey: 'requirement', width: 50 },
              { header: 'Location', dataKey: 'location', width: 30 },
              { header: 'Current Stage', dataKey: 'currentStage', width: 35 },
              { header: 'Status', dataKey: 'status', width: 28 },
              { header: 'Source', dataKey: 'source', width: 25 },
              { header: 'AI Score', dataKey: 'aiScore', width: 22 },
              { header: 'Applied On', dataKey: 'appliedOn', width: 28 },
              { header: 'Last Updated', dataKey: 'lastUpdated', width: 28 },
            ]}
            filename={isAdmin ? 'all-applications-tracking' : 'my-applications'}
            title={isAdmin ? 'All Applications Tracking' : 'My Applications'}
            subtitle={`Total: ${myApplications.length} | Active: ${myApplications.filter(a => !['REJECTED', 'WITHDRAWN', 'COMPLETED'].includes(a.status)).length}`}
            orientation="landscape"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b bg-muted/50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                      {isAdmin ? 'No applications found' : 'You have no applications yet'}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of {myApplications.length} applications
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

