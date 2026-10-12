'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LaundryIssue,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  PlatformDevice,
  PlatformBrowser,
} from '@/types';
import {
  ShieldCheck,
  Send,
  Lock,
  MessageSquare,
  CheckCircle2,
  Clock,
  LogOut,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  Mail,
  User,
  Info,
  AlertTriangle,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Globe,
  Camera,
  Video,
  ExternalLink,
  Upload,
  X,
  Sparkles,
  Check,
  Filter,
  Eye,
  SlidersHorizontal,
  FileQuestion,
  HelpCircle,
  Activity,
  Layers,
  MapPin,
  Flame,
} from 'lucide-react';

const CATEGORIES: IssueCategory[] = [
  'Machine Malfunction',
  'Booking & Reservation',
  'Payment & Tokens',
  'Web UI & Responsive',
  'Login & Session',
  'Notification Alert',
  'Facility & Cleanliness',
  'Other',
];

const CATEGORY_LABELS: Record<IssueCategory, { fr: string; icon: string }> = {
  'Machine Malfunction': { fr: 'Panne Machine / Lavage Interrompu', icon: '⚙️' },
  'Booking & Reservation': { fr: 'Réservation & Créneau Bloqué', icon: '📅' },
  'Payment & Tokens': { fr: 'Jetons & Paiement / Solde Déduit', icon: '🪙' },
  'Web UI & Responsive': { fr: 'Interface Web & Affichage Mobile', icon: '📱' },
  'Login & Session': { fr: 'Connexion CAS & Session Expirée', icon: '🔑' },
  'Notification Alert': { fr: 'Alerte Fin de Cycle / SMS Manquant', icon: '🔔' },
  'Facility & Cleanliness': { fr: 'Propreté / Infrastructure du Lavoir', icon: '🏢' },
  Other: { fr: 'Autre Concern / Suggestion', icon: '💬' },
};

const DEVICES: { id: PlatformDevice; label: string; icon: any }[] = [
  { id: 'Android', label: 'Android', icon: Smartphone },
  { id: 'iPhone', label: 'iPhone (iOS)', icon: Smartphone },
  { id: 'iPad', label: 'iPad (iPadOS)', icon: Tablet },
  { id: 'Mac', label: 'Mac (macOS)', icon: Laptop },
  { id: 'Windows', label: 'Windows', icon: Monitor },
  { id: 'Linux', label: 'Linux', icon: Monitor },
  { id: 'Other', label: 'Autre Système', icon: Globe },
];

const BROWSERS: { id: PlatformBrowser; label: string }[] = [
  { id: 'Safari', label: 'Safari' },
  { id: 'Chrome', label: 'Google Chrome' },
  { id: 'Firefox', label: 'Firefox' },
  { id: 'Edge', label: 'Microsoft Edge' },
  { id: 'Samsung Internet', label: 'Samsung Internet' },
  { id: 'In-App Webview', label: 'In-App (WhatsApp / IG)' },
  { id: 'PWA', label: 'PWA / App Installée' },
  { id: 'Other', label: 'Autre' },
];

const SEVERITIES: { id: IssueSeverity; label: string; color: string; desc: string }[] = [
  { id: 'low', label: 'Faible', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', desc: 'Gêne mineure ou affichage' },
  { id: 'medium', label: 'Moyenne', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', desc: 'Fonctionnalité ralentie mais contournable' },
  { id: 'high', label: 'Élevée', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', desc: 'Créneau perdu ou jeton déduit' },
  { id: 'critical', label: 'Critique', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', desc: 'Linge enfermé / Machine en danger' },
];

export default function Home() {
  const [issues, setIssues] = useState<LaundryIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'report' | 'feed' | 'admin'>('report');

  // Issue Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Machine Malfunction');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [device, setDevice] = useState<PlatformDevice>('Android');
  const [browser, setBrowser] = useState<PlatformBrowser>('Chrome');
  const [customPlatformDetails, setCustomPlatformDetails] = useState('');
  const [room, setRoom] = useState('Lavoir Bâtiment A');
  const [machineNumber, setMachineNumber] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorRoom, setAuthorRoom] = useState('');

  // Media attachments
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [customScreenshotUrl, setCustomScreenshotUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Form feedback
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // Admin management state
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [adminStatusDraft, setAdminStatusDraft] = useState<IssueStatus>('investigating');
  const [responderName, setResponderName] = useState('Pôle Technique Centrale Tech');
  const [savingAdminChange, setSavingAdminChange] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPlatform, setFilterPlatform] = useState<string>('All');

  // Lightbox Modal for Screenshots
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchIssues();
    checkAuthStatus();
    detectDevice();
  }, []);

  function detectDevice() {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent;

    // Detect Device
    if (/android/i.test(ua)) setDevice('Android');
    else if (/iphone/i.test(ua)) setDevice('iPhone');
    else if (/ipad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) setDevice('iPad');
    else if (/macintosh|mac os x/i.test(ua)) setDevice('Mac');
    else if (/windows/i.test(ua)) setDevice('Windows');
    else if (/linux/i.test(ua)) setDevice('Linux');

    // Detect Browser
    if (/samsungbrowser/i.test(ua)) setBrowser('Samsung Internet');
    else if (/edg/i.test(ua)) setBrowser('Edge');
    else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) setBrowser('Chrome');
    else if (/firefox|fxios/i.test(ua)) setBrowser('Firefox');
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) setBrowser('Safari');

    // Set resolution info
    const res = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
    setCustomPlatformDetails(`Détection auto : résolution ${res}`);
  }

  async function fetchIssues() {
    setLoading(true);
    try {
      const res = await fetch('/api/issues');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setIssues(json.data);
      }
    } catch (err) {
      console.error('Failed to load issues', err);
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
        setAuthError(data.error || 'Code d\'accès administrateur incorrect');
      }
    } catch {
      setAuthError('Erreur de communication avec le serveur d\'authentification');
    } finally {
      setAuthenticating(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setIsAdmin(false);
      setActiveTab('feed');
    } catch (err) {
      console.error('Logout error', err);
    }
  }

  async function handleFileUpload(file: File, type: 'screenshot' | 'video') {
    if (type === 'screenshot') setIsUploadingImage(true);
    if (type === 'video') setIsUploadingVideo(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (type === 'screenshot') {
          setScreenshots((prev) => [...prev, data.url]);
        } else {
          setVideoUrl(data.url);
        }
      } else {
        alert(data.error || `Échec de l'upload du fichier (${type})`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Erreur lors du téléversement du média.');
    } finally {
      if (type === 'screenshot') setIsUploadingImage(false);
      if (type === 'video') setIsUploadingVideo(false);
    }
  }

  function handleAddExternalScreenshot() {
    if (!customScreenshotUrl.trim()) return;
    setScreenshots((prev) => [...prev, customScreenshotUrl.trim()]);
    setCustomScreenshotUrl('');
    setShowUrlInput(false);
  }

  function handleRemoveScreenshot(index: number) {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmitIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !authorEmail.trim()) {
      setSubmitError('Veuillez remplir le titre, la description et votre adresse email.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        platform: {
          device,
          browser,
          customDetails: customPlatformDetails.trim(),
        },
        machine_info: {
          room,
          machineNumber: machineNumber.trim(),
        },
        author_name: authorName.trim(),
        author_email: authorEmail.trim(),
        author_room: authorRoom.trim(),
        screenshots,
        video_url: videoUrl.trim() || null,
      };

      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setTitle('');
        setDescription('');
        setMachineNumber('');
        setScreenshots([]);
        setVideoUrl('');
        fetchIssues();
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab('feed');
        }, 3500);
      } else {
        setSubmitError(data.error || 'Erreur lors de l\'enregistrement du signalement.');
      }
    } catch {
      setSubmitError('Impossible d\'envoyer le signalement. Vérifiez votre connexion.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdminUpdate(id: string) {
    setSavingAdminChange(true);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: adminStatusDraft,
          admin_notes: adminNotesDraft,
          resolved_by: responderName || 'Pôle Technique Centrale Tech',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingIssueId(null);
        fetchIssues();
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      alert('Erreur lors de la mise à jour du signalement');
    } finally {
      setSavingAdminChange(false);
    }
  }

  async function handleDeleteIssue(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce ticket ?')) return;
    try {
      const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setIssues((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      alert('Erreur réseau lors de la suppression');
    }
  }

  const filteredIssues = issues.filter((iss) => {
    const matchesCat = filterCategory === 'All' || iss.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || iss.status === filterStatus;
    const matchesPlat =
      filterPlatform === 'All' ||
      iss.platform?.device?.toLowerCase() === filterPlatform.toLowerCase();

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      iss.title.toLowerCase().includes(q) ||
      iss.description.toLowerCase().includes(q) ||
      (iss.machine_info?.machineNumber && iss.machine_info.machineNumber.toLowerCase().includes(q)) ||
      (iss.author_name && iss.author_name.toLowerCase().includes(q));

    return matchesCat && matchesStatus && matchesPlat && matchesSearch;
  });

  const totalCount = issues.length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;
  const investigatingCount = issues.filter((i) => i.status === 'investigating').length;
  const criticalCount = issues.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-[#07181c] text-slate-100 flex flex-col font-body selection:bg-[#009881] selection:text-white">
      {/* ============================================================== */}
      {/* 1. SIGNATURE CENTRALE TECH RUNNING HEADER                      */}
      {/* ============================================================== */}
      <div className="border-b border-[#0f3037] bg-[#051316]/90 backdrop-blur-md pt-3 pb-2.5 px-4 hidden md:block">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-[11px] uppercase tracking-widest text-[#63a09e] font-label">
          <div className="flex-1 h-[1px] bg-[#435966]/50" />
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#009881] inline-block animate-pulse" />
            <span>CENTRALE TECH • HUB OFFICIEL DES ANOMALIES & PANNES LAUNDRY.FECC.MA</span>
          </div>
          <div className="flex-1 h-[1px] bg-[#435966]/50" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN NAVIGATION HEADER                                      */}
      {/* ============================================================== */}
      <header className="border-b border-[#0f343c] bg-[#082025]/85 backdrop-blur-lg sticky top-0 z-40 shadow-xl shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo & School Seal */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#009881] to-[#048471] flex items-center justify-center font-bold text-white shadow-lg shadow-[#009881]/25 border border-[#009881]/40">
                <span className="font-display text-2xl tracking-wider">CT</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#126a38] border-2 border-[#07181c] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-cover font-extrabold text-base tracking-tight text-white uppercase">
                  CENTRALE TECH
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#009881]/20 text-[#009881] border border-[#009881]/30 uppercase tracking-wider">
                  laundry.fecc.ma
                </span>
              </div>
              <p className="text-[11px] text-[#63a09e] tracking-tight">
                École Centrale Casablanca • Pôle Support & Résolution
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <a
              href="https://laundry.fecc.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#abd1f9] hover:text-white bg-[#004f80]/30 hover:bg-[#004f80]/50 border border-[#004f80]/40 transition"
              title="Ouvrir le portail laundry.fecc.ma"
            >
              <span>laundry.fecc.ma</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center bg-[#051316] p-1 rounded-xl border border-[#0f343c]">
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'report'
                    ? 'bg-[#009881] text-white shadow-md shadow-[#009881]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Signaler une panne</span>
              </button>

              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'feed'
                    ? 'bg-[#009881] text-white shadow-md shadow-[#009881]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Signalements ({issues.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#126a38] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
                {isAdmin && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 3. HERO OVERVIEW METRICS STRIP                                */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-b from-[#082025] to-[#07181c] border-b border-[#0f343c]/70 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#0b272d]/80 border border-[#133d45] rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#009881]/20 border border-[#009881]/30 text-[#009881] flex items-center justify-center font-display text-xl">
                {totalCount}
              </div>
              <div>
                <p className="text-[11px] text-[#63a09e] uppercase font-bold tracking-wider">Total Signalements</p>
                <p className="text-sm font-semibold text-white">Reçus par le club</p>
              </div>
            </div>

            <div className="bg-[#0b272d]/80 border border-[#133d45] rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#c28b49]/20 border border-[#c28b49]/30 text-[#c28b49] flex items-center justify-center font-display text-xl">
                {investigatingCount}
              </div>
              <div>
                <p className="text-[11px] text-[#c28b49] uppercase font-bold tracking-wider">En Investigation</p>
                <p className="text-sm font-semibold text-white">Diagnostic actif</p>
              </div>
            </div>

            <div className="bg-[#0b272d]/80 border border-[#133d45] rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#126a38]/20 border border-[#126a38]/40 text-emerald-400 flex items-center justify-center font-display text-xl">
                {resolvedCount}
              </div>
              <div>
                <p className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">Pannes Résolues</p>
                <p className="text-sm font-semibold text-white">Interventions closes</p>
              </div>
            </div>

            <div className="bg-[#0b272d]/80 border border-[#133d45] rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-display text-xl">
                {criticalCount}
              </div>
              <div>
                <p className="text-[11px] text-rose-400 uppercase font-bold tracking-wider">Pannes Urgentes</p>
                <p className="text-sm font-semibold text-white">Priorité absolue</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. MAIN CONTENT CONTAINER                                      */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* ============================================================ */}
        {/* TAB 1: REPORT AN ISSUE                                       */}
        {/* ============================================================ */}
        {activeTab === 'report' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Centrale Tech Decorative Banner */}
            <div className="bg-gradient-to-r from-[#0c3d40] to-[#073f49] border border-[#009881]/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              {/* Corner Accent Square motif */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#009881]/25 -mr-4 -mt-4 rotate-12 blur-lg pointer-events-none" />
              <div className="absolute top-3 right-3 w-3 h-3 bg-[#009881] rounded-sm" />

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#009881] font-label">
                  Formulaire Officiel Centrale Tech
                </span>
                <span className="h-1 w-8 bg-[#009881]/60 rounded-full" />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
                SIGNALER UN PROBLÈME SUR LAUNDRY.FECC.MA
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Une machine bloquée ? Un jeton non comptabilisé ? Un bug sur la plateforme de réservation ?
                Remplissez ce formulaire détaillé. L'équipe d'ingénieurs et techniciens du club Centrale Tech
                interviendra et vous tiendra informé(e) en temps réel par e-mail.
              </p>
            </div>

            {submitSuccess && (
              <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-sm flex items-start gap-3.5 shadow-xl animate-fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300 text-base">Signalement enregistré avec succès !</h4>
                  <p className="text-xs text-emerald-400/90 mt-1 leading-relaxed">
                    Votre ticket a été transmis au Pôle Technique Centrale Tech. Un diagnostic est en cours.
                    Vous recevrez un e-mail dès que la machine sera réarmée ou que le bug sera résolu.
                  </p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-sm flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Comprehensive Form */}
            <form onSubmit={handleSubmitIssue} className="space-y-6">
              {/* SECTION A: INCIDENT OVERVIEW */}
              <div className="bg-[#0b272d]/90 border border-[#133d45] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#133d45] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#009881]" />
                    <h3 className="font-label font-bold text-white text-base uppercase tracking-wider">
                      1. Nature de l'incident
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#63a09e]">Informations principales</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Titre résume de l'anomalie <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Machine #3 ne démarre pas malgré jeton débité"
                    className="w-full bg-[#051316] border border-[#133d45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Catégorie du problème <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IssueCategory)}
                      className="w-full bg-[#051316] border border-[#133d45] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].fr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Niveau d'Urgence / Sévérité <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SEVERITIES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSeverity(s.id)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition text-center flex flex-col items-center justify-center ${
                            severity === s.id
                              ? `${s.color} ring-1 ring-white/20`
                              : 'bg-[#051316] border-[#133d45] text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{s.label}</span>
                          <span className="text-[10px] font-normal opacity-75">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Localisation du Lavoir
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="w-full bg-[#051316] border border-[#133d45] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                      >
                        <option value="Lavoir Bâtiment A">Lavoir Résidence A</option>
                        <option value="Lavoir Bâtiment B">Lavoir Résidence B</option>
                        <option value="Autre Lavoir Campus">Autre Lavoir du Campus</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Numéro de la machine (si applicable)
                    </label>
                    <input
                      type="text"
                      value={machineNumber}
                      onChange={(e) => setMachineNumber(e.target.value)}
                      placeholder="Ex: Lave-linge #4 ou Sèche-linge #2"
                      className="w-full bg-[#051316] border border-[#133d45] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: PLATFORM & ENVIRONMENT (CRUCIAL USER REQUIREMENT) */}
              <div className="bg-[#0b272d]/90 border border-[#133d45] rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#133d45] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#abd1f9]" />
                    <h3 className="font-label font-bold text-white text-base uppercase tracking-wider">
                      2. Environnement & Plateforme Utilisée
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={detectDevice}
                    className="text-[11px] text-[#009881] hover:text-[#048471] bg-[#009881]/15 px-2.5 py-1 rounded-md border border-[#009881]/30 flex items-center gap-1 font-semibold transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>⚡ Détecter mon appareil</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Certains bugs sur <strong className="text-white">laundry.fecc.ma</strong> ne se produisent que sur
                  certains systèmes (ex: iPhone Safari, tablettes iPad, Android Chrome, etc.). Précisez votre appareil :
                </p>

                {/* Device Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Système d'exploitation / Appareil
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEVICES.map((d) => {
                      const Icon = d.icon;
                      const selected = device === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDevice(d.id)}
                          className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition cursor-pointer ${
                            selected
                              ? 'bg-[#009881]/20 border-[#009881] text-white shadow-sm'
                              : 'bg-[#051316] border-[#133d45] text-slate-400 hover:text-white hover:border-slate-600'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${selected ? 'text-[#009881]' : 'text-slate-500'}`} />
                          <span>{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Browser Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Navigateur Web / Client
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BROWSERS.map((b) => {
                      const selected = browser === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBrowser(b.id)}
                          className={`p-2 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                            selected
                              ? 'bg-[#004f80]/30 border-[#004f80] text-white'
                              : 'bg-[#051316] border-[#133d45] text-slate-400 hover:text-white'
                          }`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom specifics note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Détails supplémentaires sur votre environnement (optionnel)
                  </label>
                  <input
                    type="text"
                    value={customPlatformDetails}
                    onChange={(e) => setCustomPlatformDetails(e.target.value)}
                    placeholder="Ex: iOS 17.5, écran en mode sombre, ouvert depuis WhatsApp..."
                    className="w-full bg-[#051316] border border-[#133d45] rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                  />
                </div>
              </div>

              {/* SECTION C: DESCRIPTION */}
              <div className="bg-[#0b272d]/90 border border-[#133d45] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#133d45] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#126a38]" />
                    <h3 className="font-label font-bold text-white text-base uppercase tracking-wider">
                      3. Description détaillée du dysfonctionnement
                    </h3>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Que s'est-il passé exactement ? <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez les étapes précises : ce que vous avez essayé de faire, ce qui est apparu à l'écran, et les éventuels messages d'erreur affichés sur laundry.fecc.ma..."
                    className="w-full bg-[#051316] border border-[#133d45] rounded-xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009881] transition resize-none"
                  />
                </div>
              </div>

              {/* SECTION D: MEDIA ATTACHMENTS (OPTIONAL: SCREENSHOTS & VIDEO REPLICATION) */}
              <div className="bg-[#0b272d]/90 border border-[#133d45] rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#133d45] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#c28b49]" />
                    <h3 className="font-label font-bold text-white text-base uppercase tracking-wider">
                      4. Captures d'écran & Réplication Vidéo
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#c28b49] font-semibold bg-[#c28b49]/15 px-2 py-0.5 rounded border border-[#c28b49]/30">
                    Facultatif / Optionnel
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  L'ajout d'une capture d'écran de l'erreur ou d'une courte vidéo montrant la panne aide grandement
                  l'équipe technique Centrale Tech à reproduire et corriger le problème plus vite.
                </p>

                {/* Screenshots Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#009881]" />
                      <span>Captures d'écran ({screenshots.length}/4)</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] text-[#63a09e] hover:text-white transition"
                    >
                      {showUrlInput ? 'Fermer lien URL' : '+ Ajouter via URL image'}
                    </button>
                  </div>

                  {showUrlInput && (
                    <div className="flex gap-2 p-2 rounded-xl bg-[#051316] border border-[#133d45]">
                      <input
                        type="url"
                        value={customScreenshotUrl}
                        onChange={(e) => setCustomScreenshotUrl(e.target.value)}
                        placeholder="https://example.com/screenshot.jpg"
                        className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddExternalScreenshot}
                        className="px-3 py-1.5 rounded-lg bg-[#009881] hover:bg-[#048471] text-xs font-semibold text-white"
                      >
                        Ajouter
                      </button>
                    </div>
                  )}

                  {/* Thumbnail Previews */}
                  {screenshots.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {screenshots.map((url, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#133d45] aspect-video bg-[#051316]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Capture ${idx + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                            onClick={() => setPreviewMediaUrl(url)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(idx)}
                            className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-600 text-white p-1 rounded-full shadow"
                            title="Supprimer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button for screenshots */}
                  {screenshots.length < 4 && (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'screenshot');
                        }}
                      />
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-[#133d45] hover:border-[#009881] rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-white transition bg-[#051316]/50 cursor-pointer"
                      >
                        {isUploadingImage ? (
                          <>
                            <RefreshCw className="w-5 h-5 text-[#009881] animate-spin" />
                            <span className="text-xs font-medium text-[#009881]">Téléversement de l'image en cours...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-[#009881]" />
                            <span className="text-xs font-semibold">Cliquer pour importer une capture d'écran</span>
                            <span className="text-[10px] text-slate-500">Formats PNG, JPG, WebP jusqu'à 10 Mo</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Video Replication */}
                <div className="space-y-3 pt-3 border-t border-[#133d45]">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[#c28b49]" />
                      <span>Réplication Vidéo du bug (Fichier MP4/WebM ou lien Loom / Drive)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Optionnel</span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Lien vidéo (ex: https://www.loom.com/share/... ou lien Drive)"
                      className="flex-1 bg-[#051316] border border-[#133d45] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009881]"
                    />

                    <input
                      type="file"
                      ref={videoInputRef}
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'video');
                      }}
                    />

                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => videoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-[#133d45] hover:bg-[#194c56] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      {isUploadingVideo ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Envoi vidéo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Importer vidéo (.mp4)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Video preview if available */}
                  {videoUrl && (
                    <div className="p-3 bg-[#051316] rounded-xl border border-[#133d45] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Video className="w-4 h-4 text-[#c28b49] shrink-0" />
                        <span className="truncate text-slate-300">{videoUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVideoUrl('')}
                        className="text-rose-400 hover:text-rose-300 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION E: REPORTER IDENTIFICATION */}
              <div className="bg-[#0b272d]/90 border border-[#133d45] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#133d45] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#009881]" />
                    <h3 className="font-label font-bold text-white text-base uppercase tracking-wider">
                      5. Coordonnées pour Notification
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#63a09e]">Suivi direct par e-mail</span>
                </div>

                <div className="p-3 rounded-xl bg-[#051316] border border-[#133d45] text-xs text-[#abd1f9] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#009881] shrink-0 mt-0.5" />
                  <p>
                    Votre e-mail est utilisé par le système pour vous envoyer automatiquement la notification officielle
                    dès que Centrale Tech investigue ou débloque la machine.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Adresse E-mail Centrale / Personnelle <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="prenom.nom@centrale-casablanca.ma"
                        className="w-full bg-[#051316] border border-[#133d45] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nom / Prénom
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ex: Yassine B."
                        className="w-full bg-[#051316] border border-[#133d45] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Numéro de chambre / Résidence (optionnel)
                  </label>
                  <input
                    type="text"
                    value={authorRoom}
                    onChange={(e) => setAuthorRoom(e.target.value)}
                    placeholder="Ex: Chambre A-102"
                    className="w-full bg-[#051316] border border-[#133d45] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim() || !authorEmail.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#009881] to-[#048471] hover:from-[#008772] hover:to-[#037261] disabled:opacity-50 text-white font-label font-bold text-sm uppercase tracking-wider transition shadow-xl shadow-[#009881]/25 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Enregistrement du signalement en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Transmettre le signalement à Centrale Tech</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PUBLIC ISSUES FEED & STATUS TRACKER                   */}
        {/* ============================================================ */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Search, Filter & Quick Toggles */}
            <div className="bg-[#0b272d]/90 border border-[#133d45] rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par machine, mot-clé, ou description..."
                    className="w-full bg-[#051316] border border-[#133d45] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#009881]"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-[#051316] p-1 rounded-xl border border-[#133d45]">
                  {[
                    { id: 'All', label: 'Tous' },
                    { id: 'open', label: 'Ouverts' },
                    { id: 'investigating', label: 'En cours' },
                    { id: 'resolved', label: 'Résolus' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setFilterStatus(st.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        filterStatus === st.id
                          ? 'bg-[#009881] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchIssues}
                  className="px-3 py-2 bg-[#051316] hover:bg-[#133d45] border border-[#133d45] rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
                  title="Rafraîchir"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>

              {/* Platform Selector Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-[#63a09e] uppercase tracking-wider shrink-0 mr-1">
                  Plateforme :
                </span>
                {['All', 'Android', 'iPhone', 'iPad', 'Mac', 'Windows', 'Linux'].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setFilterPlatform(plat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                      filterPlatform === plat
                        ? 'bg-[#004f80] text-white border border-[#abd1f9]/40'
                        : 'bg-[#051316] text-slate-400 border border-[#133d45] hover:text-white'
                    }`}
                  >
                    {plat === 'All' ? 'Toutes' : plat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of issues */}
            {loading && issues.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <RefreshCw className="w-8 h-8 text-[#009881] animate-spin mx-auto mb-3" />
                <p className="text-sm">Chargement des signalements en direct...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-16 bg-[#0b272d]/50 border border-[#133d45] rounded-2xl p-8">
                <FileQuestion className="w-12 h-12 text-[#63a09e]/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white uppercase font-label">
                  Aucun signalement trouvé
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {searchQuery || filterStatus !== 'All' || filterPlatform !== 'All'
                    ? 'Aucun ticket ne correspond à vos filtres actuels. Réinitialisez vos critères.'
                    : 'Aucun problème n\'est actuellement signalé sur laundry.fecc.ma. Bravo !'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredIssues.map((iss) => {
                  const catInfo = CATEGORY_LABELS[iss.category] || { fr: iss.category, icon: '⚙️' };
                  const sevInfo = SEVERITIES.find((s) => s.id === iss.severity) || SEVERITIES[1];

                  const statusConfig: Record<IssueStatus, { label: string; badge: string }> = {
                    open: { label: 'Reçu / Ouvert', badge: 'bg-[#009881]/20 text-[#009881] border-[#009881]/40' },
                    investigating: { label: 'En cours d\'investigation', badge: 'bg-[#c28b49]/20 text-[#c28b49] border-[#c28b49]/40' },
                    resolved: { label: 'Résolu & Traité', badge: 'bg-[#126a38]/20 text-emerald-300 border-[#126a38]/50' },
                    closed: { label: 'Clôturé', badge: 'bg-slate-700/20 text-slate-400 border-slate-700/40' },
                  };

                  const currentStatus = statusConfig[iss.status] || statusConfig.open;

                  return (
                    <div
                      key={iss.id}
                      className="bg-[#0b272d]/90 border border-[#133d45] hover:border-[#009881]/60 rounded-2xl p-5 sm:p-6 transition-all shadow-lg relative overflow-hidden group"
                    >
                      {/* Decorative left accent edge */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#009881] to-[#048471]" />

                      {/* Top Meta Line */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pl-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status */}
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentStatus.badge}`}>
                            {currentStatus.label}
                          </span>

                          {/* Severity */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevInfo.color}`}>
                            Urgence : {sevInfo.label}
                          </span>

                          {/* Category */}
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#051316] text-[#63a09e] border border-[#133d45]">
                            {catInfo.icon} {catInfo.fr}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(iss.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Main Title & Machine */}
                      <div className="pl-2 mb-2">
                        <h3 className="font-cover font-bold text-lg text-white leading-snug">
                          {iss.title}
                        </h3>

                        {/* Location / Machine info */}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#63a09e]">
                          {iss.machine_info?.machineNumber && (
                            <span className="flex items-center gap-1 font-semibold text-[#009881]">
                              <Activity className="w-3.5 h-3.5" />
                              {iss.machine_info.machineNumber}
                            </span>
                          )}
                          {iss.machine_info?.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {iss.machine_info.room}
                            </span>
                          )}
                          {iss.author_name && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <User className="w-3.5 h-3.5" />
                              Signalé par {iss.author_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="pl-2 text-sm text-slate-300 leading-relaxed my-3 whitespace-pre-line">
                        {iss.description}
                      </p>

                      {/* Platform & Environment Pill */}
                      <div className="pl-2 py-2 border-t border-[#133d45]/70 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[11px] font-bold text-[#4c5362] uppercase tracking-wider">
                          Plateforme :
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#051316] text-[#abd1f9] border border-[#133d45] font-semibold flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          {iss.platform?.device || 'Inconnu'} • {iss.platform?.browser || 'Navigateur'}
                        </span>
                        {iss.platform?.customDetails && (
                          <span className="text-[11px] text-slate-400 italic">
                            ({iss.platform.customDetails})
                          </span>
                        )}
                      </div>

                      {/* Media (Screenshots & Video Replication) */}
                      {((iss.screenshots && iss.screenshots.length > 0) || iss.video_url) && (
                        <div className="pl-2 mt-3 pt-3 border-t border-[#133d45]/70 space-y-2">
                          <span className="text-[11px] font-bold text-[#c28b49] uppercase tracking-wider block">
                            Preuves & Réplication :
                          </span>

                          <div className="flex flex-wrap gap-2.5 items-center">
                            {iss.screenshots?.map((shot, sidx) => (
                              <button
                                key={sidx}
                                type="button"
                                onClick={() => setPreviewMediaUrl(shot)}
                                className="relative rounded-lg overflow-hidden border border-[#133d45] hover:border-[#009881] w-20 h-14 bg-[#051316] group/thumb"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={shot}
                                  alt="Capture d'écran"
                                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition"
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-transparent transition flex items-center justify-center">
                                  <Eye className="w-4 h-4 text-white drop-shadow" />
                                </div>
                              </button>
                            ))}

                            {iss.video_url && (
                              <a
                                href={iss.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-lg bg-[#c28b49]/20 hover:bg-[#c28b49]/30 border border-[#c28b49]/40 text-[#c28b49] text-xs font-semibold flex items-center gap-1.5 transition"
                              >
                                <Video className="w-4 h-4" />
                                <span>Visionner réplication vidéo</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Official Centrale Tech Resolution Box */}
                      {iss.admin_notes && (
                        <div className="pl-2 mt-4">
                          <div className="bg-gradient-to-r from-[#0c3d40]/90 to-[#073f49]/80 border-l-4 border-[#009881] rounded-r-xl p-4 space-y-1.5 shadow-md">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] uppercase font-bold tracking-wider text-[#009881] font-label flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4" />
                                Réponse & Intervention Centrale Tech
                              </span>
                              {iss.resolved_at && (
                                <span className="text-[10px] text-slate-400">
                                  {new Date(iss.resolved_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                              {iss.admin_notes}
                            </p>
                            <p className="text-[11px] text-[#63a09e] font-semibold pt-1">
                              — {iss.resolved_by || 'Pôle Technique Centrale Tech'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ADMIN / CENTRALE TECH RESOLUTION PANEL                */}
        {/* ============================================================ */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!isAdmin ? (
              /* Password Gate */
              <div className="max-w-md mx-auto bg-[#0b272d]/95 border border-[#133d45] rounded-2xl p-8 shadow-2xl relative">
                <div className="w-12 h-12 rounded-xl bg-[#009881]/20 border border-[#009881]/40 text-[#009881] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="font-display text-2xl text-center text-white mb-1 uppercase tracking-wide">
                  Espace Pôle Technique Centrale Tech
                </h2>
                <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
                  Accès restreint aux membres du club pour diagnostiquer les pannes de la laverie,
                  mettre à jour les statuts et expédier les notifications automatiques aux étudiants.
                </p>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Code d'accès administrateur
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Entrez le mot de passe club..."
                      required
                      className="w-full bg-[#051316] border border-[#133d45] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#009881] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authenticating || !adminPassword}
                    className="w-full py-3 px-4 rounded-xl bg-[#009881] hover:bg-[#048471] disabled:opacity-50 text-white font-label font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#009881]/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authenticating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Vérification...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Déverrouiller le Tableau de Bord</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Dashboard */
              <div className="space-y-6">
                {/* Admin Header Bar */}
                <div className="bg-[#0b272d] border border-[#133d45] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <h2 className="font-cover font-bold text-lg text-white">
                        Tableau d'Intervention — laundry.fecc.ma
                      </h2>
                    </div>
                    <p className="text-xs text-[#63a09e] mt-1">
                      Enregistrer une note de résolution expédie automatiquement un e-mail officiel Centrale Tech à l'étudiant.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchIssues}
                      className="px-3 py-1.5 rounded-lg bg-[#051316] hover:bg-[#133d45] border border-[#133d45] text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Sync</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Verrouiller</span>
                    </button>
                  </div>
                </div>

                {/* Priority / Open Issues First */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-label font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Pannes Nécessitant une Intervention</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[#009881]/20 text-[#009881] border border-[#009881]/40">
                        {issues.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length}
                      </span>
                    </h3>
                  </div>

                  {issues.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length === 0 ? (
                    <div className="text-center py-10 bg-[#0b272d]/50 border border-[#133d45] rounded-xl text-slate-400 text-xs">
                      Aucune panne active en attente. Toutes les machines sont opérationnelles !
                    </div>
                  ) : (
                    issues
                      .filter((i) => i.status !== 'resolved' && i.status !== 'closed')
                      .map((iss) => (
                        <div
                          key={iss.id}
                          className="bg-[#0b272d] border border-[#133d45] rounded-2xl p-5 space-y-4 shadow-lg"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#009881]/20 text-[#009881]">
                                  {iss.category}
                                </span>
                                <span className="text-xs text-white font-semibold">
                                  {iss.author_name ? `${iss.author_name} (${iss.author_email})` : iss.author_email}
                                </span>
                                {iss.author_room && (
                                  <span className="text-xs text-[#63a09e]">
                                    • {iss.author_room}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-white">{iss.title}</h4>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{iss.description}</p>
                            </div>

                            <button
                              onClick={() => handleDeleteIssue(iss.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#051316] transition"
                              title="Supprimer le ticket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quick Admin Actions Box */}
                          {editingIssueId === iss.id ? (
                            <div className="bg-[#051316] p-4 rounded-xl border border-[#133d45] space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                    Nouveau Statut
                                  </label>
                                  <select
                                    value={adminStatusDraft}
                                    onChange={(e) => setAdminStatusDraft(e.target.value as IssueStatus)}
                                    className="w-full bg-[#0b272d] border border-[#133d45] rounded-lg px-3 py-1.5 text-xs text-white"
                                  >
                                    <option value="open">Ouvert</option>
                                    <option value="investigating">En cours d'investigation</option>
                                    <option value="resolved">Résolu</option>
                                    <option value="closed">Clôturé</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                    Intervenant / Rôle
                                  </label>
                                  <input
                                    type="text"
                                    value={responderName}
                                    onChange={(e) => setResponderName(e.target.value)}
                                    className="w-full bg-[#0b272d] border border-[#133d45] rounded-lg px-3 py-1.5 text-xs text-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                  Note d'Intervention & Message à l'étudiant
                                </label>
                                <textarea
                                  rows={3}
                                  value={adminNotesDraft}
                                  onChange={(e) => setAdminNotesDraft(e.target.value)}
                                  placeholder={`Expliquez la résolution (un e-mail sera immédiatement envoyé à ${iss.author_email})...`}
                                  className="w-full bg-[#0b272d] border border-[#133d45] rounded-lg p-2.5 text-xs text-white"
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingIssueId(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                                >
                                  Annuler
                                </button>
                                <button
                                  type="button"
                                  disabled={savingAdminChange}
                                  onClick={() => handleAdminUpdate(iss.id)}
                                  className="px-4 py-1.5 rounded-lg bg-[#009881] hover:bg-[#048471] text-white font-bold text-xs flex items-center gap-1.5"
                                >
                                  {savingAdminChange ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Enregistrement & Envoi E-mail...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="w-3.5 h-3.5" />
                                      <span>Valider & Envoyer Notification</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingIssueId(iss.id);
                                setAdminStatusDraft('investigating');
                                setAdminNotesDraft(iss.admin_notes || '');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#009881]/20 hover:bg-[#009881]/30 border border-[#009881]/40 text-[#009881] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Prendre en charge / Résoudre</span>
                            </button>
                          )}
                        </div>
                      ))
                  )}
                </div>

                {/* Resolved Issues History */}
                <div className="space-y-4 pt-6 border-t border-[#133d45]">
                  <h3 className="font-label font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Historique des Pannes Traitées & Clôturées</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#051316] text-slate-400 border border-[#133d45]">
                      {issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length}
                    </span>
                  </h3>

                  {issues
                    .filter((i) => i.status === 'resolved' || i.status === 'closed')
                    .map((iss) => (
                      <div
                        key={iss.id}
                        className="bg-[#0b272d]/70 border border-[#133d45]/70 rounded-2xl p-5 space-y-2.5 opacity-90"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                                Résolu
                              </span>
                              <span className="text-xs text-white font-medium">{iss.title}</span>
                              <span className="text-xs text-slate-500">• {iss.author_email}</span>
                            </div>
                            {iss.admin_notes && (
                              <p className="text-xs text-slate-300 bg-[#051316] p-2.5 rounded-lg border border-[#133d45] mt-2">
                                <strong className="text-[#009881]">{iss.resolved_by}:</strong> {iss.admin_notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingIssueId(iss.id);
                                setAdminStatusDraft(iss.status);
                                setAdminNotesDraft(iss.admin_notes || '');
                              }}
                              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-[#051316] rounded"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteIssue(iss.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 5. LIGHTBOX MODAL FOR SCREENSHOT PREVIEW                      */}
      {/* ============================================================== */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#07181c] border border-[#133d45] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 bg-[#0b272d] border-b border-[#133d45]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-label">
                Aperçu de la Capture d'Écran
              </span>
              <button
                type="button"
                onClick={() => setPreviewMediaUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewMediaUrl}
                alt="Capture d'écran agrandie"
                className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. INSTITUTIONAL CENTRALE TECH FOOTER                         */}
      {/* ============================================================== */}
      <footer className="border-t border-[#0f343c] bg-[#051316] py-8 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#009881] text-white flex items-center justify-center font-display text-sm">
              CT
            </div>
            <div>
              <p className="font-cover font-bold text-white text-xs">
                CENTRALE TECH — CLUB TECHNOLOGIQUE
              </p>
              <p className="text-[11px] text-[#63a09e]">
                École Centrale Casablanca • Bâtiment Administratif & Résidences Étudiantes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#4c5362]">
            <span>Support : <strong className="text-slate-300">laundry.fecc.ma</strong></span>
            <span>•</span>
            <a
              href="https://laundry.fecc.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#009881] hover:underline"
            >
              Accéder à la laverie
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
