-- Migration: Fix Document Checklist Trigger (document_type enum issue)
-- Created: 2026-02-03
-- Fixes: Error "function lower(document_type) does not exist"

-- Drop the existing broken trigger and function
DROP TRIGGER IF EXISTS trigger_update_checklist_on_upload ON documents;
DROP FUNCTION IF EXISTS update_checklist_on_document_upload();

-- Recreate the function with proper enum casting
CREATE OR REPLACE FUNCTION update_checklist_on_document_upload()
RETURNS TRIGGER AS $$
BEGIN
    -- When a document is uploaded and matches a checklist item name, update status
    -- Cast enum to text before using LOWER()
    UPDATE document_checklist_items
    SET 
        document_id = NEW.id,
        status = CASE 
            WHEN NEW.verification_status = 'verified' THEN 'verified'
            WHEN NEW.verification_status = 'rejected' THEN 'rejected'
            ELSE 'submitted'
        END,
        updated_at = NOW()
    WHERE request_id = NEW.request_id
    AND status = 'pending'
    AND checklist_id IN (
        SELECT id FROM document_checklists 
        WHERE LOWER(document_name) = LOWER(NEW.document_type::text)
        OR LOWER(document_name) = LOWER(NEW.file_name)
    )
    AND document_id IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checklist_on_upload
AFTER INSERT ON documents
FOR EACH ROW
EXECUTE FUNCTION update_checklist_on_document_upload();
