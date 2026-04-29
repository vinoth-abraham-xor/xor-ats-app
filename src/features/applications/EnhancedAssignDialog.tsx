import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Badge } from '@/components/core/badge';
import { SearchableRequirementSelect } from '@/components/core/searchable-requirement-select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/core/dialog';
import { Search, User } from 'lucide-react';

interface EnhancedAssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequirement?: string;
  onAssign: (requirementId: string, employeeId: string) => void;
}

export function EnhancedAssignDialog({
  isOpen,
  onClose,
  selectedRequirement: initialRequirement,
  onAssign,
}: EnhancedAssignDialogProps) {
  const { resources, jobRequirements, applications } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [selectedRequirement, setSelectedRequirement] = useState<string>(initialRequirement || '');

  // Update when prop changes
  useState(() => {
    if (initialRequirement) {
      setSelectedRequirement(initialRequirement);
    }
  });

  // Filter candidates: available, not archived, no existing application
  const filteredCandidates = useMemo(() => {
    let candidates = resources.filter(r => 
      r.status === 'AVAILABLE' || r.status === 'IN_INTERVIEW'
    );

    // Exclude candidates who already have an application for this requirement
    if (selectedRequirement && selectedRequirement !== 'ALL') {
      candidates = candidates.filter(c => 
        !applications.some(app => 
          app.requirementId === selectedRequirement && app.employeeId === c.id
        )
      );
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      candidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.designation.toLowerCase().includes(searchLower) ||
        c.skills.some(s => s.name.toLowerCase().includes(searchLower)) ||
        c.location.toLowerCase().includes(searchLower)
      );
    }

    return candidates;
  }, [resources, searchTerm, selectedRequirement, applications]);

  const handleAssign = () => {
    if (selectedCandidate && selectedRequirement) {
      onAssign(selectedRequirement, selectedCandidate);
      setSelectedCandidate('');
      setSearchTerm('');
      setSelectedRequirement('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Candidate to Requirement</DialogTitle>
          <DialogDescription>
            Select a requirement and candidate to create an assignment
          </DialogDescription>
        </DialogHeader>

        {/* Requirement Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Requirement</label>
          <SearchableRequirementSelect
            requirements={jobRequirements.filter(r => r.status === 'OPEN')}
            value={selectedRequirement}
            onChange={setSelectedRequirement}
            placeholder="Search and select a requirement"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, skills, designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchTerm ? 'No candidates match your search' : 'No available candidates'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedCandidate === candidate.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{candidate.name}</span>
                        <Badge variant="secondary" className="text-xs">{candidate.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {candidate.email} • {candidate.designation}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{candidate.experience} yrs exp</span>
                        <span>•</span>
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 5).map(skill => (
                          <Badge key={skill.name} variant="outline" className="text-[10px]">
                            {skill.name}
                          </Badge>
                        ))}
                        {candidate.skills.length > 5 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{candidate.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    {selectedCandidate === candidate.id && (
                      <div className="ml-4">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setSelectedCandidate(''); setSearchTerm(''); setSelectedRequirement(''); }}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedCandidate || !selectedRequirement}>
            Assign Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
