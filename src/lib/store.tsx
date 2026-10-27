'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  BlogPost, 
  Challenge, 
  Coordinator, 
  EventItem, 
  ScoreboardEntry, 
  Solve, 
  Submission, 
  User 
} from './types';
import { 
  INITIAL_BLOGS, 
  INITIAL_CHALLENGES, 
  INITIAL_COORDINATORS, 
  INITIAL_EVENTS, 
  INITIAL_SOLVES, 
  INITIAL_USERS 
} from './initial-data';
import { generateScoreboard, resolveChallengePoints, verifyFlag } from './ctf-engine';

interface HintUnlock {
  userId: string;
  challengeId: string;
  cost: number;
}

interface CTFContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  events: EventItem[];
  challenges: Challenge[];
  solves: Solve[];
  submissions: Submission[];
  blogs: BlogPost[];
  coordinators: Coordinator[];
  scoreboard: ScoreboardEntry[];
  unlockedHints: HintUnlock[];
  isScoreboardFrozen: boolean;
  setIsScoreboardFrozen: (frozen: boolean) => void;
  // Actions
  loginAs: (role: 'ADMIN' | 'USER', username?: string) => void;
  logout: () => void;
  addEvent: (event: Omit<EventItem, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  addChallenge: (challenge: Omit<Challenge, 'id' | 'currentPoints'>) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  submitFlag: (challengeId: string, flag: string) => { success: boolean; message: string; pointsAwarded?: number };
  unlockHint: (challengeId: string, hintId: string, cost: number) => { success: boolean; message: string };
  addBlogPost: (post: Omit<BlogPost, 'id' | 'publishedAt'>) => void;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  getSubmissionAttempts: (challengeId: string) => number;
  clearSubmissions: () => void;
}

const CTFContext = createContext<CTFContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'cibernutica_user_v1',
  EVENTS: 'cibernutica_events_v1',
  CHALLENGES: 'cibernutica_challenges_v1',
  SOLVES: 'cibernutica_solves_v1',
  SUBMISSIONS: 'cibernutica_submissions_v1',
  BLOGS: 'cibernutica_blogs_v1',
  HINTS: 'cibernutica_hints_v1',
  FROZEN: 'cibernutica_frozen_v1'
};

export function CTFProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default to admin for immediate testing
  const [users] = useState<User[]>(INITIAL_USERS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [solves, setSolves] = useState<Solve[]>(INITIAL_SOLVES);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [coordinators] = useState<Coordinator[]>(INITIAL_COORDINATORS);
  const [unlockedHints, setUnlockedHints] = useState<HintUnlock[]>([]);
  const [isScoreboardFrozen, setIsScoreboardFrozen] = useState<boolean>(false);

  // Initialize from LocalStorage if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (savedEvents) setEvents(JSON.parse(savedEvents));

      const savedChals = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      if (savedChals) setChallenges(JSON.parse(savedChals));

      const savedSolves = localStorage.getItem(STORAGE_KEYS.SOLVES);
      if (savedSolves) setSolves(JSON.parse(savedSolves));

      const savedSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));

      const savedBlogs = localStorage.getItem(STORAGE_KEYS.BLOGS);
      if (savedBlogs) setBlogs(JSON.parse(savedBlogs));

      const savedHints = localStorage.getItem(STORAGE_KEYS.HINTS);
      if (savedHints) setUnlockedHints(JSON.parse(savedHints));

      const savedFrozen = localStorage.getItem(STORAGE_KEYS.FROZEN);
      if (savedFrozen !== null) setIsScoreboardFrozen(JSON.parse(savedFrozen));
    } catch (e) {
      console.warn('LocalStorage unavailable, running in memory store', e);
    }
  }, []);

  // Sync to local storage
  const syncStorage = (key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  };

  const loginAs = (role: 'ADMIN' | 'USER', username?: string) => {
    if (role === 'ADMIN') {
      const admin = INITIAL_USERS.find(u => u.role === 'ADMIN') || INITIAL_USERS[0];
      setCurrentUser(admin);
      syncStorage(STORAGE_KEYS.USER, admin);
    } else {
      const competitor = INITIAL_USERS.find(u => u.username === username) || INITIAL_USERS[1];
      setCurrentUser(competitor);
      syncStorage(STORAGE_KEYS.USER, competitor);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
  };

  // Event handlers
  const addEvent = (eventData: Omit<EventItem, 'id'>) => {
    const newEvent: EventItem = {
      ...eventData,
      id: `evt-${Date.now()}`
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    syncStorage(STORAGE_KEYS.EVENTS, updated);
  };

  const updateEvent = (id: string, updates: Partial<EventItem>) => {
    const updated = events.map(e => (e.id === id ? { ...e, ...updates } : e));
    setEvents(updated);
    syncStorage(STORAGE_KEYS.EVENTS, updated);
  };

  const deleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    syncStorage(STORAGE_KEYS.EVENTS, updated);
  };

  // Challenge handlers
  const addChallenge = (chalData: Omit<Challenge, 'id' | 'currentPoints'>) => {
    const newChallenge: Challenge = {
      ...chalData,
      id: `chal-${Date.now()}`,
      currentPoints: chalData.initialPoints
    };
    const updated = [...challenges, newChallenge];
    setChallenges(updated);
    syncStorage(STORAGE_KEYS.CHALLENGES, updated);
  };

  const updateChallenge = (id: string, updates: Partial<Challenge>) => {
    const updated = challenges.map(c => (c.id === id ? { ...c, ...updates } : c));
    setChallenges(updated);
    syncStorage(STORAGE_KEYS.CHALLENGES, updated);
  };

  const deleteChallenge = (id: string) => {
    const updated = challenges.filter(c => c.id !== id);
    setChallenges(updated);
    syncStorage(STORAGE_KEYS.CHALLENGES, updated);
  };

  const getSubmissionAttempts = (challengeId: string): number => {
    if (!currentUser) return 0;
    return submissions.filter(
      s => s.userId === currentUser.id && s.challengeId === challengeId
    ).length;
  };

  const clearSubmissions = () => {
    setSubmissions([]);
    syncStorage(STORAGE_KEYS.SUBMISSIONS, []);
  };

  // Flag Submission Engine (with rate-limiting & CTFd dynamic re-weighting)
  const submitFlag = (
    challengeId: string, 
    flagText: string
  ): { success: boolean; message: string; pointsAwarded?: number } => {
    if (!currentUser) {
      return { success: false, message: 'AUTHENTICATION_REQUIRED: Please authenticate first.' };
    }

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) {
      return { success: false, message: 'CHALLENGE_NOT_FOUND: Invalid challenge identifier.' };
    }

    // Check if already solved
    const alreadySolved = solves.some(
      s => s.userId === currentUser.id && s.challengeId === challengeId
    );
    if (alreadySolved) {
      return { success: false, message: 'DUPLICATE_SOLVE: You have already captured this flag.' };
    }

    // Rate Limiting check (anti-brute force: 5 attempts in past 60s)
    const now = Date.now();
    const recentAttempts = submissions.filter(
      s => s.userId === currentUser.id && 
           s.challengeId === challengeId && 
           (now - new Date(s.submittedAt).getTime()) < 60000
    );

    if (recentAttempts.length >= 5) {
      return { 
        success: false, 
        message: 'RATE_LIMIT_EXCEEDED: Cooldown active. Maximum 5 attempts per minute.' 
      };
    }

    // Validate flag against challenge flags
    const { isValid } = verifyFlag(flagText, challenge.flags);

    // Audit log submission
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      providedFlag: flagText,
      isCorrect: isValid,
      submittedAt: new Date().toISOString()
    };
    const updatedSubmissions = [newSubmission, ...submissions];
    setSubmissions(updatedSubmissions);
    syncStorage(STORAGE_KEYS.SUBMISSIONS, updatedSubmissions);

    if (!isValid) {
      return { success: false, message: 'INCORRECT_FLAG: Access denied.' };
    }

    // Flag is correct! Calculate points and award solve
    const updatedSolvesList = [
      ...solves,
      {
        id: `slv-${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        pointsAwarded: challenge.currentPoints,
        solvedAt: new Date().toISOString()
      }
    ];

    setSolves(updatedSolvesList);
    syncStorage(STORAGE_KEYS.SOLVES, updatedSolvesList);

    // Recalculate dynamic points across all challenges
    const rebalancedChallenges = resolveChallengePoints(challenges, updatedSolvesList);
    setChallenges(rebalancedChallenges);
    syncStorage(STORAGE_KEYS.CHALLENGES, rebalancedChallenges);

    return { 
      success: true, 
      message: 'FLAG_VERIFIED: Access granted. Points recorded on scoreboard.',
      pointsAwarded: challenge.currentPoints
    };
  };

  // Hint unlocking
  const unlockHint = (challengeId: string, hintId: string, cost: number) => {
    if (!currentUser) return { success: false, message: 'Auth required.' };
    const exists = unlockedHints.some(
      h => h.userId === currentUser.id && h.challengeId === challengeId
    );
    if (exists) return { success: true, message: 'Already unlocked.' };

    const newUnlock: HintUnlock = { userId: currentUser.id, challengeId, cost };
    const updated = [...unlockedHints, newUnlock];
    setUnlockedHints(updated);
    syncStorage(STORAGE_KEYS.HINTS, updated);
    return { success: true, message: `Hint unlocked (-${cost} pts penalty applied).` };
  };

  // Blog operations
  const addBlogPost = (postData: Omit<BlogPost, 'id' | 'publishedAt'>) => {
    const newBlog: BlogPost = {
      ...postData,
      id: `blog-${Date.now()}`,
      publishedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase()
    };
    const updated = [newBlog, ...blogs];
    setBlogs(updated);
    syncStorage(STORAGE_KEYS.BLOGS, updated);
  };

  const updateBlogPost = (id: string, updates: Partial<BlogPost>) => {
    const updated = blogs.map(b => (b.id === id ? { ...b, ...updates } : b));
    setBlogs(updated);
    syncStorage(STORAGE_KEYS.BLOGS, updated);
  };

  const deleteBlogPost = (id: string) => {
    const updated = blogs.filter(b => b.id !== id);
    setBlogs(updated);
    syncStorage(STORAGE_KEYS.BLOGS, updated);
  };

  // Generate live scoreboard
  const scoreboard = generateScoreboard(solves, users, challenges, unlockedHints);

  return (
    <CTFContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        events,
        challenges: resolveChallengePoints(challenges, solves),
        solves,
        submissions,
        blogs,
        coordinators,
        scoreboard,
        unlockedHints,
        isScoreboardFrozen,
        setIsScoreboardFrozen,
        loginAs,
        logout,
        addEvent,
        updateEvent,
        deleteEvent,
        addChallenge,
        updateChallenge,
        deleteChallenge,
        submitFlag,
        unlockHint,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        getSubmissionAttempts,
        clearSubmissions
      }}
    >
      {children}
    </CTFContext.Provider>
  );
}

export function useCTF() {
  const context = useContext(CTFContext);
  if (!context) {
    throw new Error('useCTF must be used within a CTFProvider');
  }
  return context;
}
