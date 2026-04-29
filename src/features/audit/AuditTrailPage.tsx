import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { FileText, Download, Filter, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function AuditTrailPage() {
  const { users, resources } = useStore();
  const [filterEntityType, setFilterEntityType] = useState<string>('ALL');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  // Mock audit logs for demo (in production, this would come from store)
  const auditLogs: any[] = [];

  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    if (filterEntityType !== 'ALL') {
      filtered = filtered.filter((log: any) => log.entityType === filterEntityType);
    }

    if (filterAction !== 'ALL') {
      filtered = filtered.filter((log: any) => log.action === filterAction);
    }

    return filtered.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [auditLogs, filterEntityType, filterAction]);

  const getActorName = (actorId: string) => {
    const user = users.find(u => u.id === actorId);
    if (user) return user.name;
    const bench = resources.find(b => b.id === actorId);
    if (bench) return bench.name;
    return 'System';
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'success' | 'info' | 'warning' | 'destructive' | 'secondary'> = {
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'destructive',
      STATUS_CHANGE: 'warning',
      ASSIGN: 'info',
      APPROVE: 'success',
      REJECT: 'destructive',
    };
    return variants[action] || 'secondary';
  };

  const exportAuditLog = () => {
    const csv = [
      ['Timestamp', 'Entity Type', 'Action', 'Actor', 'Changes'],
      ...filteredLogs.map((log: any) => [
        format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        log.entityType,
        log.action,
        getActorName(log.actorId),
        JSON.stringify(log.changes),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const entityTypes: string[] = ['ALL', ...Array.from(new Set(auditLogs.map((l: any) => l.entityType)))];
  const actions: string[] = ['ALL', ...Array.from(new Set(auditLogs.map((l: any) => l.action)))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Audit Trail
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete history of all system changes
            </p>
          </div>
          <Button onClick={exportAuditLog}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Entity:</label>
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
              >
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Action:</label>
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            {(filterEntityType !== 'ALL' || filterAction !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterEntityType('ALL');
                  setFilterAction('ALL');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Events</div>
            <div className="text-2xl font-bold mt-1">{auditLogs.length}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Today</div>
            <div className="text-2xl font-bold mt-1">
              {auditLogs.filter((log: any) => {
                const today = new Date();
                const logDate = new Date(log.createdAt);
                return logDate.toDateString() === today.toDateString();
              }).length}
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">This Week</div>
            <div className="text-2xl font-bold mt-1">
              {auditLogs.filter((log: any) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(log.createdAt) >= weekAgo;
              }).length}
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Filtered Results</div>
            <div className="text-2xl font-bold mt-1">{filteredLogs.length}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Timeline
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No audit logs found
              </div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getActionBadge(log.action)}>
                            {log.action}
                          </Badge>
                          <Badge variant="outline">{log.entityType}</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {getActorName(log.actorId)}
                          </span>
                        </div>
                        <div className="text-sm mb-2">
                          Entity ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{log.entityId}</code>
                        </div>
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="bg-muted p-2 rounded text-xs mb-2">
                            <div className="font-mono">
                              {Object.entries(log.changes).map(([key, value]: [string, any]) => (
                                <div key={key} className="mb-1">
                                  <span className="font-semibold">{key}:</span>{' '}
                                  {value.from !== undefined && (
                                    <>
                                      <span className="text-red-600">{JSON.stringify(value.from)}</span>
                                      {' → '}
                                      <span className="text-green-600">{JSON.stringify(value.to)}</span>
                                    </>
                                  )}
                                  {value.from === undefined && JSON.stringify(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), 'MMM dd, yyyy hh:mm:ss a')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
