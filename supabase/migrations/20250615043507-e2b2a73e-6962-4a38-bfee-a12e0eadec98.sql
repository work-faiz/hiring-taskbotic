
ALTER TABLE public.departments
ADD COLUMN department_head_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
