-- Create ai_chat_messages table
CREATE TABLE ai_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own chat messages"
  ON ai_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chat messages"
  ON ai_chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for faster retrieval by user and time
CREATE INDEX ai_chat_messages_user_id_created_at_idx ON ai_chat_messages(user_id, created_at DESC);
