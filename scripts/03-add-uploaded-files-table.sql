-- Create table for tracking uploaded files
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for uploaded_files
CREATE POLICY "Users can view their own files"
  ON uploaded_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own files"
  ON uploaded_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON uploaded_files FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX idx_uploaded_files_created_at ON uploaded_files(created_at DESC);
