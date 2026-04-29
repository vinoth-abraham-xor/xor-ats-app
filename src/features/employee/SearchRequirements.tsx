import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/core/button';
import { Badge } from '@/components/core/badge';
import { Input } from '@/components/core/input';
import { Search, MapPin, Briefcase, Calendar, Send, ChevronDown, ChevronUp } from 'lucide-react';
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

export function SearchRequirements() {
  const { auth, jobRequirements, applications, addApplication, addNotification } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [applicationNote, setApplicationNote] = useState('');
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  if (!auth.user) return null;

  // Get open requirements
  const openRequirements = jobRequirements.filter(r => r.status === 'OPEN');

  // Get my applications (to check if already applied)
  const myApplications = applications.filter(app => app.employeeId === auth.user!.id);

  const filteredRequirements = useMemo(() => {
    let filtered = openRequirements;

    // Location filter
    if (locationFilter !== 'ALL') {
      filtered = filtered.filter(r => r.location === locationFilter);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        return (
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.projectInfo.toLowerCase().includes(searchLower) ||
          r.skills.some(s => s.toLowerCase().includes(searchLower)) ||
          r.location.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [openRequirements, locationFilter, searchTerm]);

  const uniqueLocations = Array.from(new Set(openRequirements.map(r => r.location)));

  const hasApplied = (reqId: string) => {
    return myApplications.some(app => app.requirementId === reqId);
  };

  const handleApply = () => {
    if (selectedRequirement && auth.user) {
      addApplication({
        requirementId: selectedRequirement,
        employeeId: auth.user.id,
        source: 'SELF_APPLY',
        status: 'APPLIED',
        currentStage: 'Applied',
        applicationNote: applicationNote || undefined,
      });

      addNotification({
        type: 'APPLICATION',
        recipientId: '1',
        title: 'New Self-Application',
        message: `${auth.user.name} applied to a requirement`,
        read: false,
      });

      setIsApplyDialogOpen(false);
      setSelectedRequirement(null);
      setApplicationNote('');
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Browse Open Roles</h1>
          <p className="text-muted-foreground mt-1">
            Find and apply to opportunities that match your skills
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, skills, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="ALL">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {(searchTerm || locationFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('ALL');
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="text-sm text-muted-foreground">
          Found {filteredRequirements.length} open {filteredRequirements.length === 1 ? 'role' : 'roles'}
        </div>

        {/* Requirements List */}
        {filteredRequirements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No matching requirements found</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredRequirements.map(req => {
              const isExpanded = expandedJobs.has(req.id);
              const toggleExpand = () => {
                setExpandedJobs(prev => {
                  const next = new Set(prev);
                  if (next.has(req.id)) {
                    next.delete(req.id);
                  } else {
                    next.add(req.id);
                  }
                  return next;
                });
              };

              return (
                <div key={req.id} className="bg-card rounded-lg border hover:border-primary/50 transition-all">
                  {/* Compact Header - Always Visible */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-base font-semibold line-clamp-1">{req.title}</h3>
                              <Badge variant={getPriorityBadge(req.priority)} className="text-xs">
                                {req.priority}
                              </Badge>
                              {hasApplied(req.id) && (
                                <Badge variant="success" className="text-xs">Applied</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              REQ-{req.id.slice(0, 4)} • {req.projectInfo}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {req.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {req.experience.min}-{req.experience.max} yrs
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {req.deadline ? format(new Date(req.deadline), 'MMM dd, yyyy') : 'No deadline'}
                              </div>
                              <div>{req.positions} position(s)</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequirement(req.id);
                            setIsApplyDialogOpen(true);
                          }}
                          disabled={hasApplied(req.id)}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          {hasApplied(req.id) ? 'Applied' : 'Apply'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={toggleExpand}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Skills Preview (Compact) */}
                    {!isExpanded && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {req.skills.slice(0, 5).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {req.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">+{req.skills.length - 5} more</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t">
                      <div className="space-y-4 mt-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Job Description</div>
                          <p className="text-sm text-muted-foreground">{req.description}</p>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Required Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {req.skills.map(skill => (
                              <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Position</DialogTitle>
            <DialogDescription>
              Submit your application for this opportunity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="applicationNote">Application Note (Optional)</Label>
              <textarea
                id="applicationNote"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
                placeholder="Why are you interested in this role? Highlight relevant experience..."
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Your profile and skills will be automatically submitted with this application.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              <Send className="mr-2 h-4 w-4" />
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
