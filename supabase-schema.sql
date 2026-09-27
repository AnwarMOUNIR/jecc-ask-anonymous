-- SQL Schema update for questions table:

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  author_name TEXT,
  author_email TEXT NOT NULL,
  answer TEXT,
  answered_by TEXT,
  answered_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If table already exists, alter to add columns:
ALTER TABLE questions ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS author_email TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to questions
CREATE POLICY "Public read questions" ON questions
  FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Public insert questions" ON questions
  FOR INSERT WITH CHECK (true);

-- Allow update and delete via Service Role
CREATE POLICY "Admin full access" ON questions
  FOR ALL USING (true);
