'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types';
import { 
  ShieldCheck, 
  Send, 
  Lock, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  Trash2, 
  CornerDownRight, 
  RefreshCw,
  Search,
  Users,
  ChevronRight,
  Mail,
  User,
  Info
} from 'lucide-react';

const CATEGORIES = ['All', 'Events', 'Recruitment', 'Workshops', 'Consulting', 'General'];

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'public' | 'admin'>('public');

  // Question form state (Non-anonymous, requires email)
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // Admin answer draft state
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [responderName, setResponderName] = useState('JECC Member');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Filter state
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQuestions();
    checkAuthStatus();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await fetch('/api/questions');
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
      }
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  }

  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/auth/check');
      const json = await res.json();
      if (json.authenticated) {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Auth check error', err);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setAdminPassword('');
      } else {
        setAuthError(data.error || 'Invalid admin password');
      }
    } catch {
      setAuthError('Error communicating with authentication service');
    } finally {
      setAuthenticating(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setIsAdmin(false);
      setActiveTab('public');
    } catch (err) {
      console.error('Logout error', err);
    }
  }

  async function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || !authorEmail.trim()) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          category,
          author_name: authorName,
          author_email: authorEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setNewQuestion('');
        setAuthorName('');
        setAuthorEmail('');
        fetchQuestions();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(data.error || 'Failed to submit question');
      }
    } catch {
      setSubmitError('Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAnswerSubmit(id: string) {
    if (!answerDraft.trim()) return;
    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: answerDraft,
          answered_by: responderName || 'JECC Member',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnsweringId(null);
        setAnswerDraft('');
        fetchQuestions();
      } else {
        alert(data.error || 'Failed to submit answer');
      }
    } catch {
      alert('Error updating answer');
    } finally {
      setSubmittingAnswer(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Failed to delete question');
    }
  }

  const filteredQuestions = questions.filter((q) => {
    const matchesCategory = filterCategory === 'All' || q.category === filterCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.author_name && q.author_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.answer && q.answer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const pendingQuestions = filteredQuestions.filter((q) => q.status === 'pending');
  const answeredQuestions = filteredQuestions.filter((q) => q.status === 'answered');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20 text-white">
              J
            </div>
            <div>
              <div className="font-bold tracking-tight text-white flex items-center gap-2">
                <span>JECC Student Q&A</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">Junior Entreprise Centrale Casablanca</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'public'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Questions & Answers
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Club Admin</span>
              {isAdmin && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'public' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Ask Question Box */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                {/* Clear Notice: Not Anonymous - Email Notification */}
                <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">Notice: Verified Submissions</span>
                    <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                      Questions are <strong className="text-white">not anonymous</strong>. We require your email address so our system can automatically send you the official response as soon as a JECC member answers!
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-1">Submit Your Question</h2>
                <p className="text-sm text-slate-400 mb-5">
                  Ask our executive board anything about our club, events, recruitment, or consulting missions.
                </p>

                {submitSuccess && (
                  <div className="mb-5 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-start gap-3 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Question submitted!</p>
                      <p className="text-xs text-emerald-400/80 mt-0.5">
                        We will notify you by email as soon as an executive member posts an answer.
                      </p>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Email (for response notification) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="e.g. yourname@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Karim Bennani"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Topic Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="General">General / Other</option>
                      <option value="Events">Events & Conferences</option>
                      <option value="Recruitment">Recruitment & Membership</option>
                      <option value="Workshops">Workshops & Training</option>
                      <option value="Consulting">Consulting Projects</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Question <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="e.g. When do candidate interviews for the commercial team take place?"
                      maxLength={500}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                      <span>An email notification will be dispatched when answered</span>
                      <span>{newQuestion.length}/500</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !newQuestion.trim() || !authorEmail.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting question...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Question</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Member Portal teaser */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    Are you a JECC club member?
                  </span>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Member Login</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Feed of Questions & Answers */}
            <div className="lg:col-span-7 space-y-5">
              {/* Search & Filter Bar */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions or keywords..."
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                        filterCategory === cat
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Showing {answeredQuestions.length} answered & {pendingQuestions.length} awaiting response
                </span>
                <button
                  onClick={fetchQuestions}
                  className="hover:text-slate-200 flex items-center gap-1 transition"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Questions List */}
              {loading && questions.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Loading community questions...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8">
                  <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-300">No questions found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No questions match your search filter. Try clearing your search.'
                      : 'Be the first to submit a question using the form on the left!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* First display answered questions */}
                  {answeredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-md group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700/60">
                            {q.category || 'General'}
                          </span>
                          {q.author_name && (
                            <span className="text-xs text-slate-400 font-medium">
                              Asked by {q.author_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(q.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <h3 className="text-base font-medium text-slate-100 mb-3 leading-snug">
                        {q.question}
                      </h3>

                      {/* Official Club Answer */}
                      <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-4 mt-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="text-xs font-semibold text-indigo-300">
                            {q.answered_by || 'JECC Response'}
                          </span>
                          {q.answered_at && (
                            <span className="text-[10px] text-indigo-400/60">
                              • {new Date(q.answered_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed pl-5">
                          {q.answer}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Display pending questions */}
                  {pendingQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 opacity-80"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800/80 text-amber-300/80 border border-amber-500/20">
                            {q.category || 'General'}
                          </span>
                          {q.author_name && (
                            <span className="text-xs text-slate-400">
                              Asked by {q.author_name}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400/80 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Awaiting Answer
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{q.question}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Admin / Club Member Panel Section */
          <div className="max-w-4xl mx-auto space-y-6">
            {!isAdmin ? (
              /* Password Gate */
              <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-center text-white mb-2">
                  Club Member Access
                </h2>
                <p className="text-xs text-slate-400 text-center mb-6">
                  Enter the club administrative password to reply to submitted questions. Replies will automatically trigger email notifications to the student.
                </p>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter access code..."
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authenticating || !adminPassword}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authenticating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Access Admin Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Admin Dashboard */
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <h2 className="text-lg font-bold text-white">Club Moderation Panel</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage incoming inquiries. Answering any question will automatically email the response directly to the student via Gmail SMTP.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchQuestions}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Sync</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/50 text-xs font-medium text-rose-300 flex items-center gap-1.5 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Lock Admin</span>
                    </button>
                  </div>
                </div>

                {/* Unanswered / Pending Questions (Priority) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <span>Pending Questions</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {questions.filter((q) => q.status === 'pending').length}
                      </span>
                    </h3>
                  </div>

                  {questions.filter((q) => q.status === 'pending').length === 0 ? (
                    <div className="text-center py-8 bg-slate-900/40 border border-slate-800/60 rounded-xl text-slate-500 text-xs">
                      All caught up! No pending questions at this time.
                    </div>
                  ) : (
                    questions
                      .filter((q) => q.status === 'pending')
                      .map((q) => (
                        <div
                          key={q.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700/60">
                                  {q.category || 'General'}
                                </span>
                                <span className="text-xs text-slate-300 font-medium">
                                  {q.author_name ? `${q.author_name} (${q.author_email})` : q.author_email}
                                </span>
                                <span className="text-xs text-slate-500">
                                  • {new Date(q.created_at).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="text-base font-medium text-white">{q.question}</h4>
                            </div>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {answeringId === q.id ? (
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  value={responderName}
                                  onChange={(e) => setResponderName(e.target.value)}
                                  placeholder="Your Name or Role (e.g. JECC Core Team)"
                                  className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                              <textarea
                                rows={3}
                                value={answerDraft}
                                onChange={(e) => setAnswerDraft(e.target.value)}
                                placeholder={`Type official response here (an automated email will be sent to ${q.author_email})...`}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAnsweringId(null);
                                    setAnswerDraft('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={submittingAnswer || !answerDraft.trim()}
                                  onClick={() => handleAnswerSubmit(q.id)}
                                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {submittingAnswer ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Publishing & Sending Email...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="w-3.5 h-3.5" />
                                      <span>Publish Answer & Send Email</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAnsweringId(q.id);
                                setAnswerDraft('');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Answer & Email Response</span>
                            </button>
                          )}
                        </div>
                      ))
                  )}
                </div>

                {/* Answered Questions (with Edit / Delete capability) */}
                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <span>Already Answered Questions</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">
                      {questions.filter((q) => q.status === 'answered').length}
                    </span>
                  </h3>

                  {questions
                    .filter((q) => q.status === 'answered')
                    .map((q) => (
                      <div
                        key={q.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                                {q.category || 'General'}
                              </span>
                              <span className="text-xs text-slate-300 font-medium">
                                {q.author_name ? `${q.author_name} (${q.author_email})` : q.author_email}
                              </span>
                              <span className="text-xs text-slate-500">
                                • Asked {new Date(q.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-white">{q.question}</h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setAnsweringId(q.id);
                                setAnswerDraft(q.answer || '');
                                setResponderName(q.answered_by || 'JECC Team');
                              }}
                              className="text-slate-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-slate-800 transition text-xs flex items-center gap-1"
                              title="Edit Answer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {answeringId === q.id ? (
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 mt-2">
                            <input
                              type="text"
                              value={responderName}
                              onChange={(e) => setResponderName(e.target.value)}
                              placeholder="Responder label"
                              className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <textarea
                              rows={3}
                              value={answerDraft}
                              onChange={(e) => setAnswerDraft(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAnsweringId(null);
                                  setAnswerDraft('');
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={submittingAnswer || !answerDraft.trim()}
                                onClick={() => handleAnswerSubmit(q.id)}
                                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-50"
                              >
                                Update & Resend Email
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300">
                            <span className="font-semibold text-indigo-300 block mb-1">
                              {q.answered_by || 'JECC Response'}:
                            </span>
                            <p className="whitespace-pre-line">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Junior Entreprise Centrale Casablanca. Official Student Q&A & Inquiries.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Next.js & Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
