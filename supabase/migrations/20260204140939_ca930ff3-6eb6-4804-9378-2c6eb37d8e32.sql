-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  status_text TEXT NOT NULL,
  speed_score INT NOT NULL DEFAULT 0,
  uptime_percent DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  updates_count INT NOT NULL DEFAULT 0,
  tasks_json JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  invoice_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public read access for reports (accessed via direct link)
CREATE POLICY "Reports are publicly readable"
  ON public.reports
  FOR SELECT
  USING (true);

-- Public read access for clients (needed to display client name in report)
CREATE POLICY "Clients are publicly readable"
  ON public.clients
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_reports_client_id ON public.reports(client_id);
CREATE INDEX idx_reports_month ON public.reports(month);