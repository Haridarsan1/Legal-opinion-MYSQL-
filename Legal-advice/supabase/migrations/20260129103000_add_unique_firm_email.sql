-- Make official_email unique in firms table
ALTER TABLE public.firms ADD CONSTRAINT firms_official_email_key UNIQUE (official_email);
