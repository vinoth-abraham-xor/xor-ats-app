import type { BenchResource, JobRequirement } from '@/types';

/**
 * Calculate skill match score between candidate and requirement
 * @param candidateSkills - Array of candidate's skills
 * @param requiredSkills - Array of required skills for the job
 * @returns Score between 0-100
 */
export function calculateSkillMatch(
  candidateSkills: BenchResource['skills'],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 0;
  if (candidateSkills.length === 0) return 0;

  const candidateSkillNames = candidateSkills.map(s => s.name.toLowerCase());
  
  // Count matching skills
  const matches = requiredSkills.filter(reqSkill =>
    candidateSkillNames.some(candSkill => 
      candSkill.includes(reqSkill.toLowerCase()) || 
      reqSkill.toLowerCase().includes(candSkill)
    )
  );

  // Calculate base score
  const baseScore = (matches.length / requiredSkills.length) * 100;

  // Bonus for skill level (if matched)
  let levelBonus = 0;
  matches.forEach(matchedSkill => {
    const candidateSkill = candidateSkills.find(cs => 
      cs.name.toLowerCase().includes(matchedSkill.toLowerCase()) ||
      matchedSkill.toLowerCase().includes(cs.name.toLowerCase())
    );
    if (candidateSkill) {
      // Add bonus based on skill level
      switch (candidateSkill.level) {
        case 'EXPERT':
          levelBonus += 2;
          break;
        case 'ADVANCED':
          levelBonus += 1.5;
          break;
        case 'INTERMEDIATE':
          levelBonus += 1;
          break;
        case 'BEGINNER':
          levelBonus += 0.5;
          break;
      }
    }
  });

  // Final score with level bonus (capped at 100)
  const finalScore = Math.min(100, baseScore + levelBonus);
  
  return Math.round(finalScore);
}

/**
 * Calculate experience match score
 * @param candidateExperience - Candidate's years of experience
 * @param requiredExperience - Required experience range
 * @returns Score between 0-100
 */
export function calculateExperienceMatch(
  candidateExperience: number,
  requiredExperience: { min: number; max: number }
): number {
  if (candidateExperience < requiredExperience.min) {
    // Below minimum - penalize proportionally
    const deficit = requiredExperience.min - candidateExperience;
    return Math.max(0, 100 - (deficit * 20));
  } else if (candidateExperience > requiredExperience.max) {
    // Above maximum - slight penalty (overqualified)
    const excess = candidateExperience - requiredExperience.max;
    return Math.max(60, 100 - (excess * 5));
  } else {
    // Within range - full score
    return 100;
  }
}

/**
 * Calculate overall AI score for a candidate-requirement match
 * @param candidate - Bench resource (candidate)
 * @param requirement - Job requirement
 * @returns Overall score between 0-100
 */
export function calculateAIScore(
  candidate: BenchResource,
  requirement: JobRequirement
): number {
  // Weights for different factors
  const SKILL_WEIGHT = 0.7;
  const EXPERIENCE_WEIGHT = 0.3;

  const skillScore = calculateSkillMatch(candidate.skills, requirement.skills);
  const experienceScore = calculateExperienceMatch(
    candidate.experience,
    requirement.experience
  );

  const overallScore = (
    skillScore * SKILL_WEIGHT +
    experienceScore * EXPERIENCE_WEIGHT
  );

  return Math.round(overallScore);
}

/**
 * Get skill match details for explainability
 * @param candidateSkills - Candidate's skills
 * @param requiredSkills - Required skills
 * @returns Object with matched, missing, and extra skills
 */
export function getSkillMatchDetails(
  candidateSkills: BenchResource['skills'],
  requiredSkills: string[]
) {
  const candidateSkillNames = candidateSkills.map(s => s.name.toLowerCase());
  
  const matched = requiredSkills.filter(reqSkill =>
    candidateSkillNames.some(candSkill => 
      candSkill.includes(reqSkill.toLowerCase()) || 
      reqSkill.toLowerCase().includes(candSkill)
    )
  );

  const missing = requiredSkills.filter(reqSkill =>
    !candidateSkillNames.some(candSkill => 
      candSkill.includes(reqSkill.toLowerCase()) || 
      reqSkill.toLowerCase().includes(candSkill)
    )
  );

  const extra = candidateSkills.filter(candSkill =>
    !requiredSkills.some(reqSkill =>
      candSkill.name.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(candSkill.name.toLowerCase())
    )
  ).map(s => s.name);

  return {
    matched,
    missing,
    extra,
    matchPercentage: (matched.length / requiredSkills.length) * 100,
  };
}

/**
 * Rank candidates for a requirement
 * @param candidates - Array of bench resources
 * @param requirement - Job requirement
 * @returns Sorted array of candidates with scores
 */
export function rankCandidates(
  candidates: BenchResource[],
  requirement: JobRequirement
) {
  return candidates
    .map(candidate => ({
      candidate,
      aiScore: calculateAIScore(candidate, requirement),
      skillMatchDetails: getSkillMatchDetails(candidate.skills, requirement.skills),
    }))
    .sort((a, b) => b.aiScore - a.aiScore); // Sort by score descending
}
