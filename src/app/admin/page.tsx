'use client';

import React, { useState } from 'react';
import { useCTF } from '@/lib/store';
import { 
  Terminal, 
  Plus, 
  Trash2, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  TrendingDown, 
  Flame, 
  Calendar, 
  BookOpen, 
  Eye, 
  EyeOff,
  Radio,
  Clock,
  Edit3,
  Zap,
  RotateCcw,
  X
} from 'lucide-react';
import { Challenge, ChallengeCategory, ChallengeType, EventType, FlagType } from '@/lib/types';

export default function AdminPortalPage() {
  const { 
    challenges, 
    refreshCtfState,
    addChallenge, 
    updateChallenge,
    deleteChallenge,
    clearSubmissions,
    events, 
    addEvent,
    updateEvent, 
    submissions,
    isScoreboardFrozen, 
    setIsScoreboardFrozen,
    blogs,
    addBlogPost,
    deleteBlogPost
  } = useCTF();

  const [activeTab, setActiveTab] = useState<'events' | 'submissions' | 'blogs'>('events');
  const ctfEvents = events.filter(event => event.type === 'CTF');
  const [selectedCtfEventId, setSelectedCtfEventId] = useState('');
  const selectedCtfEvent = ctfEvents.find(event => event.id === selectedCtfEventId) ?? ctfEvents[0];
  const eventChallenges = challenges.filter(challenge => challenge.eventId === selectedCtfEvent?.id);
  const [newEvent, setNewEvent] = useState({ kind: 'GENERAL' as 'CTF' | 'GENERAL', type: 'SESSION' as EventType, title: '', description: '', location: '', date: '', endDate: '', startTime: '09:00', endTime: '17:00', isPublished: false });
  const [newBlog, setNewBlog] = useState({ title: '', slug: '', summary: '', content: '', category: 'Vulnerabilities', authorName: 'Command Staff', authorRole: 'Command Staff', readTime: '5 min read' });

  // New challenge form state
  const [showAddChalModal, setShowAddChalModal] = useState(false);
  const [newChal, setNewChal] = useState({
    title: '',
    category: 'Web Exploitation' as ChallengeCategory,
    description: '',
    type: 'DYNAMIC' as ChallengeType,
    initialPoints: 500,
    minPoints: 100,
    decaySolves: 15,
    state: 'visible' as 'visible' | 'hidden',
    maxAttempts: 0,
    flagContent: 'ciberNUtica{example_flag}',
    flagType: 'STATIC' as FlagType,
    flagCaseSensitive: true,
    hintContent: '',
    hintCost: 20
  });

  // Edit challenge form state
  const [showEditChalModal, setShowEditChalModal] = useState(false);
  const [editingChal, setEditingChal] = useState<{
    id: string;
    title: string;
    category: ChallengeCategory;
    description: string;
    type: ChallengeType;
    initialPoints: number;
    minPoints: number;
    decaySolves: number;
    flagContent: string;
    flagType: FlagType;
    hintContent: string;
    hintCost: number;
  } | null>(null);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCtfEvent || !newChal.title || !newChal.flagContent) return;

    try { await addChallenge({
      eventId: selectedCtfEvent.id,
      title: newChal.title,
      category: newChal.category,
      description: newChal.description,
      type: newChal.type,
      initialPoints: Number(newChal.initialPoints),
      minPoints: Number(newChal.minPoints),
      decaySolves: Number(newChal.decaySolves),
      state: newChal.state,
      maxAttempts: 0,
      flags: [
        {
          id: `f-${Date.now()}`,
          challengeId: '',
          type: newChal.flagType,
          content: newChal.flagContent,
          caseSensitive: newChal.flagCaseSensitive
        }
      ],
      hints: newChal.hintContent ? [
        {
          id: `h-${Date.now()}`,
          challengeId: '',
          content: newChal.hintContent,
          cost: Number(newChal.hintCost)
        }
      ] : []
    }); } catch (error) { window.alert(error instanceof Error ? error.message : 'Unable to create challenge.'); return; }

    setShowAddChalModal(false);
    setNewChal({
      title: '',
      category: 'Web Exploitation',
      description: '',
      type: 'DYNAMIC',
      initialPoints: 500,
      minPoints: 100,
      decaySolves: 15,
      state: 'visible',
      maxAttempts: 0,
      flagContent: 'ciberNUtica{example_flag}',
      flagType: 'STATIC',
      flagCaseSensitive: true,
      hintContent: '',
      hintCost: 20
    });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEvent({ title: newEvent.title, slug: '', description: newEvent.description, type: newEvent.kind === 'CTF' ? 'CTF' : newEvent.type, location: newEvent.location, date: newEvent.date, startDate: newEvent.date, endDate: newEvent.kind === 'CTF' ? (newEvent.endDate || newEvent.date) : newEvent.date, startTime: `${newEvent.startTime} UTC`, endTime: `${newEvent.endTime} UTC`, isPublished: newEvent.isPublished, isLiveCTF: false });
      setNewEvent({ kind: 'GENERAL', type: 'SESSION', title: '', description: '', location: '', date: '', endDate: '', startTime: '09:00', endTime: '17:00', isPublished: false });
    } catch (error) { window.alert(error instanceof Error ? error.message : 'Unable to create event.'); }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBlogPost({ ...newBlog, slug: newBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
      setNewBlog({ title: '', slug: '', summary: '', content: '', category: 'Vulnerabilities', authorName: 'Command Staff', authorRole: 'Command Staff', readTime: '5 min read' });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to publish blog post.');
    }
  };

  const handleSaveEditedChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChal || !editingChal.title) return;

    const update: Partial<Challenge> = {
      title: editingChal.title,
      category: editingChal.category,
      description: editingChal.description,
      type: editingChal.type,
      initialPoints: Number(editingChal.initialPoints),
      minPoints: Number(editingChal.minPoints),
      decaySolves: Number(editingChal.decaySolves),
      flags: editingChal.flagContent ? [
        {
          id: `f-${Date.now()}`,
          challengeId: editingChal.id,
          type: editingChal.flagType,
          content: editingChal.flagContent,
          caseSensitive: true
        }
      ] : undefined,
      hints: editingChal.hintContent ? [
        {
          id: `h-${Date.now()}`,
          challengeId: editingChal.id,
          content: editingChal.hintContent,
          cost: Number(editingChal.hintCost)
        }
      ] : []
    };
    try { await updateChallenge(editingChal.id, update); }
    catch (error) { window.alert(error instanceof Error ? error.message : 'Unable to update challenge.'); return; }

    setShowEditChalModal(false);
    setEditingChal(null);
  };

  const handleSimulateBruteForce = () => {
    if (challenges.length === 0) return;
    const target = challenges[0];
    void fetch('/api/ctf/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId: target.id }) })
      .then(async response => { if (!response.ok) throw new Error(); await refreshCtfState(); })
      .catch(() => window.alert('Unable to create simulation records.'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-mono">
      
      {/* Top Banner */}
      <div className="border border-[#FCEE09] bg-neutral-950 p-6 sm:p-8 relative shadow-[0_0_30px_rgba(252,238,9,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs text-[#FCEE09] uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#FCEE09] animate-pulse"></span>
              COMMAND ACCESS // LEVEL 4 RBAC GRANTED
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              ADMIN CONTROL CONSOLE
            </h1>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              Configure CTFd-compatible challenges, manage dynamic scoring decay curves, review real-time anti-cheat submission telemetry, and orchestrate club events.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-black border border-neutral-800 p-3 text-xs">
            <div>
              <span className="text-neutral-500">SCOREBOARD:</span>{' '}
              <span className={isScoreboardFrozen ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {isScoreboardFrozen ? 'FROZEN' : 'BROADCASTING'}
              </span>
            </div>
            <button
              onClick={() => { void setIsScoreboardFrozen(!isScoreboardFrozen).catch(() => window.alert('Unable to update scoreboard state.')); }}
              className="px-2.5 py-1 text-[10px] font-bold border border-[#FCEE09] text-[#FCEE09] hover:bg-[#FCEE09] hover:text-black transition"
            >
              TOGGLE FREEZE
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#FCEE09]/20 pb-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 border transition ${
            activeTab === 'events'
              ? 'border-[#FCEE09] bg-[#FCEE09] text-black'
              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
          }`}
        >
          EVENTS ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 border transition ${
            activeTab === 'submissions'
              ? 'border-[#FCEE09] bg-[#FCEE09] text-black'
              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
          }`}
        >
          ANTI-CHEAT LOGS ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab('blogs')}
          className={`px-4 py-2 border transition ${
            activeTab === 'blogs'
              ? 'border-[#FCEE09] bg-[#FCEE09] text-black'
              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
          }`}
        >
          BLOG POSTS ({blogs.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CTF CHALLENGE MANAGEMENT (Static & Dynamic Scoring)
          ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FCEE09]" />
              <span>CTF EVENTS & CHALLENGES</span>
            </h2>

            <button disabled={!selectedCtfEvent} onClick={() => setShowAddChalModal(true)} className="cyber-btn-yellow px-4 py-2 text-xs flex items-center gap-2 disabled:opacity-40">
              <Plus className="w-4 h-4" />
              <span>ADD CHALLENGE</span>
            </button>
          </div>

          <p className="text-xs leading-relaxed text-neutral-400">
            Create a CTF, session, or workshop here. Once you create a CTF, select it below and use <span className="text-[#FCEE09]">ADD CHALLENGE</span> to attach challenges.
          </p>

          <form onSubmit={handleCreateEvent} className="cyber-card space-y-4 border border-[#FCEE09]/25 p-5">
            <h3 className="text-sm font-bold uppercase text-[#FCEE09]">CREATE EVENT</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-[10px] text-neutral-400">EVENT KIND
                <select value={newEvent.kind} onChange={e => setNewEvent({ ...newEvent, kind: e.target.value as 'CTF' | 'GENERAL', isPublished: e.target.value === 'GENERAL' })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white">
                  <option value="GENERAL">GENERAL EVENT — SESSION / WORKSHOP / TALK</option><option value="CTF">CTF COMPETITION — WITH CHALLENGES</option>
                </select>
              </label>
              <label className="text-[10px] text-neutral-400">EVENT TITLE
                <input required maxLength={160} value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder={newEvent.kind === 'CTF' ? 'Winter CTF 2026' : 'Security workshop'} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" />
              </label>
              {newEvent.kind === 'GENERAL' && <label className="text-[10px] text-neutral-400">GENERAL EVENT TYPE
                <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as EventType })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white"><option value="SESSION">SESSION</option><option value="WORKSHOP">WORKSHOP</option><option value="TALK">SPEAKER TALK</option></select>
              </label>}
              <label className="text-[10px] text-neutral-400">{newEvent.kind === 'CTF' ? 'START DATE (UTC)' : 'DATE'}
                <input required type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value, endDate: newEvent.endDate && newEvent.endDate < e.target.value ? e.target.value : newEvent.endDate })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" />
              </label>
              {newEvent.kind === 'CTF' ? <label className="text-[10px] text-neutral-400">END DATE (UTC)
                <input required type="date" min={newEvent.date} value={newEvent.endDate || newEvent.date} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" />
              </label> : <label className="text-[10px] text-neutral-400">LOCATION / VENUE
                <input required maxLength={200} value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Campus / online" className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" />
              </label>}
              <label className="text-[10px] text-neutral-400">START TIME (UTC)<input required type="time" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" /></label>
              <label className="text-[10px] text-neutral-400">END TIME (UTC)<input required type="time" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" /></label>
            </div>
            <label className="block text-[10px] text-neutral-400">DESCRIPTION<textarea required maxLength={5000} rows={3} value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" /></label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-neutral-300"><input type="checkbox" checked={newEvent.isPublished} onChange={e => setNewEvent({ ...newEvent, isPublished: e.target.checked })} /> Visible to users when created</label>
              <button className="cyber-btn-yellow px-4 py-2 text-xs">{newEvent.kind === 'CTF' ? 'CREATE CTF EVENT' : 'CREATE GENERAL EVENT'}</button>
            </div>
          </form>

          {ctfEvents.length > 0 ? <div className="space-y-3"><label className="block text-xs text-neutral-400">SELECT CTF EVENT</label><select value={selectedCtfEvent?.id ?? ''} onChange={e => setSelectedCtfEventId(e.target.value)} className="w-full max-w-xl bg-black border border-[#FCEE09]/40 p-3 text-white">{ctfEvents.map(event => <option key={event.id} value={event.id}>{event.title} — {event.date}</option>)}</select><div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400"><span>{selectedCtfEvent?.date} · {selectedCtfEvent?.startTime}–{selectedCtfEvent?.endTime}</span><button onClick={() => selectedCtfEvent && void updateEvent(selectedCtfEvent.id, { isPublished: !selectedCtfEvent.isPublished }).catch(() => window.alert('Unable to update event visibility.'))} className="px-3 py-1 border border-neutral-700 hover:border-[#FCEE09]">{selectedCtfEvent?.isPublished ? 'HIDE FROM USERS' : 'PUBLISH EVENT'}</button><button onClick={() => selectedCtfEvent && void updateEvent(selectedCtfEvent.id, { isLiveCTF: !selectedCtfEvent.isLiveCTF }).catch(() => window.alert('Unable to update event state.'))} className="px-3 py-1 border border-neutral-700 hover:border-emerald-400">{selectedCtfEvent?.isLiveCTF ? 'CLOSE SUBMISSIONS' : 'OPEN SUBMISSIONS'}</button></div></div> : <p className="border border-neutral-800 p-6 text-sm text-neutral-400">Create a CTF from the event form below to start adding challenges.</p>}

          <div className="cyber-card border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[#FCEE09]">
                <tr>
                  <th className="py-3 px-4">TITLE</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">SCORING TYPE</th>
                  <th className="py-3 px-4">CURRENT POINTS</th>
                  <th className="py-3 px-4">FLAG PATTERN</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {eventChallenges.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/50">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {c.title}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {c.category}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.type === 'DYNAMIC' ? (
                        <span className="text-yellow-400 text-[11px] flex items-center gap-1 font-bold">
                          <TrendingDown className="w-3.5 h-3.5" />
                          DYNAMIC (DECAY: {c.decaySolves})
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">
                          STANDARD FIXED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#FCEE09]">
                      {c.currentPoints} PTS
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                      {c.flags[0]?.content || 'PROTECTED'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button onClick={() => { void updateChallenge(c.id, { state: c.state === 'visible' ? 'hidden' : 'visible' }).catch(() => window.alert('Unable to update challenge visibility.')); }} className="text-neutral-400 hover:text-[#FCEE09] p-1 inline-block" title={c.state === 'visible' ? 'Hide from participants' : 'Show to participants'}>
                        {c.state === 'visible' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingChal({
                            id: c.id,
                            title: c.title,
                            category: c.category,
                            description: c.description,
                            type: c.type,
                            initialPoints: c.initialPoints,
                            minPoints: c.minPoints,
                            decaySolves: c.decaySolves,
                            flagContent: c.flags[0]?.content || '',
                            flagType: c.flags[0]?.type || 'STATIC',
                            hintContent: c.hints[0]?.content || '',
                            hintCost: c.hints[0]?.cost || 20
                          });
                          setShowEditChalModal(true);
                        }}
                        className="text-[#FCEE09] hover:text-white p-1 inline-block"
                        title="Edit Challenge"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { void deleteChallenge(c.id).catch(() => window.alert('Unable to delete challenge.')); }}
                        className="text-red-400 hover:text-red-300 p-1 inline-block"
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ANTI-CHEAT SUBMISSIONS AUDIT LOG
          ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#FCEE09]" />
                <span>REAL-TIME FLAG SUBMISSION LOGS</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Forensic trace of all competitor attempts to detect automated brute force, script loops, or flag sharing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSimulateBruteForce}
                className="cyber-btn-outline px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                title="Fire 6 rapid guesses to test rate limiter cooldown"
              >
                <Zap className="w-3.5 h-3.5 text-[#FCEE09]" />
                <span>SIMULATE BRUTE FORCE</span>
              </button>
              <button
                onClick={() => { void clearSubmissions().catch(() => window.alert('Unable to clear the audit log.')); }}
                disabled={submissions.length === 0}
                className="px-3 py-1.5 text-xs border border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900/60 disabled:opacity-40 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>CLEAR AUDIT LOG</span>
              </button>
            </div>
          </div>

          <div className="cyber-card border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[#FCEE09]">
                <tr>
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">COMPETITOR</th>
                  <th className="py-3 px-4">CHALLENGE</th>
                  <th className="py-3 px-4">FLAG FINGERPRINT</th>
                  <th className="py-3 px-4 text-right">VERDICT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-neutral-500">
                      No submission records yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-neutral-900/50">
                      <td className="py-3 px-4 text-neutral-500 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {sub.username}
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        {sub.challengeTitle}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                        {sub.providedFlag}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {sub.isCorrect ? (
                          <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            CORRECT
                          </span>
                        ) : (
                          <span className="text-red-400 font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            INVALID
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: EVENTS & CTF ARENA TOGGLES
          ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FCEE09]" />
            <span>EVENT MANAGEMENT</span>
          </h2>
          <p className="max-w-3xl text-xs leading-relaxed text-neutral-400">
            CTFs are competition events with challenges managed in the CTF workspace. Workshops, talks, and sessions are informational events and never require challenges.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => (
              <div key={evt.id} className="p-6 bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] border px-2 py-0.5 ${evt.type === 'CTF' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-[#FCEE09]/10 text-[#FCEE09] border-[#FCEE09]/30'}`}>
                    {evt.type === 'CTF' ? 'CTF COMPETITION' : `${evt.type} · GENERAL EVENT`}
                  </span>
                  {evt.type === 'CTF' && <button
                    onClick={() => { void updateEvent(evt.id, { isLiveCTF: !evt.isLiveCTF }).catch(() => window.alert('Unable to update event.')); }}
                    className={`px-3 py-1 text-xs font-bold border transition ${
                      evt.isLiveCTF
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                        : 'border-neutral-700 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    {evt.isLiveCTF ? '● LIVE CTF ACTIVE' : '○ CTF MODE OFF'}
                  </button>}
                </div>

                <h3 className="font-bold text-white text-base">{evt.title}</h3>
                <p className="text-neutral-400 text-xs">{evt.description}</p>
                <div className="text-[11px] text-neutral-500">
                  DATE: {evt.date} // TIME: {evt.startTime} - {evt.endTime}
                </div>
                {evt.type === 'CTF' && <form onSubmit={e => { e.preventDefault(); const fields = new FormData(e.currentTarget); void updateEvent(evt.id, { date: String(fields.get('date')), endDate: String(fields.get('endDate')), startTime: `${String(fields.get('start'))} UTC`, endTime: `${String(fields.get('end'))} UTC` }).catch(() => window.alert('Unable to update CTF schedule.')); }} className="grid grid-cols-2 gap-2">
                  <input aria-label="CTF start date" required type="date" name="date" defaultValue={evt.startDate} className="bg-black border border-neutral-800 p-2 text-white text-xs" />
                  <input aria-label="CTF end date" required type="date" name="endDate" min={evt.startDate} defaultValue={evt.endDate} className="bg-black border border-neutral-800 p-2 text-white text-xs" />
                  <input aria-label="CTF start time" required type="time" name="start" defaultValue={evt.startTime.slice(0, 5)} className="bg-black border border-neutral-800 p-2 text-white text-xs" />
                  <input aria-label="CTF end time" required type="time" name="end" defaultValue={evt.endTime.slice(0, 5)} className="bg-black border border-neutral-800 p-2 text-white text-xs" />
                  <button className="col-span-2 px-3 py-1 text-xs border border-neutral-700 text-neutral-300 hover:border-[#FCEE09]">SAVE CTF SCHEDULE</button>
                </form>}
                <button onClick={() => { void updateEvent(evt.id, { isPublished: !evt.isPublished }).catch(() => window.alert('Unable to update event visibility.')); }} className="px-3 py-1 text-xs font-bold border border-neutral-700 text-neutral-300 hover:border-[#FCEE09]">{evt.isPublished ? 'VISIBLE TO USERS — HIDE' : 'HIDDEN — PUBLISH'}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BLOGS
          ========================================================================= */}
      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white uppercase flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#FCEE09]" />
            <span>CREATE & MANAGE BLOG POSTS</span>
          </h2>

          <form onSubmit={handleCreateBlog} className="cyber-card space-y-4 border border-[#FCEE09]/25 p-5">
            <h3 className="text-sm font-bold uppercase text-[#FCEE09]">PUBLISH NEW POST</h3>
            <label className="block text-[10px] text-neutral-400">TITLE
              <input required maxLength={160} value={newBlog.title} onChange={e => setNewBlog({ ...newBlog, title: e.target.value })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" placeholder="Blog post title" />
            </label>
            <div className="grid gap-3">
              <label className="text-[10px] text-neutral-400">CATEGORY
                <select value={newBlog.category} onChange={e => setNewBlog({ ...newBlog, category: e.target.value })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white"><option>Club Writeups</option><option>Cybernews</option><option>Vulnerabilities</option></select>
              </label>
            </div>
            <label className="block text-[10px] text-neutral-400">SUMMARY
              <textarea required maxLength={500} rows={2} value={newBlog.summary} onChange={e => setNewBlog({ ...newBlog, summary: e.target.value })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white" placeholder="Short summary shown on the dispatch card" />
            </label>
            <label className="block text-[10px] text-neutral-400">ARTICLE CONTENT (MARKDOWN)
              <textarea required maxLength={100000} rows={12} value={newBlog.content} onChange={e => setNewBlog({ ...newBlog, content: e.target.value })} className="mt-1 w-full bg-black border border-neutral-800 p-2 text-xs text-white font-mono" placeholder="## Technical breakdown..." />
            </label>
            <button className="cyber-btn-yellow px-4 py-2 text-xs">PUBLISH BLOG POST</button>
          </form>

          <div className="cyber-card border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-[#FCEE09]">
                <tr>
                  <th className="py-3 px-4">HEADLINE</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">AUTHOR</th>
                  <th className="py-3 px-4">PUBLISHED DATE</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-900/50">
                    <td className="py-3 px-4 font-bold text-white">{b.title}</td>
                    <td className="py-3 px-4 text-neutral-400">{b.category}</td>
                    <td className="py-3 px-4 text-neutral-300">{b.authorName}</td>
                    <td className="py-3 px-4 text-neutral-500">{b.publishedAt}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => { void deleteBlogPost(b.id).catch(() => window.alert('Unable to delete this dispatch. Please try again.')); }}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN MODAL: EDIT CHALLENGE
          ========================================================================= */}
      {showEditChalModal && editingChal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-[#FCEE09] p-6 sm:p-8 font-mono text-white shadow-[0_0_40px_rgba(252,238,9,0.2)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowEditChalModal(false);
                setEditingChal(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#FCEE09]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#FCEE09] mb-4 uppercase flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>EDIT CTFd CHALLENGE SPECIFICATIONS</span>
            </h3>

            <form onSubmit={handleSaveEditedChallenge} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">CHALLENGE TITLE</label>
                <input
                  type="text"
                  required
                  value={editingChal.title}
                  onChange={(e) => setEditingChal({ ...editingChal, title: e.target.value })}
                  className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-400 block mb-1">CATEGORY</label>
                  <select
                    value={editingChal.category}
                    onChange={(e) => setEditingChal({ ...editingChal, category: e.target.value as ChallengeCategory })}
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  >
                    <option value="Web Exploitation">Web Exploitation</option>
                    <option value="Reverse Engineering">Reverse Engineering</option>
                    <option value="Cryptography">Cryptography</option>
                    <option value="Binary Exploitation">Binary Exploitation</option>
                    <option value="Forensics">Forensics</option>
                    <option value="OSINT">OSINT</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">SCORING ALGORITHM</label>
                  <select
                    value={editingChal.type}
                    onChange={(e) => setEditingChal({ ...editingChal, type: e.target.value as ChallengeType })}
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  >
                    <option value="DYNAMIC">DYNAMIC VALUE (CTFd Decay Formula)</option>
                    <option value="STANDARD">STANDARD VALUE (Fixed Points)</option>
                  </select>
                </div>
              </div>

              {editingChal.type === 'DYNAMIC' && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-900 border border-neutral-800">
                  <div>
                    <label className="text-neutral-400 block mb-1">INITIAL VALUE</label>
                    <input
                      type="number"
                      required
                      value={editingChal.initialPoints}
                      onChange={(e) => setEditingChal({ ...editingChal, initialPoints: Number(e.target.value) })}
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">MINIMUM VALUE</label>
                    <input
                      type="number"
                      required
                      value={editingChal.minPoints}
                      onChange={(e) => setEditingChal({ ...editingChal, minPoints: Number(e.target.value) })}
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">DECAY SOLVES</label>
                    <input
                      type="number"
                      required
                      value={editingChal.decaySolves}
                      onChange={(e) => setEditingChal({ ...editingChal, decaySolves: Number(e.target.value) })}
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="text-[#FCEE09] font-bold text-[11px]">FLAG VERIFICATION RULE</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">FLAG MATCH TYPE</label>
                    <select
                      value={editingChal.flagType}
                      onChange={(e) => setEditingChal({ ...editingChal, flagType: e.target.value as FlagType })}
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    >
                      <option value="STATIC">STATIC EXACT STRING</option>
                      <option value="REGEX">REGEX PATTERN</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">SECRET FLAG</label>
                    <input
                      type="text"
                      value={editingChal.flagContent}
                      onChange={(e) => setEditingChal({ ...editingChal, flagContent: e.target.value })}
                      placeholder="Leave blank to keep the current flag"
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">DESCRIPTION (MARKDOWN)</label>
                <textarea
                  rows={4}
                  required
                  value={editingChal.description}
                  onChange={(e) => setEditingChal({ ...editingChal, description: e.target.value })}
                  className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-neutral-400 block mb-1">TACTICAL HINT</label>
                  <input
                    type="text"
                    value={editingChal.hintContent}
                    onChange={(e) => setEditingChal({ ...editingChal, hintContent: e.target.value })}
                    placeholder="Clue for struggling competitors..."
                    className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">HINT COST (PENALTY)</label>
                  <input
                    type="number"
                    value={editingChal.hintCost}
                    onChange={(e) => setEditingChal({ ...editingChal, hintCost: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditChalModal(false);
                    setEditingChal(null);
                  }}
                  className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="cyber-btn-yellow px-5 py-2 cursor-pointer"
                >
                  UPDATE & RECALCULATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW CTFd CHALLENGE
          ========================================================================= */}
      {showAddChalModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-[#FCEE09] p-6 sm:p-8 text-white shadow-[0_0_40px_rgba(252,238,9,0.25)] max-h-[90vh] overflow-y-auto">
            
            <h3 className="text-base font-bold text-[#FCEE09] mb-6 uppercase flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>CONFIGURE NEW CTFd CHALLENGE</span>
            </h3>

            <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">CHALLENGE TITLE</label>
                <input
                  type="text"
                  required
                  value={newChal.title}
                  onChange={(e) => setNewChal({ ...newChal, title: e.target.value })}
                  placeholder="e.g. Memory Breach: UAF Heap Spraying"
                  className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">CATEGORY</label>
                  <select
                    value={newChal.category}
                    onChange={(e) => setNewChal({ ...newChal, category: e.target.value as ChallengeCategory })}
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  >
                    <option value="Web Exploitation">Web Exploitation</option>
                    <option value="Reverse Engineering">Reverse Engineering</option>
                    <option value="Cryptography">Cryptography</option>
                    <option value="Binary Exploitation">Binary Exploitation</option>
                    <option value="Forensics">Forensics</option>
                    <option value="OSINT">OSINT</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">SCORING ALGORITHM</label>
                  <select
                    value={newChal.type}
                    onChange={(e) => setNewChal({ ...newChal, type: e.target.value as ChallengeType })}
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  >
                    <option value="DYNAMIC">DYNAMIC VALUE (CTFd Decay Formula)</option>
                    <option value="STANDARD">STANDARD VALUE (Fixed Points)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Decay Parameters if Dynamic */}
              {newChal.type === 'DYNAMIC' && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-900 border border-neutral-800">
                  <div>
                    <label className="text-neutral-400 block mb-1">INITIAL VALUE</label>
                    <input
                      type="number"
                      required
                      value={newChal.initialPoints}
                      onChange={(e) => setNewChal({ ...newChal, initialPoints: Number(e.target.value) })}
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">MINIMUM VALUE</label>
                    <input
                      type="number"
                      required
                      value={newChal.minPoints}
                      onChange={(e) => setNewChal({ ...newChal, minPoints: Number(e.target.value) })}
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">DECAY SOLVES</label>
                    <input
                      type="number"
                      required
                      value={newChal.decaySolves}
                      onChange={(e) => setNewChal({ ...newChal, decaySolves: Number(e.target.value) })}
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Flag Config */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="text-[#FCEE09] font-bold text-[11px]">FLAG VERIFICATION RULE</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">FLAG MATCH TYPE</label>
                    <select
                      value={newChal.flagType}
                      onChange={(e) => setNewChal({ ...newChal, flagType: e.target.value as FlagType })}
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    >
                      <option value="STATIC">STATIC EXACT STRING</option>
                      <option value="REGEX">REGEX PATTERN</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">SECRET FLAG</label>
                    <input
                      type="text"
                      required
                      value={newChal.flagContent}
                      onChange={(e) => setNewChal({ ...newChal, flagContent: e.target.value })}
                      placeholder="ciberNUtica{...}"
                      className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">DESCRIPTION (MARKDOWN)</label>
                <textarea
                  rows={4}
                  required
                  value={newChal.description}
                  onChange={(e) => setNewChal({ ...newChal, description: e.target.value })}
                  placeholder="Challenge brief, target IP/port, objective..."
                  className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                />
              </div>

              {/* Hint */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-neutral-400 block mb-1">OPTIONAL HINT</label>
                  <input
                    type="text"
                    value={newChal.hintContent}
                    onChange={(e) => setNewChal({ ...newChal, hintContent: e.target.value })}
                    placeholder="Clue for struggling competitors..."
                    className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">HINT COST (PENALTY)</label>
                  <input
                    type="number"
                    value={newChal.hintCost}
                    onChange={(e) => setNewChal({ ...newChal, hintCost: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddChalModal(false)}
                  className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="cyber-btn-yellow px-5 py-2"
                >
                  SAVE & DEPLOY CHALLENGE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
