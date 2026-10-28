export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  teamName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type EventType = 'WORKSHOP' | 'SESSION' | 'TALK' | 'CTF';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  location: string;
  date: string;
  startDate?: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  bannerUrl?: string;
  isPublished: boolean;
  isLiveCTF: boolean;
  freezeTime?: string;
}

export type ChallengeType = 'STANDARD' | 'DYNAMIC';
export type ChallengeCategory = 
  | 'Web Exploitation' 
  | 'Reverse Engineering' 
  | 'Cryptography' 
  | 'Binary Exploitation' 
  | 'Forensics' 
  | 'OSINT' 
  | 'Misc';

export type FlagType = 'STATIC' | 'REGEX';

export interface Flag {
  id: string;
  challengeId: string;
  type: FlagType;
  content: string; // Plaintext or hashed
  caseSensitive: boolean;
  isSensitive?: boolean;
}

export interface Hint {
  id: string;
  challengeId: string;
  content: string;
  cost: number;
}

export interface Challenge {
  id: string;
  eventId: string;
  title: string;
  category: ChallengeCategory;
  description: string;
  type: ChallengeType;
  initialPoints: number;
  minPoints: number;
  decaySolves: number;
  currentPoints: number;
  state: 'visible' | 'hidden';
  maxAttempts: number;
  flags: Flag[];
  hints: Hint[];
  files?: Array<{ name: string; url: string; size: string }>;
  tags?: string[];
}

export interface Solve {
  id: string;
  userId: string;
  username: string;
  challengeId: string;
  challengeTitle: string;
  pointsAwarded: number;
  solvedAt: string; // ISO 8601
}

export interface Submission {
  id: string;
  userId: string;
  username: string;
  challengeId: string;
  challengeTitle: string;
  providedFlag: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTime: string;
  publishedAt: string;
  coverImage?: string;
}

export interface ScoreboardEntry {
  rank: number;
  userId: string;
  username: string;
  teamName?: string;
  totalScore: number;
  solvesCount: number;
  lastSolveTime?: string;
  solves: Array<{
    challengeId: string;
    points: number;
    solvedAt: string;
  }>;
}

export interface Coordinator {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  image: string;
  callsign: string;
  domains: string[];
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}
