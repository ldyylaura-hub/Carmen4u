-- Create idol_charms table
CREATE TABLE IF NOT EXISTS public.idol_charms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE, -- Auto-approve for now for simplicity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.idol_charms ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON public.idol_charms
  FOR SELECT
  USING (true);

-- Allow public insert access (anyone can add a charm)
CREATE POLICY "Allow public insert access"
  ON public.idol_charms
  FOR INSERT
  WITH CHECK (true);

-- Insert initial data
INSERT INTO public.idol_charms (content) VALUES
  ('小卡门，大眼萌！'),
  ('反差魅力'),
  ('心系粉丝，积极营业'),
  ('歌唱实力优秀，舞蹈水平快速上升'),
  ('...未完待续');
