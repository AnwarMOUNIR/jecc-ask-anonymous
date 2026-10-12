-- ==============================================================================
-- CENTRALE TECH — laundry.fecc.ma ISSUE TRACKER DATABASE SCHEMA
-- École Centrale Casablanca
-- ==============================================================================

-- 1. Create Dedicated Issues Table
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Machine Malfunction',
  severity TEXT NOT NULL DEFAULT 'medium',
  platform JSONB NOT NULL DEFAULT '{"device": "Other", "browser": "Other"}'::jsonb,
  machine_info JSONB,
  author_name TEXT,
  author_email TEXT NOT NULL,
  author_room TEXT,
  screenshots JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for speed
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues (category);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all issues
CREATE POLICY "Public read issues" ON issues
  FOR SELECT USING (true);

-- Allow public insertion of issues (students reporting)
CREATE POLICY "Public insert issues" ON issues
  FOR INSERT WITH CHECK (true);

-- Allow full access to service role for updates & deletions
CREATE POLICY "Admin full access issues" ON issues
  FOR ALL USING (true);

-- Note: Storage bucket 'issue-attachments' is automatically created for
-- uploaded screenshots and video reproduction files.
