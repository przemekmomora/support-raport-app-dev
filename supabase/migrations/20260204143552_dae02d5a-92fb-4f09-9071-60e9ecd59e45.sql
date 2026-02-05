-- Add website URL column to clients table
ALTER TABLE public.clients 
ADD COLUMN website_url character varying;

-- Update test data with sample website
UPDATE public.clients 
SET website_url = 'https://example.com'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';