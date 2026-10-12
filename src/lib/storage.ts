import { createClient } from '@supabase/supabase-js';
import { LaundryIssue, IssueCategory, IssueSeverity, IssueStatus } from '@/types';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Global memory cache for fallback or local mock testing
declare global {
  // eslint-disable-next-line no-var
  var __memoryIssues: LaundryIssue[] | undefined;
}

if (!global.__memoryIssues) {
  global.__memoryIssues = [
    {
      id: 'demo-issue-1',
      title: 'Machine #4 hublot bloqué après la fin du cycle 40°C',
      description:
        'Le cycle de lavage s\'est bien terminé mais le voyant de déverrouillage reste clignotant en rouge. Impossible d\'ouvrir la porte pour récupérer le linge. Aucune erreur explicite sur l\'écran.',
      category: 'Machine Malfunction',
      severity: 'critical',
      platform: {
        device: 'iPhone',
        browser: 'Safari',
        osVersion: 'iOS 18.0',
        screenResolution: '393x852',
        customDetails: 'Application ouverte via lien direct WhatsApp',
      },
      machine_info: {
        room: 'Lavoir Bâtiment A',
        machineNumber: 'Machine à laver #4',
      },
      author_name: 'Youssef El Amrani',
      author_email: 'youssef.elamrani@centrale-casablanca.ma',
      author_room: 'Chambre A-204',
      screenshots: [
        'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
      ],
      video_url: null,
      status: 'resolved',
      admin_notes:
        'Intervention effectuée par le Pôle Technique Centrale Tech : réinitialisation de la sécurité thermique du hublot. La porte a été déverrouillée et la machine a été testée avec succès.',
      resolved_by: 'Équipe Technique Centrale Tech',
      resolved_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'demo-issue-2',
      title: 'Bouton de confirmation de réservation inactif sur Android Chrome',
      description:
        'Sur laundry.fecc.ma, lorsqu\'on sélectionne le créneau de 18h30 pour le sèche-linge, le bouton "Confirmer la réservation" ne déclenche aucune action. La console indique une erreur de script JS.',
      category: 'Web UI & Responsive',
      severity: 'high',
      platform: {
        device: 'Android',
        browser: 'Chrome',
        osVersion: 'Android 14',
        browserVersion: 'Chrome 128.0',
        customDetails: 'Samsung Galaxy S23, mode sombre activé',
      },
      machine_info: {
        room: 'Lavoir Bâtiment B',
        machineNumber: 'Sèche-linge #2',
      },
      author_name: 'Salma Benjelloun',
      author_email: 'salma.benjelloun@centrale-casablanca.ma',
      author_room: 'Chambre B-112',
      screenshots: [],
      video_url: null,
      status: 'investigating',
      admin_notes:
        'Signalement pris en compte. L\'équipe Centrale Tech teste actuellement le correctif de l\'écouteur d\'événement tactile sur les navigateurs Chromium mobiles.',
      resolved_by: 'Centrale Tech Dev Team',
      resolved_at: null,
      created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
    {
      id: 'demo-issue-3',
      title: 'Jeton décompté sans démarrage du cycle sur le lave-linge #1',
      description:
        'Après scan du QR code et validation du jeton sur le site, le solde a diminué de 1 jeton mais la machine #1 est restée en veille sans démarrer.',
      category: 'Payment & Tokens',
      severity: 'high',
      platform: {
        device: 'Mac',
        browser: 'Safari',
        osVersion: 'macOS Sonoma',
        browserVersion: 'Safari 17.5',
      },
      machine_info: {
        room: 'Lavoir Bâtiment A',
        machineNumber: 'Machine à laver #1',
      },
      author_name: 'Hamza Tazi',
      author_email: 'hamza.tazi@centrale-casablanca.ma',
      author_room: 'Chambre A-305',
      screenshots: [],
      video_url: null,
      status: 'open',
      admin_notes: null,
      resolved_by: null,
      resolved_at: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
}

// Helper to convert questions-table representation to LaundryIssue
function parseQuestionRowToIssue(row: any): LaundryIssue {
  let details: any = {};
  try {
    if (row.question && (row.question.startsWith('{') || row.question.startsWith('['))) {
      details = JSON.parse(row.question);
    }
  } catch {
    details = {};
  }

  return {
    id: row.id,
    title: details.title || row.category || 'Signalement laundry.fecc.ma',
    description: details.description || row.question || '',
    category: (details.category || row.category || 'Other') as IssueCategory,
    severity: (details.severity || 'medium') as IssueSeverity,
    platform: details.platform || {
      device: 'Other',
      browser: 'Other',
    },
    machine_info: details.machine_info || undefined,
    author_name: row.author_name || details.author_name || '',
    author_email: row.author_email || details.author_email || '',
    author_room: details.author_room || undefined,
    screenshots: details.screenshots || [],
    video_url: details.video_url || null,
    status: (row.status || details.status || 'open') as IssueStatus,
    admin_notes: row.answer || details.admin_notes || null,
    resolved_by: row.answered_by || details.resolved_by || null,
    resolved_at: row.answered_at || details.resolved_at || null,
    created_at: row.created_at || new Date().toISOString(),
  };
}

// Helper to serialize LaundryIssue to questions-table row
function formatIssueToQuestionRow(issue: LaundryIssue) {
  const payload = {
    title: issue.title,
    description: issue.description,
    category: issue.category,
    severity: issue.severity,
    platform: issue.platform,
    machine_info: issue.machine_info,
    author_room: issue.author_room,
    screenshots: issue.screenshots,
    video_url: issue.video_url,
    status: issue.status,
    admin_notes: issue.admin_notes,
    resolved_by: issue.resolved_by,
    resolved_at: issue.resolved_at,
  };

  return {
    id: issue.id,
    question: JSON.stringify(payload),
    category: issue.category,
    author_name: issue.author_name || '',
    author_email: issue.author_email,
    answer: issue.admin_notes || null,
    answered_by: issue.resolved_by || null,
    answered_at: issue.resolved_at || null,
    status: issue.status,
    created_at: issue.created_at,
  };
}

let tableChecked: 'issues' | 'questions' | null = null;

async function getActiveTableName(): Promise<'issues' | 'questions'> {
  if (tableChecked) return tableChecked;
  if (!isSupabaseConfigured || !supabase) return 'questions';

  try {
    const { error } = await supabase.from('issues').select('id').limit(1);
    if (!error) {
      tableChecked = 'issues';
      return 'issues';
    }
  } catch {
    // ignore
  }
  tableChecked = 'questions';
  return 'questions';
}

export async function getIssues(): Promise<LaundryIssue[]> {
  if (isSupabaseConfigured && supabase) {
    const tableName = await getActiveTableName();

    if (tableName === 'issues') {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as LaundryIssue[];
      }
    } else {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(parseQuestionRowToIssue);
      }
    }
  }

  return (global.__memoryIssues || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getIssueById(id: string): Promise<LaundryIssue | null> {
  if (isSupabaseConfigured && supabase) {
    const tableName = await getActiveTableName();

    if (tableName === 'issues') {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as LaundryIssue;
      }
    } else {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return parseQuestionRowToIssue(data);
      }
    }
  }

  const found = (global.__memoryIssues || []).find((i) => i.id === id);
  return found || null;
}

export async function createIssue(
  data: Omit<LaundryIssue, 'id' | 'created_at' | 'status' | 'admin_notes' | 'resolved_by' | 'resolved_at'>
): Promise<LaundryIssue> {
  const newIssue: LaundryIssue = {
    ...data,
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `iss-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'open',
    admin_notes: null,
    resolved_by: null,
    resolved_at: null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const tableName = await getActiveTableName();

    if (tableName === 'issues') {
      const { data: inserted, error } = await supabase
        .from('issues')
        .insert([newIssue])
        .select()
        .single();

      if (!error && inserted) {
        return inserted as LaundryIssue;
      }
      console.error('Supabase insert issue error, falling back:', error);
    } else {
      const row = formatIssueToQuestionRow(newIssue);
      const { data: inserted, error } = await supabase
        .from('questions')
        .insert([row])
        .select()
        .single();

      if (!error && inserted) {
        return parseQuestionRowToIssue(inserted);
      }
      console.error('Supabase fallback insert error:', error);
    }
  }

  global.__memoryIssues = [newIssue, ...(global.__memoryIssues || [])];
  return newIssue;
}

export async function updateIssueStatus(
  id: string,
  updates: {
    status: IssueStatus;
    adminNotes?: string | null;
    resolvedBy?: string | null;
  }
): Promise<LaundryIssue | null> {
  const resolvedAt =
    updates.status === 'resolved' || updates.status === 'closed'
      ? new Date().toISOString()
      : null;

  if (isSupabaseConfigured && supabase) {
    const tableName = await getActiveTableName();

    if (tableName === 'issues') {
      const { data, error } = await supabase
        .from('issues')
        .update({
          status: updates.status,
          admin_notes: updates.adminNotes ?? null,
          resolved_by: updates.resolvedBy ?? null,
          resolved_at: resolvedAt,
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as LaundryIssue;
      }
    } else {
      const current = await getIssueById(id);
      if (current) {
        const updatedIssue: LaundryIssue = {
          ...current,
          status: updates.status,
          admin_notes: updates.adminNotes !== undefined ? updates.adminNotes : current.admin_notes,
          resolved_by: updates.resolvedBy !== undefined ? updates.resolvedBy : current.resolved_by,
          resolved_at: resolvedAt,
        };
        const row = formatIssueToQuestionRow(updatedIssue);
        const { data, error } = await supabase
          .from('questions')
          .update(row)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return parseQuestionRowToIssue(data);
        }
      }
    }
  }

  const list = global.__memoryIssues || [];
  const index = list.findIndex((i) => i.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      status: updates.status,
      admin_notes: updates.adminNotes !== undefined ? updates.adminNotes : list[index].admin_notes,
      resolved_by: updates.resolvedBy !== undefined ? updates.resolvedBy : list[index].resolved_by,
      resolved_at: resolvedAt,
    };
    return list[index];
  }

  return null;
}

export async function deleteIssue(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const tableName = await getActiveTableName();
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (!error) return true;
    console.error(`Supabase delete error on ${tableName}:`, error);
  }

  const initialLen = (global.__memoryIssues || []).length;
  global.__memoryIssues = (global.__memoryIssues || []).filter((i) => i.id !== id);
  return global.__memoryIssues.length < initialLen;
}

export async function uploadMediaFile(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // If supabase storage is not available, convert image to data URL if small
    if (contentType.startsWith('image/')) {
      const base64 = buffer.toString('base64');
      return { success: true, url: `data:${contentType};base64,${base64}` };
    }
    return { success: false, error: 'Storage bucket requires Supabase credentials' };
  }

  try {
    const bucketName = 'issue-attachments';
    const filePath = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { success: true, url: publicData.publicUrl };
  } catch (err: any) {
    console.error('Media upload caught error:', err);
    return { success: false, error: err.message || 'File upload failed' };
  }
}

// ==============================================================================
// Backward compatibility aliases
// ==============================================================================
export const getQuestions = getIssues;
export const getQuestionById = getIssueById;
export const deleteQuestion = deleteIssue;

export async function createQuestion({
  questionText,
  category = 'General',
  authorName = '',
  authorEmail,
}: {
  questionText: string;
  category?: string;
  authorName?: string;
  authorEmail: string;
}) {
  return createIssue({
    title: questionText.substring(0, 80),
    description: questionText,
    category: 'Other',
    severity: 'medium',
    platform: { device: 'Other', browser: 'Other' },
    author_name: authorName,
    author_email: authorEmail,
  });
}

export async function answerQuestion(
  id: string,
  answerText: string,
  answeredBy: string = 'Centrale Tech'
) {
  return updateIssueStatus(id, {
    status: 'resolved',
    adminNotes: answerText,
    resolvedBy: answeredBy,
  });
}

