-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles: admins can read all roles
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create task_templates table for predefined tasks
CREATE TABLE public.task_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL DEFAULT 'standard',
    is_active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on task_templates
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Public can read active templates
CREATE POLICY "Anyone can read active templates"
ON public.task_templates
FOR SELECT
USING (is_active = true);

-- Admins can manage templates
CREATE POLICY "Admins can manage templates"
ON public.task_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update clients table: admins can manage
CREATE POLICY "Admins can manage clients"
ON public.clients
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update reports table: admins can manage
CREATE POLICY "Admins can manage reports"
ON public.reports
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default task templates
INSERT INTO public.task_templates (name, category, sort_order) VALUES
('Aktualizacja WordPress do najnowszej wersji', 'standard', 1),
('Aktualizacja wtyczek', 'standard', 2),
('Backup bazy danych', 'standard', 3),
('Optymalizacja obrazów', 'standard', 4),
('Przegląd bezpieczeństwa', 'standard', 5),
('Aktualizacja motywu', 'standard', 6),
('Czyszczenie bazy danych', 'standard', 7),
('Sprawdzenie wydajności', 'standard', 8);