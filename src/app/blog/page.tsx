'use client';

import React, { useState, useEffect } from 'react';
import { useCTF } from '@/lib/store';
import { BlogPost } from '@/lib/types';
import { 
  BookOpen, 
  Terminal, 
  Plus, 
  X, 
  Clock, 
  User, 
  ArrowRight, 
  Search, 
  Tag, 
  Share2, 
  Eye, 
  FileCode 
} from 'lucide-react';

export default function BlogPage() {
  const { blogs, addBlogPost, currentUser } = useCTF();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  // Auto-open article if URL has matching hash (e.g., from Home page clicks)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const slug = window.location.hash.replace('#', '');
      const target = blogs.find(b => b.slug === slug);
      if (target) {
        setActiveArticle(target);
      }
    }
  }, [blogs]);

  // Admin upload state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'Vulnerability Research',
    authorName: currentUser?.username || 'Command Staff',
    authorRole: 'Research Analyst',
    readTime: '5 min read'
  });

  const categories = ['ALL', 'Vulnerability Research', 'Cryptography', 'Club Writeups', 'Defensive Tactics'];

  const filteredBlogs = blogs.filter(b => {
    const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    addBlogPost({
      ...newPost,
      slug: newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });

    setShowCreateModal(false);
    setNewPost({
      title: '',
      slug: '',
      summary: '',
      content: '',
      category: 'Vulnerability Research',
      authorName: currentUser?.username || 'Command Staff',
      authorRole: 'Research Analyst',
      readTime: '5 min read'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner */}
      <div className="border border-[#FCEE09]/30 bg-neutral-950 p-6 sm:p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FCEE09] uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#FCEE09] animate-pulse"></span>
              THREAT INTELLIGENCE & RESEARCH
            </div>
            <h1 className="text-3xl sm:text-4xl font-mono font-black text-white uppercase tracking-tight">
              CYBER DISPATCHES
            </h1>
            <p className="text-xs font-mono text-neutral-400 max-w-2xl leading-relaxed">
              Technical post-mortems, vulnerability research, zero-day breakdowns, and competition writeups published by the ciberNUtica intelligence division.
            </p>
          </div>

          {/* Admin Publish Button */}
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="cyber-btn-yellow px-5 py-3 text-xs flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>PUBLISH DISPATCH</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#FCEE09]/20 pb-4">
        
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition ${
                selectedCategory === cat
                  ? 'border border-[#FCEE09] bg-[#FCEE09]/15 text-[#FCEE09]'
                  : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CVE, research..."
            className="w-full bg-black border border-neutral-800 pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FCEE09]"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBlogs.map((article) => (
          <div
            key={article.id}
            onClick={() => setActiveArticle(article)}
            className="cyber-card p-6 border border-[#FCEE09]/20 hover:border-[#FCEE09] transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#FCEE09] px-2 py-0.5 bg-[#FCEE09]/10 border border-[#FCEE09]/30">
                  {article.category}
                </span>
                <span className="text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>

              <h2 className="font-mono text-base font-bold text-white group-hover:text-[#FCEE09] transition leading-snug">
                {article.title}
              </h2>

              <p className="font-mono text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-850 mt-6 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#FCEE09]" />
                <span className="text-neutral-300">{article.authorName}</span>
              </div>
              <span className="text-[#FCEE09] uppercase font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                READ INTEL →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          MODAL: ARTICLE FULL READER VIEW
          ========================================================================= */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-neutral-950 border border-[#FCEE09] p-6 sm:p-10 font-mono text-white shadow-[0_0_50px_rgba(252,238,9,0.25)] max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#FCEE09]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="space-y-3 mb-8 border-b border-neutral-800 pb-6">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#FCEE09] px-2 py-0.5 bg-[#FCEE09]/10 border border-[#FCEE09]/30">
                  {activeArticle.category}
                </span>
                <span className="text-neutral-500">{activeArticle.publishedAt}</span>
                <span className="text-neutral-500">• {activeArticle.readTime}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold uppercase leading-tight">
                {activeArticle.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
                <span className="text-[#FCEE09]">DISPATCH OFFICER:</span>
                <span className="text-white font-bold">{activeArticle.authorName}</span>
                <span className="text-neutral-600">({activeArticle.authorRole})</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line bg-black/40 p-6 border border-neutral-900">
              {activeArticle.content}
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <div>AUTHENTICATED VIA ciberNUtica DISPATCH PROTOCOL</div>
              <button
                onClick={() => setActiveArticle(null)}
                className="cyber-btn-outline px-4 py-2 text-xs"
              >
                CLOSE DISPATCH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN MODAL: PUBLISH NEW BLOG
          ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-[#FCEE09] p-6 sm:p-8 font-mono text-white shadow-[0_0_40px_rgba(252,238,9,0.2)] max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#FCEE09]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#FCEE09] mb-6 uppercase flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>DISPATCH INTELLIGENCE / UPLOAD BLOG</span>
            </h3>

            <form onSubmit={handleCreateBlog} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">DISPATCH HEADLINE</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. Exploiting CVE-2026-9912: Buffer Overflow in SSH Daemon"
                  className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">CATEGORY</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  >
                    <option value="Vulnerability Research">Vulnerability Research</option>
                    <option value="Cryptography">Cryptography</option>
                    <option value="Club Writeups">Club Writeups</option>
                    <option value="Defensive Tactics">Defensive Tactics</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">ESTIMATED READ TIME</label>
                  <input
                    type="text"
                    required
                    value={newPost.readTime}
                    onChange={(e) => setNewPost({ ...newPost, readTime: e.target.value })}
                    placeholder="e.g. 6 min read"
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">AUTHOR NAME</label>
                  <input
                    type="text"
                    required
                    value={newPost.authorName}
                    onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                    placeholder="e.g. Rishi Bhargava or Arjun R Kamath"
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">AUTHOR ROLE</label>
                  <input
                    type="text"
                    required
                    value={newPost.authorRole}
                    onChange={(e) => setNewPost({ ...newPost, authorRole: e.target.value })}
                    placeholder="e.g. Threat Operations Lead"
                    className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">EXECUTIVE SUMMARY</label>
                <textarea
                  rows={2}
                  required
                  value={newPost.summary}
                  onChange={(e) => setNewPost({ ...newPost, summary: e.target.value })}
                  placeholder="Brief 1-2 sentence overview for the briefing cards..."
                  className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">ARTICLE CONTENT (MARKDOWN)</label>
                <textarea
                  rows={8}
                  required
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="## Technical Breakdown..."
                  className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:border-[#FCEE09] outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="cyber-btn-yellow w-full py-3 text-xs font-bold uppercase mt-4"
              >
                PUBLISH INTEL DISPATCH
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
