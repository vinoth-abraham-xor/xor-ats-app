import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/core/button';
import { Badge } from '@/components/core/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/core/card';
import { SearchableRequirementSelect } from '@/components/core/searchable-requirement-select';
import { rankCandidates } from '@/utils/aiRanking';
import type { BenchResource, JobRequirement } from '@/types';

export function AIRankingPage() {
  const { jobRequirements, resources, applications, assignCandidate } = useStore();

  const [selectedRequirementId, setSelectedRequirementId] = useState<string>(
    () => jobRequirements[0]?.id ?? ''
  );

  const selectedRequirement: JobRequirement | undefined =
    jobRequirements.find(r => r.id === selectedRequirementId) || jobRequirements[0];

  const candidates: BenchResource[] = useMemo(() => {
    // Consider only available / interview resources for screening
    return resources.filter(r => r.status === 'AVAILABLE' || r.status === 'IN_INTERVIEW');
  }, [resources]);

  const ranked = useMemo(() => {
    if (!selectedRequirement) return [];

    const rankedList = rankCandidates(candidates, selectedRequirement);

    return rankedList.map(entry => {
      const hasExistingApplication = applications.some(
        app =>
          app.requirementId === selectedRequirement.id &&
          app.employeeId === entry.candidate.id
      );
      return {
        ...entry,
        hasExistingApplication,
      };
    });
  }, [candidates, selectedRequirement, applications]);

  const handleAssign = (candidateId: string) => {
    if (!selectedRequirement) return;

    // Prevent duplicate assignments/applications
    const alreadyExists = applications.some(
      app =>
        app.requirementId === selectedRequirement.id &&
        app.employeeId === candidateId
    );

    if (!alreadyExists) {
      assignCandidate(selectedRequirement.id, candidateId, 'AI_SCREENING');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Ranking & Screening</h1>
          <p className="text-muted-foreground mt-1">
            Compare bench resources against a requirement using the AI skill and experience matcher
          </p>
        </div>

        {/* Requirement selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1 flex-1 min-w-[300px] max-w-[500px]">
            <div className="text-sm font-medium">Requirement</div>
            <SearchableRequirementSelect
              requirements={jobRequirements}
              value={selectedRequirement?.id ?? ''}
              onChange={setSelectedRequirementId}
              placeholder="Search and select a requirement"
              disabled={jobRequirements.length === 0}
            />
          </div>

          {selectedRequirement && (
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant="secondary">Location: {selectedRequirement.location}</Badge>
              <Badge variant="secondary">
                Experience: {selectedRequirement.experience.min}-
                {selectedRequirement.experience.max} yrs
              </Badge>
              <Badge variant="secondary">Priority: {selectedRequirement.priority}</Badge>
            </div>
          )}
        </div>

        {selectedRequirement ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Ranked Candidates</h2>
                <p className="text-sm text-muted-foreground">
                  Showing bench resources ordered by AI score (skills + experience match)
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {ranked.length} candidate{ranked.length === 1 ? '' : 's'} considered
              </div>
            </div>

            {ranked.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-muted/30">
                No bench resources available for AI screening.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {ranked.map(({ candidate, aiScore, skillMatchDetails, hasExistingApplication }) => (
                  <Card key={candidate.id} className="border">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base flex flex-col gap-1">
                          <span>{candidate.name}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {candidate.email}
                          </span>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground mt-1">
                          {candidate.designation} · {candidate.experience} yrs · {candidate.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-muted-foreground">AI Score</div>
                        <div className="text-2xl font-bold">{aiScore}%</div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          Skills
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedRequirement.skills.map(skill => (
                            <Badge key={skill} variant="secondary" className="text-[11px]">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {skillMatchDetails && (
                        <div className="grid grid-cols-3 gap-3 text-[11px]">
                          <div>
                            <div className="font-medium mb-1">Matched</div>
                            <div className="space-x-1">
                              {skillMatchDetails.matched.slice(0, 4).map(s => (
                                <Badge key={s} variant="outline" className="text-[10px]">
                                  {s}
                                </Badge>
                              ))}
                              {skillMatchDetails.matched.length > 4 && (
                                <span>+{skillMatchDetails.matched.length - 4}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-1">Missing</div>
                            <div className="space-x-1">
                              {skillMatchDetails.missing.slice(0, 3).map(s => (
                                <Badge key={s} variant="outline" className="text-[10px]">
                                  {s}
                                </Badge>
                              ))}
                              {skillMatchDetails.missing.length === 0 && (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-1">Extra</div>
                            <div className="space-x-1">
                              {skillMatchDetails.extra.slice(0, 3).map(s => (
                                <Badge key={s} variant="outline" className="text-[10px]">
                                  {s}
                                </Badge>
                              ))}
                              {skillMatchDetails.extra.length === 0 && (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <div className="text-xs text-muted-foreground">
                          {hasExistingApplication
                            ? 'Already has an application for this requirement.'
                            : 'No existing application yet.'}
                        </div>
                        <Button
                          size="sm"
                          disabled={!selectedRequirement || hasExistingApplication}
                          onClick={() => handleAssign(candidate.id)}
                        >
                          {hasExistingApplication ? 'Already in Pipeline' : 'Assign to Requirement'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-muted/30">
            No requirements available. Create a requirement first to use AI ranking.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
