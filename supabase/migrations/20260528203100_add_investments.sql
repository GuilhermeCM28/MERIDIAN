CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  invested_amount NUMERIC NOT NULL DEFAULT 0,
  expected_return_percentage NUMERIC DEFAULT 0,
  yield_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários visualizarem, inserirem, atualizarem e deletarem apenas seus próprios investimentos
CREATE POLICY "Users can view their own investments" 
ON investments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments" 
ON investments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" 
ON investments FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" 
ON investments FOR DELETE 
USING (auth.uid() = user_id);

-- Garantir que a função set_updated_at exista
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar `updated_at`
CREATE TRIGGER trg_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
