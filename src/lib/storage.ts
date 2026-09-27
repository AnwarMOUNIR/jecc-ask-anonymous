import { createClient } from '@supabase/supabase-js';
import { Question } from '@/types';

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

// Fallback in-memory storage for immediate local preview and testing before Supabase keys are added
declare global {
  // eslint-disable-next-line no-var
  var __memoryQuestions: Question[] | undefined;
}

if (!global.__memoryQuestions) {
  global.__memoryQuestions = [
    {
      id: 'demo-1',
      question: 'What are the main events organized by JECC this academic year?',
      category: 'Events',
      author_name: 'Karim',
      author_email: 'student.karim@centrale-casablanca.ma',
      answer: 'JECC organizes several flagship events throughout the year, including engineering challenges, enterprise forums, workshops, and student networking seminars!',
      answered_by: 'JECC Core Team',
      answered_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'answered',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'demo-2',
      question: 'How can first-year students apply to become junior consultants or active members?',
      category: 'Recruitment',
      author_name: 'Salma',
      author_email: 'salma.ecc@gmail.com',
      answer: 'Recruitment campaigns open at the start of each semester with an information session followed by interviews. Keep an eye on our social channels!',
      answered_by: 'HR Division',
      answered_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: 'answered',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'demo-3',
      question: 'Will there be certificates provided after attending the Consulting masterclasses?',
      category: 'Workshops',
      author_name: 'Mehdi',
      author_email: 'mehdi.consulting@gmail.com',
      answer: null,
      answered_by: null,
      answered_at: null,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ];
}

export async function getQuestions(): Promise<Question[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error, falling back to local memory:', error);
      return (global.__memoryQuestions || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return data as Question[];
  }

  return (global.__memoryQuestions || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getQuestionById(id: string): Promise<Question | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return data as Question;
    }
  }

  const found = (global.__memoryQuestions || []).find((q) => q.id === id);
  return found || null;
}

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
}): Promise<Question> {
  const newQuestion: Question = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    question: questionText.trim(),
    category: category.trim() || 'General',
    author_name: authorName.trim(),
    author_email: authorEmail.trim().toLowerCase(),
    answer: null,
    answered_by: null,
    answered_at: null,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('questions')
      .insert([newQuestion])
      .select()
      .single();

    if (!error && data) {
      return data as Question;
    }
    console.error('Supabase insert error, falling back to local memory:', error);
  }

  global.__memoryQuestions = [newQuestion, ...(global.__memoryQuestions || [])];
  return newQuestion;
}

export async function answerQuestion(
  id: string,
  answerText: string,
  answeredBy: string = 'JECC Team'
): Promise<Question | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('questions')
      .update({
        answer: answerText.trim(),
        answered_by: answeredBy.trim() || 'JECC Team',
        answered_at: now,
        status: 'answered',
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      return data as Question;
    }
    console.error('Supabase update error, falling back to local memory:', error);
  }

  const list = global.__memoryQuestions || [];
  const index = list.findIndex((q) => q.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      answer: answerText.trim(),
      answered_by: answeredBy.trim() || 'JECC Team',
      answered_at: now,
      status: 'answered',
    };
    return list[index];
  }

  return null;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (!error) return true;
    console.error('Supabase delete error:', error);
  }

  const initialLen = (global.__memoryQuestions || []).length;
  global.__memoryQuestions = (global.__memoryQuestions || []).filter((q) => q.id !== id);
  return global.__memoryQuestions.length < initialLen;
}
