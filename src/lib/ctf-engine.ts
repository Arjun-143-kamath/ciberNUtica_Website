import { Challenge, Flag, ScoreboardEntry, Solve } from './types';

/**
 * Calculates dynamic challenge point value according to official CTFd algorithm:
 * value = ceil( (((min - initial) / (decay ** 2)) * (solve_count ** 2)) + initial )
 * value = max(minimum, value)
 */
export function calculateDynamicPoints(
  initial: number,
  min: number,
  decay: number,
  solveCount: number
): number {
  if (decay <= 0) return initial;
  const rawDecay = (((min - initial) / Math.pow(decay, 2)) * Math.pow(solveCount, 2)) + initial;
  const rounded = Math.ceil(rawDecay);
  return Math.max(min, Math.min(initial, rounded));
}

/**
 * Validates a submitted flag against a challenge's configured flags
 */
export function verifyFlag(
  submittedFlag: string,
  flags: Flag[]
): { isValid: boolean; matchedFlagId?: string } {
  const cleanSubmission = submittedFlag.trim();

  for (const flag of flags) {
    if (flag.type === 'STATIC') {
      const target = flag.content.trim();
      if (flag.caseSensitive) {
        if (cleanSubmission === target) {
          return { isValid: true, matchedFlagId: flag.id };
        }
      } else {
        if (cleanSubmission.toLowerCase() === target.toLowerCase()) {
          return { isValid: true, matchedFlagId: flag.id };
        }
      }
    } else if (flag.type === 'REGEX') {
      try {
        const regex = new RegExp(flag.content, flag.caseSensitive ? '' : 'i');
        if (regex.test(cleanSubmission)) {
          return { isValid: true, matchedFlagId: flag.id };
        }
      } catch (err) {
        console.error('Invalid regex flag pattern:', flag.content, err);
      }
    }
  }

  return { isValid: false };
}

/**
 * Calculates current point values for all challenges based on current solves
 */
export function resolveChallengePoints(challenges: Challenge[], solves: Solve[]): Challenge[] {
  return challenges.map(ch => {
    if (ch.type === 'STANDARD') {
      return { ...ch, currentPoints: ch.initialPoints };
    }
    const challengeSolves = solves.filter(s => s.challengeId === ch.id).length;
    const currentPoints = calculateDynamicPoints(
      ch.initialPoints,
      ch.minPoints,
      ch.decaySolves,
      challengeSolves
    );
    return { ...ch, currentPoints };
  });
}

/**
 * Generates ranked scoreboard adhering to official CTFd tie-breaking:
 * 1. Highest points first
 * 2. If points are equal, competitor who reached that score earlier wins
 */
export function generateScoreboard(
  solves: Solve[],
  users: Array<{ id: string; username: string; teamName?: string; role: string }>,
  challenges: Challenge[],
  unlockedHints: Array<{ userId: string; challengeId: string; cost: number }> = []
): ScoreboardEntry[] {
  // Competitors only (exclude admins from public leaderboard)
  const competitors = users.filter(u => u.role !== 'ADMIN');

  // Compute challenge points map
  const updatedChallenges = resolveChallengePoints(challenges, solves);
  const pointsMap = new Map<string, number>();
  updatedChallenges.forEach(c => pointsMap.set(c.id, c.currentPoints));

  const entries: ScoreboardEntry[] = competitors.map(user => {
    const userSolves = solves.filter(s => s.userId === user.id);
    const userHints = unlockedHints.filter(h => h.userId === user.id);
    const hintPenalties = userHints.reduce((sum, h) => sum + h.cost, 0);

    // Sum dynamic current points for all solved challenges
    const grossScore = userSolves.reduce((sum, s) => {
      const pts = pointsMap.get(s.challengeId) ?? s.pointsAwarded;
      return sum + pts;
    }, 0);

    const totalScore = Math.max(0, grossScore - hintPenalties);

    // Find the latest solve timestamp
    let lastSolveTime: string | undefined = undefined;
    if (userSolves.length > 0) {
      const sortedSolves = [...userSolves].sort(
        (a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime()
      );
      lastSolveTime = sortedSolves[0].solvedAt;
    }

    return {
      rank: 0,
      userId: user.id,
      username: user.username,
      teamName: user.teamName,
      totalScore,
      solvesCount: userSolves.length,
      lastSolveTime,
      solves: userSolves.map(s => ({
        challengeId: s.challengeId,
        points: pointsMap.get(s.challengeId) ?? s.pointsAwarded,
        solvedAt: s.solvedAt
      }))
    };
  });

  // Filter out users with 0 solves if preferred, or include them at the bottom
  // Sort: totalScore DESC, then lastSolveTime ASC (earlier is better)
  entries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (a.lastSolveTime && b.lastSolveTime) {
      return new Date(a.lastSolveTime).getTime() - new Date(b.lastSolveTime).getTime();
    }
    if (a.lastSolveTime) return -1;
    if (b.lastSolveTime) return 1;
    return a.username.localeCompare(b.username);
  });

  // Assign ranks
  return entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1
  }));
}
