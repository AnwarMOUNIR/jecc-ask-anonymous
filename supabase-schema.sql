-- Run this SQL in your Supabase SQL Editor if using Supabase:

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  answer TEXT,
  answered_by TEXT,
  answered_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to questions
CREATE POLICY "Public read questions" ON questions
  FOR SELECT USING (true);

-- Allow public anonymous insert
CREATE POLICY "Public insert questions" ON questions
  FOR INSERT WITH CHECK (true);

-- Allow update and delete via Service Role
CREATE POLICY "Admin full access" ON questions
  FOR ALL USING (true);
