
-- CANDIDATE TABLE: Stores candidate profiles  
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  resume_url text,
  application_date date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'Applied',
  -- ENUM: 'Applied', 'Shortlisted', 'Interview Scheduled', 'Interviewed', 'Offer Extended', 'Hired', 'Rejected'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- INTERVIEW TABLE: Stores interview schedules and notes for candidates  
CREATE TABLE IF NOT EXISTS public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  interview_date timestamptz NOT NULL,
  interviewer text NOT NULL,
  type text NOT NULL,  -- ENUM: 'Technical', 'HR', etc
  notes text,
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- EMPLOYEE TABLE: Stores details of all hired employees  
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  manager text,
  job_title text,
  date_of_joining date NOT NULL,
  employment_status text DEFAULT 'Active',  -- ENUM: 'Active', 'On Leave', 'Terminated'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DEPARTMENT TABLE (for filtering/search, can be expanded)
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Add RLS (Row Level Security): Allow only authenticated users to read/write their data
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read/write everything (customize for multi-user in future)
CREATE POLICY "Authenticated can CRUD candidates"
  ON public.candidates
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can CRUD interviews"
  ON public.interviews
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can CRUD employees"
  ON public.employees
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can CRUD departments"
  ON public.departments
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
