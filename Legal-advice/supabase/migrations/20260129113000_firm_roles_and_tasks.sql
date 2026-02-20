-- =====================================================
-- FIRM ROLES & TASKS
-- =====================================================

-- 1. Create Enums
CREATE TYPE public.firm_role_type AS ENUM ('owner', 'senior_lawyer', 'junior_lawyer');
CREATE TYPE public.task_type AS ENUM ('research', 'drafting', 'review', 'verification', 'clarification');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'submitted', 'completed', 'blocked');
CREATE TYPE public.visibility_scope AS ENUM ('internal', 'client', 'bank');

-- 2. Add firm_role to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS firm_role firm_role_type;

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_firm_role ON profiles(firm_role);

-- 3. Create firm_tasks table
CREATE TABLE IF NOT EXISTS public.firm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    related_request_id UUID REFERENCES public.legal_requests(id) ON DELETE SET NULL,
    
    task_type task_type NOT NULL DEFAULT 'research',
    visibility_scope visibility_scope NOT NULL DEFAULT 'internal',
    status task_status NOT NULL DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_firm_tasks_firm ON firm_tasks(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_tasks_assigned ON firm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_firm_tasks_request ON firm_tasks(related_request_id);

-- Auto-update updated_at
CREATE TRIGGER firm_tasks_updated_at
  BEFORE UPDATE ON firm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- 4. RLS Policies
ALTER TABLE public.firm_tasks ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's firm role
-- (Doing this via join in policies for now to avoid complexity of another function, 
--  or rely on cached auth.jwt() claims if we were custom claims, but we are using tables)

-- SELECT: Can view tasks if in the same firm
CREATE POLICY "View firm tasks" 
ON public.firm_tasks FOR SELECT 
TO authenticated 
USING (
  firm_id IN (
    SELECT firm_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- INSERT: Only Owner or Senior Lawyer can assign tasks
CREATE POLICY "Create firm tasks" 
ON public.firm_tasks FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND firm_id = firm_tasks.firm_id
    AND (firm_role = 'owner' OR firm_role = 'senior_lawyer' OR role = 'admin') -- fallback role admin
  )
);

-- UPDATE:
-- Owners/Seniors can update anything.
-- Juniors can only update status if assigned to them, and CANNOT set to completed.
CREATE POLICY "Update firm tasks" 
ON public.firm_tasks FOR UPDATE 
TO authenticated 
USING (
  -- 1. User is Owner/Senior
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND firm_id = firm_tasks.firm_id
    AND (firm_role = 'owner' OR firm_role = 'senior_lawyer')
  )
  OR
  -- 2. User is assigned Junior and NOT setting to completed
  (
    assigned_to = auth.uid()
    -- Check if they are trying to set status to 'completed' happens in CHECK or application logic?
    -- RLS USING filters rows they can SEE to update.
    -- WITH CHECK filters the NEW row state.
  )
)
WITH CHECK (
  -- 1. User is Owner/Senior
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND firm_id = firm_tasks.firm_id
    AND (firm_role = 'owner' OR firm_role = 'senior_lawyer')
  )
  OR
  -- 2. User is assigned Junior
  (
    assigned_to = auth.uid()
    AND status <> 'completed' -- Junior cannot mark as completed
  )
);

-- DELETE: Owner or Senior only
CREATE POLICY "Delete firm tasks" 
ON public.firm_tasks FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND firm_id = firm_tasks.firm_id
    AND (firm_role = 'owner' OR firm_role = 'senior_lawyer')
  )
);

-- Comments
COMMENT ON TABLE firm_tasks IS 'Internal tasks for firm workflow.';
COMMENT ON COLUMN firm_tasks.status IS 'Juniors can submit, but only Seniors/Owners can complete.';
