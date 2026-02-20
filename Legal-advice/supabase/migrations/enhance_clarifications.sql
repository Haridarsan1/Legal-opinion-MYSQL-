-- Enhance clarifications table for threading and better tracking
ALTER TABLE clarifications
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES clarifications(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by_role TEXT CHECK (created_by_role IN ('client', 'lawyer')),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Create index for threaded queries
CREATE INDEX IF NOT EXISTS idx_clarifications_parent ON clarifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_clarifications_priority ON clarifications(priority);
CREATE INDEX IF NOT EXISTS idx_clarifications_resolved ON clarifications(is_resolved, resolved_at);

-- Add comments
COMMENT ON COLUMN clarifications.parent_id IS 'Links replies to original clarification for threading';
COMMENT ON COLUMN clarifications.created_by_role IS 'Role of the user who created this clarification';
COMMENT ON COLUMN clarifications.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN clarifications.resolved_by IS 'User who marked the clarification as resolved';
COMMENT ON COLUMN clarifications.resolved_at IS 'Timestamp when clarification was resolved';

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clarifications'
AND column_name IN ('parent_id', 'created_by_role', 'priority', 'resolved_by', 'resolved_at')
ORDER BY column_name;
