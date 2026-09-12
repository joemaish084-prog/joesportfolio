CREATE TABLE public.agency_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  service_interest TEXT,
  budget_range TEXT,
  goals TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT
);

GRANT INSERT ON public.agency_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agency_leads TO authenticated;
GRANT ALL ON public.agency_leads TO service_role;

ALTER TABLE public.agency_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
ON public.agency_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);