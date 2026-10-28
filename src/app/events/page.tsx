'use client';

import React, { useState } from 'react';
import { useCTF } from '@/lib/store';
import { 
  Flag, 
  Trophy, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Search, 
  Plus, 
  Flame, 
  Lock,
  ChevronRight,
  Shield,
  Send,
  Zap,
  TrendingDown,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Challenge, ChallengeCategory, EventType } from '@/lib/types';

export default function EventsAndCTFPage() {
  const { 
    events, 
    challenges, 
    solves, 
    scoreboard, 
    currentUser, 
    submitFlag, 
    unlockHint, 
    unlockedHints, 
    addEvent,
    isScoreboardFrozen,
    setIsScoreboardFrozen,
    getSubmissionAttempts
  } = useCTF();

  // Tab: 'arena' (CTF Challenges & Scoreboard) vs 'operations' (Workshops, Sessions, Upcoming & Past)
  const [activeTab, setActiveTab] = useState<'arena' | 'operations' | 'scoreboard'>('arena');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const ctfEvents = events.filter(event => event.type === 'CTF' && event.isPublished);
  const [selectedCtfEventId, setSelectedCtfEventId] = useState('');
  const selectedCtfEvent = ctfEvents.find(event => event.id === selectedCtfEventId) ?? ctfEvents[0];
  const ctfSubmissionsOpen = Boolean(selectedCtfEvent?.isLiveCTF && Date.now() >= Date.parse(`${selectedCtfEvent.startDate}T${selectedCtfEvent.startTime.slice(0, 5)}:00Z`) && Date.now() <= Date.parse(`${selectedCtfEvent.endDate ?? selectedCtfEvent.startDate}T${selectedCtfEvent.endTime.slice(0, 5)}:00Z`));
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [flagInput, setFlagInput] = useState<string>('');
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedFlagPrefix, setCopiedFlagPrefix] = useState(false);

  // Event modal for admins
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    slug: '',
    description: '',
    type: 'WORKSHOP' as EventType,
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    isPublished: true,
    isLiveCTF: false,
    bannerUrl: ''
  });

  // Filter categories
  const categories: Array<ChallengeCategory | 'ALL'> = [
    'ALL',
    'Web Exploitation',
    'Reverse Engineering',
    'Cryptography',
    'Binary Exploitation',
    'Forensics'
  ];

  const filteredChallenges = challenges.filter(c => {
    if (!selectedCtfEvent || c.eventId !== selectedCtfEvent.id) return false;
    if (selectedCategory === 'ALL') return true;
    return c.category === selectedCategory;
  });
  const currentEventChallengeIds = new Set(challenges.filter(challenge => challenge.eventId === selectedCtfEvent?.id).map(challenge => challenge.id));
  const eventScoreboard = scoreboard.map(entry => {
    const eventSolves = entry.solves.filter(solve => currentEventChallengeIds.has(solve.challengeId));
    const hintPenalty = unlockedHints.filter(unlock => unlock.userId === entry.userId && currentEventChallengeIds.has(unlock.challengeId)).reduce((sum, unlock) => sum + unlock.cost, 0);
    return { ...entry, solves: eventSolves, solvesCount: eventSolves.length, totalScore: Math.max(0, eventSolves.reduce((sum, solve) => sum + solve.points, 0) - hintPenalty), lastSolveTime: [...eventSolves].sort((a, b) => Date.parse(b.solvedAt) - Date.parse(a.solvedAt))[0]?.solvedAt };
  }).filter(entry => entry.solvesCount > 0).sort((a, b) => b.totalScore - a.totalScore || Date.parse(a.lastSolveTime ?? '') - Date.parse(b.lastSolveTime ?? '')).map((entry, index) => ({ ...entry, rank: index + 1 }));

  // Solve checker
  const isSolvedByCurrentUser = (challengeId: string) => {
    if (!currentUser) return false;
    return solves.some(s => s.userId === currentUser.id && s.challengeId === challengeId);
  };

  const getChallengeSolvesCount = (challengeId: string) => {
    return solves.filter(s => s.challengeId === challengeId).length;
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChallenge || !flagInput.trim()) return;

    setIsSubmitting(true);
    setSubmissionFeedback(null);

    let result: Awaited<ReturnType<typeof submitFlag>>;
    try { result = await submitFlag(activeChallenge.id, flagInput); }
    catch { result = { success: false, message: 'SUBMISSION_FAILED: Unable to reach the CTF service.' }; }

    if (result.success) {
      setSubmissionFeedback({ type: 'success', message: result.message });
      setFlagInput('');
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FCEE09', '#FFFFFF', '#FFA500']
        });
      } catch {}
    } else {
      setSubmissionFeedback({ type: 'error', message: result.message });
    }
    setIsSubmitting(false);
  };

  const handleHintUnlock = async (hintId: string, cost: number) => {
    if (!activeChallenge) return;
    const confirmed = window.confirm(`Unlocking this tactical hint will deduct ${cost} points from your score upon solve. Proceed?`);
    if (confirmed) {
      const res = await unlockHint(activeChallenge.id, hintId, cost);
      setSubmissionFeedback({ type: res.success ? 'info' : 'error', message: res.message });
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    void addEvent({
      ...newEvent,
      slug: newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }).catch(error => window.alert(error instanceof Error ? error.message : 'Unable to add event.'));
    setShowAddEventModal(false);
    setNewEvent({
      title: '',
      slug: '',
      description: '',
      type: 'WORKSHOP',
      location: '',
      date: '',
      startTime: '',
      endTime: '',
      isPublished: true,
      isLiveCTF: false,
      bannerUrl: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner / Tactical Header */}
      <div className="border border-[#FCEE09]/30 bg-neutral-950 p-5 sm:p-7 relative">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#FCEE09] uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#FCEE09]"></span>
              EVENTS // COMPETITIONS
            </div>
            <h1 className="text-3xl sm:text-4xl font-mono font-black text-white uppercase tracking-tight">
              OPERATIONS & CTF ARENA
            </h1>
            <p className="text-xs font-mono text-neutral-400 max-w-xl leading-relaxed">
              Compete in CTFs, track scores, and explore upcoming events.
            </p>
          </div>

          {/* Action Tabs */}
          <div className="grid w-full grid-cols-3 gap-2 font-mono text-[10px] sm:text-xs xl:w-[450px] xl:shrink-0">
            <button
              onClick={() => setActiveTab('arena')}
              className={`justify-center px-2 py-2.5 font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'arena'
                  ? 'bg-[#FCEE09] text-black'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-[#FCEE09]/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>CTF ARENA</span>
            </button>

            <button
              onClick={() => setActiveTab('scoreboard')}
              className={`justify-center px-2 py-2.5 font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'scoreboard'
                  ? 'bg-[#FCEE09] text-black'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-[#FCEE09]/40'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>SCOREBOARD</span>
            </button>

            <button
              onClick={() => setActiveTab('operations')}
              className={`justify-center px-2 py-2.5 font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'operations'
                  ? 'bg-[#FCEE09] text-black'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-[#FCEE09]/40'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>EVENTS</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LIVE CTF ARENA (Challenges Grid with Categories & Dynamic Decay)
          ========================================================================= */}
      {activeTab === 'arena' && (
        <div className="space-y-8">
          
          {/* Competition and challenge filters */}
          <div className="space-y-4 border-b border-[#FCEE09]/20 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex w-full max-w-xl flex-col gap-2">
                <label htmlFor="ctf-event-select" className="text-[10px] font-mono tracking-wider text-neutral-500">COMPETITION</label>
                <select id="ctf-event-select" value={selectedCtfEvent?.id ?? ''} onChange={e => setSelectedCtfEventId(e.target.value)} disabled={ctfEvents.length === 0} className="w-full min-w-0 bg-black border border-[#FCEE09]/40 px-3 py-2.5 text-xs text-white">
                {ctfEvents.length === 0 ? <option value="">NO PUBLISHED CTF EVENTS</option> : ctfEvents.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}
                </select>
              </div>
              <div className="shrink-0 text-[11px] font-mono uppercase text-neutral-500">
                <span className="text-[#FCEE09]">{filteredChallenges.length}</span> {filteredChallenges.length === 1 ? 'CHALLENGE' : 'CHALLENGES'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-mono tracking-wider text-neutral-500">FILTER BY CATEGORY</div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase transition ${
                      selectedCategory === cat
                        ? 'border border-[#FCEE09] bg-[#FCEE09]/15 text-[#FCEE09]'
                        : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedCtfEvent && <div className="flex flex-wrap items-center justify-between gap-3 border border-neutral-800 bg-neutral-950 p-4 text-xs font-mono">
            <div><div className="font-bold text-white">{selectedCtfEvent.title}</div><div className="mt-1 text-neutral-500">{selectedCtfEvent.date} // {selectedCtfEvent.startTime}–{selectedCtfEvent.endTime}</div></div>
            <span className={ctfSubmissionsOpen ? 'text-emerald-400' : 'text-amber-400'}>{ctfSubmissionsOpen ? 'SUBMISSIONS OPEN' : 'CHALLENGES VISIBLE · SUBMISSIONS CLOSED'}</span>
          </div>}

          {/* Challenges Cards Grid */}
          {selectedCtfEvent && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((chal) => {
              const solved = isSolvedByCurrentUser(chal.id);
              const solveCount = getChallengeSolvesCount(chal.id);

              return (
                <div
                  key={chal.id}
                  onClick={() => {
                    setActiveChallenge(chal);
                    setSubmissionFeedback(null);
                    setFlagInput('');
                  }}
                  className={`cyber-card p-6 border transition cursor-pointer flex flex-col justify-between group ${
                    solved 
                      ? 'border-emerald-500/50 bg-emerald-950/10' 
                      : 'border-[#FCEE09]/25 hover:border-[#FCEE09]'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Category & Points */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#FCEE09] px-2 py-0.5 bg-[#FCEE09]/10 border border-[#FCEE09]/30 text-[10px]">
                        {chal.category}
                      </span>
                      <div className="flex items-center gap-1.5 font-bold">
                        {chal.type === 'DYNAMIC' && (
                          <TrendingDown className="w-3.5 h-3.5 text-[#FCEE09]" />
                        )}
                        <span className="text-base text-white group-hover:text-[#FCEE09] transition">
                          {chal.currentPoints} PTS
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-mono text-base font-bold text-white group-hover:text-[#FCEE09] transition flex items-center justify-between">
                      <span>{chal.title}</span>
                      {solved && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                    </h3>

                    {/* Excerpt / Summary */}
                    <p className="font-mono text-xs text-neutral-400 line-clamp-2">
                      {chal.description.replace(/[*#`_]/g, '')}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-4 border-t border-neutral-800/80 mt-6 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Flag className="w-3 h-3 text-[#FCEE09]" />
                      {solveCount} {solveCount === 1 ? 'Solve' : 'Solves'}
                    </span>
                    <span className="text-[#FCEE09] uppercase font-bold group-hover:translate-x-1 transition-transform">
                      {solved ? 'VIEW CAPTURE →' : 'ATTEMPT CHALLENGE →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>}
          {!selectedCtfEvent && <div className="border border-neutral-800 bg-neutral-950 p-10 text-center text-sm text-neutral-400">No CTF event is currently published. Check back when the next competition is announced.</div>}

        </div>
      )}

      {/* =========================================================================
          TAB 2: LIVE SCOREBOARD & LEADERBOARD
          ========================================================================= */}
      {activeTab === 'scoreboard' && (
        <div className="space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#FCEE09]/20 pb-4">
            <div>
              <h2 className="text-xl font-mono font-bold text-white uppercase flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FCEE09]" />
                {selectedCtfEvent ? `${selectedCtfEvent.title} SCOREBOARD` : 'CTF SCOREBOARD'}
              </h2>
              <div className="text-xs font-mono text-neutral-400 mt-1">
                Event-scoped standings · Points rank first; solve timestamp breaks ties.
              </div>
            </div>

            {/* Admin Freeze Toggle */}
            {currentUser?.role === 'ADMIN' && (
              <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 p-2 text-xs font-mono">
                <span className="text-neutral-400">SCOREBOARD STATE:</span>
                <button
                  onClick={() => { void setIsScoreboardFrozen(!isScoreboardFrozen).catch(() => window.alert('Unable to update scoreboard state.')); }}
                  className={`px-2.5 py-1 font-bold ${
                    isScoreboardFrozen
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isScoreboardFrozen ? 'FROZEN [ADMIN MODE]' : 'LIVE BROADCASTING'}
                </button>
              </div>
            )}
          </div>

          {/* Frozen Alert Banner */}
          {isScoreboardFrozen && (
            <div className="p-4 bg-red-950/40 border border-red-800 text-xs font-mono text-red-300 flex items-center gap-3">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                **SCOREBOARD FROZEN BY ADMINISTRATOR**: Scores are locked for the final competition hours. Admin calculates true scores in background.
              </span>
            </div>
          )}

          {ctfEvents.length > 0 && <div className="flex items-center gap-3 text-xs font-mono text-neutral-400"><label htmlFor="scoreboard-event">EVENT</label><select id="scoreboard-event" value={selectedCtfEvent?.id ?? ''} onChange={e => setSelectedCtfEventId(e.target.value)} className="bg-black border border-neutral-800 px-3 py-2 text-white">{ctfEvents.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}</select></div>}

          {/* Top 3 Podium Highlights */}
          {eventScoreboard.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {eventScoreboard.slice(0, 3).map((podium) => {
                const isFirst = podium.rank === 1;
                const isSecond = podium.rank === 2;
                return (
                  <div
                    key={podium.userId}
                    className={`cyber-card p-5 border transition relative ${
                      isFirst
                        ? 'border-[#FCEE09] bg-[#FCEE09]/10 shadow-[0_0_20px_rgba(252,238,9,0.15)]'
                        : isSecond
                        ? 'border-neutral-400/50 bg-neutral-900/40'
                        : 'border-amber-700/50 bg-neutral-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className={`px-2 py-0.5 font-bold uppercase text-[10px] ${
                        isFirst 
                          ? 'bg-[#FCEE09] text-black font-black' 
                          : isSecond 
                          ? 'bg-neutral-300 text-black font-bold' 
                          : 'bg-amber-700 text-white font-bold'
                      }`}>
                        PODIUM #{podium.rank}
                      </span>
                      <span className="text-neutral-400 text-[11px] font-mono">
                        {podium.solvesCount} {podium.solvesCount === 1 ? 'Solve' : 'Solves'}
                      </span>
                    </div>
                    <div className="text-white font-bold text-base flex items-center justify-between">
                      <span className="truncate">{podium.username}</span>
                      <span className="text-[#FCEE09] font-black">{podium.totalScore} PTS</span>
                    </div>
                    {podium.teamName && (
                      <div className="text-[11px] text-neutral-500 font-mono mt-1">
                        [{podium.teamName}]
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="cyber-card border border-[#FCEE09]/20 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-neutral-900/80 border-b border-[#FCEE09]/20 text-[#FCEE09] uppercase">
                <tr>
                  <th className="py-3 px-4">RANK</th>
                  <th className="py-3 px-4">OPERATIVE / SQUAD</th>
                  <th className="py-3 px-4 text-center">SOLVES</th>
                  <th className="py-3 px-4 text-right">TOTAL POINTS</th>
                  <th className="py-3 px-4 text-right">LAST SOLVE TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {eventScoreboard.map((entry) => {
                  const isUser = currentUser?.id === entry.userId;
                  return (
                    <tr
                      key={entry.userId}
                      className={`hover:bg-[#FCEE09]/5 transition ${
                        isUser ? 'bg-[#FCEE09]/10 font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold">
                        <span className={`inline-block w-6 text-center ${
                          entry.rank === 1 ? 'text-[#FCEE09] text-sm' :
                          entry.rank === 2 ? 'text-neutral-300' :
                          entry.rank === 3 ? 'text-amber-600' : 'text-neutral-500'
                        }`}>
                          #{entry.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-white font-bold flex items-center gap-2">
                          <span>{entry.username}</span>
                          {isUser && (
                            <span className="text-[10px] bg-[#FCEE09] text-black px-1.5 py-0.2">
                              YOU
                            </span>
                          )}
                        </div>
                        {entry.teamName && (
                          <div className="text-[11px] text-neutral-500">[{entry.teamName}]</div>
                        )}
                        {/* Solved challenge category tags */}
                        {entry.solves && entry.solves.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {entry.solves.map((s) => {
                              const chal = challenges.find(c => c.id === s.challengeId);
                              return (
                                <span
                                  key={s.challengeId}
                                  className="text-[9px] px-1.5 py-0.5 bg-neutral-900 border border-[#FCEE09]/30 text-[#FCEE09] font-mono"
                                  title={`${chal?.title || 'Challenge'} (${s.points} PTS)`}
                                >
                                  ✓ {chal?.category.split(' ')[0].toUpperCase() || 'FLAG'}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center text-neutral-300">
                        {entry.solvesCount}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-[#FCEE09] text-sm">
                        {entry.totalScore}
                      </td>

                      <td className="py-3.5 px-4 text-right text-neutral-500 text-[11px]">
                        {entry.lastSolveTime 
                          ? new Date(entry.lastSolveTime).toLocaleTimeString('en-US', { hour12: false }) 
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {eventScoreboard.length === 0 && <div className="border border-neutral-800 p-8 text-center text-sm text-neutral-400">No scores have been recorded for this CTF event yet.</div>}

        </div>
      )}

      {/* =========================================================================
          TAB 3: ALL OPERATIONS & SESSIONS (Workshops, Talks, CTF Teasers)
          ========================================================================= */}
      {activeTab === 'operations' && (
        <div className="space-y-8">
          
          {/* Header & Admin Trigger */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#FCEE09]/20 pb-4">
            <div>
              <h2 className="text-xl font-mono font-bold text-white uppercase">
                CLUB SESSIONS, WORKSHOPS & CTF TEASERS
              </h2>
              <div className="text-xs font-mono text-neutral-400 mt-1">
                Archive of past technical engagements, upcoming bootcamps, and future CTF operations.
              </div>
            </div>

            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => setShowAddEventModal(true)}
                className="cyber-btn-yellow px-4 py-2 text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>ADD NEW EVENT</span>
              </button>
            )}
          </div>

          {/* Events List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="cyber-card p-6 border border-[#FCEE09]/25 hover:border-[#FCEE09] transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                      evt.type === 'CTF' 
                        ? 'bg-red-950 text-red-400 border-red-800' 
                        : 'bg-[#FCEE09]/10 text-[#FCEE09] border-[#FCEE09]/30'
                    }`}>
                      {evt.type}
                    </span>

                    {evt.isLiveCTF ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        LIVE CTF OPERATION
                      </span>
                    ) : (
                      <span className="text-neutral-500 text-[11px]">SCHEDULED SESSION</span>
                    )}
                  </div>

                  <h3 className="font-mono text-lg font-bold text-white uppercase leading-snug">
                    {evt.title}
                  </h3>

                  <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800 space-y-2 text-xs font-mono text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#FCEE09]" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#FCEE09]" />
                    <span>{evt.startTime} - {evt.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FCEE09]" />
                    <span>{evt.location}</span>
                  </div>

                  {evt.isLiveCTF && (
                    <div className="pt-3">
                      <button
                        onClick={() => setActiveTab('arena')}
                        className="cyber-btn-yellow w-full py-2 text-xs text-center flex items-center justify-center gap-2"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>ACCESS LIVE CTF ARENA</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          MODAL: CHALLENGE DETAILS & FLAG SUBMISSION HUD
          ========================================================================= */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-[#FCEE09] p-6 sm:p-8 font-mono text-white shadow-[0_0_50px_rgba(252,238,9,0.25)] max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveChallenge(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#FCEE09]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Challenge Header */}
            <div className="space-y-3 mb-6 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-[#FCEE09] px-2 py-0.5 bg-[#FCEE09]/10 border border-[#FCEE09]/30 text-xs">
                  {activeChallenge.category}
                </span>
                <span className="text-xs text-neutral-400">
                  {activeChallenge.type === 'DYNAMIC' ? 'DYNAMIC DECAY SCORING' : 'STANDARD FIXED'}
                </span>
              </div>
              <h2 className="text-2xl font-bold uppercase">{activeChallenge.title}</h2>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-[#FCEE09] font-black text-lg">
                  {activeChallenge.currentPoints} PTS
                </span>
                <span className="text-neutral-500">
                  {getChallengeSolvesCount(activeChallenge.id)} Solves Recorded
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 space-y-4 text-xs text-neutral-300 leading-relaxed whitespace-pre-line bg-black/60 p-4 border border-neutral-850">
              {activeChallenge.description}
            </div>

            {/* Hints Section */}
            {activeChallenge.hints && activeChallenge.hints.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="text-xs font-bold text-[#FCEE09] uppercase flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>TACTICAL INTEL / HINTS</span>
                </div>
                {activeChallenge.hints.map((hint, idx) => {
                  const isUnlocked = unlockedHints.some(
                    h => h.userId === currentUser?.id && h.challengeId === activeChallenge.id
                  );
                  return (
                    <div key={hint.id} className="p-3 bg-neutral-900 border border-neutral-800 text-xs">
                      {isUnlocked ? (
                        <div className="text-yellow-300">{hint.content}</div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Tactical Hint #{idx + 1} (Encrypted)</span>
                          <button
                            onClick={() => handleHintUnlock(hint.id, hint.cost)}
                            className="cyber-btn-outline px-3 py-1 text-[11px]"
                          >
                            UNLOCK (-{hint.cost} PTS)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Flag Submission Form */}
            {isSolvedByCurrentUser(activeChallenge.id) ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-600 text-emerald-400 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold">FLAG CAPTURED!</span> You have successfully exploited this objective. Points are locked into the scoreboard.
                </div>
              </div>
            ) : (
              <form onSubmit={handleFlagSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#FCEE09] uppercase font-bold flex items-center gap-2">
                      <Flag className="w-3.5 h-3.5" />
                      <span>SUBMIT FLAG IDENTIFIER</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFlagInput('ciberNUtica{');
                        }}
                        className="text-[10px] text-neutral-400 hover:text-[#FCEE09] transition flex items-center gap-1 cursor-pointer"
                        title="Auto-fill flag prefix"
                      >
                        <Copy className="w-3 h-3" />
                        <span>PREFIX [ciberNUtica{'{'}]</span>
                      </button>
                      <span className={`text-[10px] font-mono ${
                        (activeChallenge ? getSubmissionAttempts(activeChallenge.id) : 0) >= 4 
                          ? 'text-red-400 font-bold' 
                          : 'text-neutral-500'
                      }`}>
                        LIMIT: {activeChallenge ? getSubmissionAttempts(activeChallenge.id) : 0}/5 ATTEMPTS
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      placeholder="ciberNUtica{...}"
                      className="flex-grow bg-black border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FCEE09] font-mono"
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !flagInput.trim()}
                      className="cyber-btn-yellow px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>SUBMIT</span>
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {submissionFeedback && (
                  <div className={`p-3 border text-xs font-mono ${
                    submissionFeedback.type === 'success' 
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' 
                      : submissionFeedback.type === 'info'
                      ? 'bg-yellow-950/40 border-[#FCEE09] text-yellow-300'
                      : 'bg-red-950/40 border-red-600 text-red-300'
                  }`}>
                    {submissionFeedback.message}
                  </div>
                )}
              </form>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN MODAL: CREATE EVENT
          ========================================================================= */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-neutral-950 border border-[#FCEE09] p-6 font-mono text-white shadow-[0_0_40px_rgba(252,238,9,0.2)]">
            <button
              onClick={() => setShowAddEventModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#FCEE09]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#FCEE09] mb-4 uppercase flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>DISPATCH NEW OPERATION / EVENT</span>
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">EVENT TITLE</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Reverse Engineering Deep Dive"
                  className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-[#FCEE09] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">EVENT TYPE</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                    className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-[#FCEE09] outline-none"
                  >
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="SESSION">SESSION</option>
                    <option value="TALK">SPEAKER TALK</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">DATE</label>
                  <input
                    type="text"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    placeholder="e.g. DEC 12, 2026"
                    className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-[#FCEE09] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">START - END TIME</label>
                  <input
                    type="text"
                    required
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    placeholder="14:00 - 18:00 UTC"
                    className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-[#FCEE09] outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">LOCATION / VENUE</label>
                  <input
                    type="text"
                    required
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Cyber Lab 4 / Discord"
                    className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-[#FCEE09] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  required
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Overview of the technical agenda..."
                  className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-[#FCEE09] outline-none"
                />
              </div>

              <button
                type="submit"
                className="cyber-btn-yellow w-full py-2.5 text-xs font-bold uppercase mt-4"
              >
                PUBLISH OPERATION
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
