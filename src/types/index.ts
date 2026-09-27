export interface Question {
  id: string;
  question: string;
  category?: string;
  author_name?: string;
  author_email: string;
  answer?: string | null;
  answered_by?: string | null;
  answered_at?: string | null;
  status: 'pending' | 'answered';
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
