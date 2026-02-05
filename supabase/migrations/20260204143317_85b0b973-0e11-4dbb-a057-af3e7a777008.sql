-- Add new PageSpeed columns for mobile and desktop scores
ALTER TABLE public.reports 
ADD COLUMN speed_score_mobile integer NOT NULL DEFAULT 0,
ADD COLUMN speed_score_desktop integer NOT NULL DEFAULT 0,
ADD COLUMN pagespeed_url character varying;

-- Update test data with sample values
UPDATE public.reports 
SET 
  speed_score_mobile = 78,
  speed_score_desktop = 92,
  pagespeed_url = 'https://pagespeed.web.dev/analysis?url=https://example.com'
WHERE id = '660e8400-e29b-41d4-a716-446655440001';