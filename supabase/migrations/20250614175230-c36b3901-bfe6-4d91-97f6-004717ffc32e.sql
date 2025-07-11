
-- Create a public storage bucket for candidate resumes
insert into storage.buckets (id, name, public)
values ('candidate-resumes', 'candidate-resumes', true);

-- Optional: Grant public access policies for upload, read, update, and delete
-- (default policies for public buckets are typically permissive)
