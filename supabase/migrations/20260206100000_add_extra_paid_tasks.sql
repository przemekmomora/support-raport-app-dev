-- Add column for additional paid tasks
ALTER TABLE public.reports
ADD COLUMN extra_paid_tasks_json JSONB DEFAULT '[]'::jsonb;
