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
import { INITIAL_BLOGS, INITIAL_COORDINATORS } from './initial-data';
import { generateScoreboard, resolveChallengePoints } from './ctf-engine';

interface HintUnlock {
  userId: string;
  challengeId: string;
  hintId: string;
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
  setIsScoreboardFrozen: (frozen: boolean) => Promise<void>;
  // Actions
  refreshSession: () => Promise<void>;
  refreshCtfState: () => Promise<void>;
  logout: () => Promise<void>;
  addEvent: (event: Omit<EventItem, 'id'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => void;
  addChallenge: (challenge: Omit<Challenge, 'id' | 'currentPoints'>) => Promise<void>;
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  submitFlag: (challengeId: string, flag: string) => Promise<{ success: boolean; message: string; pointsAwarded?: number }>;
  unlockHint: (challengeId: string, hintId: string, cost: number) => Promise<{ success: boolean; message: string }>;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'publishedAt'>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  getSubmissionAttempts: (challengeId: string) => number;
  clearSubmissions: () => Promise<void>;
}

const CTFContext = createContext<CTFContextType | undefined>(undefined);

export function CTFProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solves, setSolves] = useState<Solve[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [coordinators] = useState<Coordinator[]>(INITIAL_COORDINATORS);
  const [unlockedHints, setUnlockedHints] = useState<HintUnlock[]>([]);
  const [isScoreboardFrozen, setIsScoreboardFrozen] = useState<boolean>(false);

  const refreshCtfState = async () => {
    const response = await fetch('/api/ctf/state', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to load CTF data.');
    if (Array.isArray(data.challenges)) setChallenges(data.challenges);
    if (Array.isArray(data.solves)) setSolves(data.solves);
    if (Array.isArray(data.users)) setUsers(data.users);
    if (Array.isArray(data.submissions)) setSubmissions(data.submissions);
    if (Array.isArray(data.unlockedHints)) setUnlockedHints(data.unlockedHints);
    setIsScoreboardFrozen(data.isScoreboardFrozen === true);
  };

  const updateScoreboardFreeze = async (frozen: boolean) => {
    const response = await fetch('/api/ctf/freeze', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ frozen }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to change scoreboard state.');
    setIsScoreboardFrozen(result.isScoreboardFrozen);
  };

  // Initialize from LocalStorage if available
  useEffect(() => {
    void fetch('/api/auth/session', { cache: 'no-store' }).then(r => r.json()).then(data => {
      const user = data.user as User | null;
      setCurrentUser(user);
      if (user?.role === 'USER') setUsers(existing => existing.some(item => item.id === user.id) ? existing : [...existing, user]);
    }).catch(() => setCurrentUser(null));
    try {
      void fetch('/api/events', { cache: 'no-store' }).then(response => response.json()).then(data => {
        if (Array.isArray(data.events)) setEvents(data.events);
      }).catch(() => undefined);

      void fetch('/api/blog', { cache: 'no-store' }).then(response => response.json()).then(data => {
        if (Array.isArray(data.posts)) setBlogs(data.posts);
      }).catch(() => undefined);

    } catch (e) {
      console.warn('LocalStorage unavailable, running in memory store', e);
    }
    void refreshCtfState().catch(() => undefined);
  }, []);

  const refreshSession = async () => {
    const response = await fetch('/api/auth/session', { cache: 'no-store' });
    const data = await response.json();
    const user = data.user as User | null;
    setCurrentUser(user);
    if (user?.role === 'USER') setUsers(existing => existing.some(item => item.id === user.id) ? existing : [...existing, user]);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  // Event handlers
  const addEvent = async (eventData: Omit<EventItem, 'id'>) => {
    const response = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventData) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to add event.');
    const updated = [result.event as EventItem, ...events];
    setEvents(updated);
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    const response = await fetch('/api/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to update event.');
    const updated = events.map(e => (e.id === id ? result.event as EventItem : e));
    setEvents(updated);
  };

  const deleteEvent = (id: string) => { setEvents(events.filter(e => e.id !== id)); };

  // Challenge handlers
  const addChallenge = async (chalData: Omit<Challenge, 'id' | 'currentPoints'>) => {
    const response = await fetch('/api/ctf/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(chalData) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to create challenge.');
    setChallenges([...challenges, data.challenge]);
  };

  const updateChallenge = async (id: string, updates: Partial<Challenge>) => {
    const response = await fetch('/api/ctf/challenges', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to update challenge.');
    setChallenges(challenges.map(challenge => challenge.id === id ? data.challenge : challenge));
  };

  const deleteChallenge = async (id: string) => {
    const response = await fetch(`/api/ctf/challenges?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Unable to delete challenge.');
    setChallenges(challenges.filter(challenge => challenge.id !== id));
  };

  const getSubmissionAttempts = (challengeId: string): number => {
    if (!currentUser) return 0;
    return submissions.filter(
      s => s.userId === currentUser.id && s.challengeId === challengeId
    ).length;
  };

  const clearSubmissions = async () => {
    const response = await fetch('/api/ctf/submissions', { method: 'DELETE' });
    if (!response.ok) throw new Error('Unable to clear submission records.');
    setSubmissions([]);
  };

  const submitFlag = async (challengeId: string, flagText: string) => {
    const response = await fetch('/api/ctf/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId, flag: flagText }) });
    const result = await response.json();
    await refreshCtfState();
    return result as { success: boolean; message: string; pointsAwarded?: number };
  };

  const unlockHint = async (challengeId: string, hintId: string) => {
    const response = await fetch('/api/ctf/hints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId, hintId }) });
    const result = await response.json();
    if (response.ok && currentUser) {
      const unlock = { userId: currentUser.id, challengeId, hintId, cost: result.cost as number };
      setUnlockedHints(previous => previous.some(item => item.hintId === hintId && item.userId === currentUser.id) ? previous : [...previous, unlock]);
      setChallenges(previous => previous.map(challenge => challenge.id === challengeId
        ? { ...challenge, hints: challenge.hints.map(hint => hint.id === hintId ? { ...hint, content: result.content as string } : hint) }
        : challenge));
    }
    return { success: response.ok, message: result.message || result.error || 'Unable to unlock hint.' };
  };

  // Blog operations
  const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'publishedAt'>) => {
    const response = await fetch('/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(postData) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Administrator authentication required to publish dispatches.');
    const updated = [result.post as BlogPost, ...blogs];
    setBlogs(updated);
  };

  const deleteBlogPost = async (id: string) => {
    const response = await fetch(`/api/blog?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Unable to delete this dispatch.');
    const updated = blogs.filter(b => b.id !== id);
    setBlogs(updated);
  };

  // Generate live scoreboard
  const scoreboardUsers = currentUser?.role === 'USER' && !users.some(user => user.id === currentUser.id) ? [...users, currentUser] : users;
  const scoreboard = generateScoreboard(solves, scoreboardUsers, challenges, unlockedHints);

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
        setIsScoreboardFrozen: updateScoreboardFreeze,
        refreshSession,
        refreshCtfState,
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
