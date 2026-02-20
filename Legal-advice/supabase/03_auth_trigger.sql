-- =====================================================
-- Legal Opinion Portal - Auth Triggers & Functions
-- =====================================================
-- Run this AFTER 02_rls_policies.sql
-- =====================================================

-- =====================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================

-- Function to create profile when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile on signup, reading role from metadata and casting to user_role type
  INSERT INTO public.profiles (id, role, full_name, email, phone, organization)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'client')::user_role,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email, 'New User'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'organization', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Trigger to call function on auth.users INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- AUTO-CREATE AUDIT LOG ON STATUS CHANGE
-- =====================================================

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (request_id, user_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for status changes
CREATE TRIGGER on_request_status_changed
  AFTER UPDATE ON legal_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_request_status_change();

-- =====================================================
-- AUTO-CREATE NOTIFICATION ON STATUS CHANGE
-- =====================================================

-- Function to create notification on status change
CREATE OR REPLACE FUNCTION notify_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set notification title and message based on new status
    CASE NEW.status
      WHEN 'assigned' THEN
        notification_title := 'Case Assigned';
        notification_message := 'Your request ' || NEW.request_number || ' has been assigned to a lawyer.';
      WHEN 'in_review' THEN
        notification_title := 'Review Started';
        notification_message := 'Your request ' || NEW.request_number || ' is now being reviewed.';
      WHEN 'clarification_requested' THEN
        notification_title := 'Clarification Required';
        notification_message := 'The lawyer has requested clarification for ' || NEW.request_number || '.';
      WHEN 'opinion_ready' THEN
        notification_title := 'Opinion Ready';
        notification_message := 'Legal opinion for ' || NEW.request_number || ' is ready for review.';
      WHEN 'delivered' THEN
        notification_title := 'Opinion Delivered';
        notification_message := 'Legal opinion for ' || NEW.request_number || ' has been delivered.';
      WHEN 'completed' THEN
        notification_title := 'Case Completed';
        notification_message := 'Your request ' || NEW.request_number || ' has been completed.';
      ELSE
        notification_title := 'Status Updated';
        notification_message := 'Status updated for ' || NEW.request_number || '.';
    END CASE;

    -- Create notification for client
    INSERT INTO notifications (user_id, type, title, message, related_request_id)
    VALUES (
      NEW.client_id,
      'status_update',
      notification_title,
      notification_message,
      NEW.id
    );

    -- Also notify assigned lawyer if exists
    IF NEW.assigned_lawyer_id IS NOT NULL AND NEW.status IN ('clarification_requested') THEN
      INSERT INTO notifications (user_id, type, title, message, related_request_id)
      VALUES (
        NEW.assigned_lawyer_id,
        'status_update',
        'Case Update',
        'Status updated for ' || NEW.request_number || '.',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for notifications
CREATE TRIGGER on_request_notification
  AFTER UPDATE ON legal_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_on_status_change();

-- =====================================================
-- SET SLA DEADLINE ON REQUEST CREATION
-- =====================================================

-- Function to set SLA deadline
CREATE OR REPLACE FUNCTION set_sla_deadline()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  dept_sla_hours INTEGER;
BEGIN
  -- Get department SLA hours
  SELECT sla_hours INTO dept_sla_hours
  FROM departments
  WHERE id = NEW.department_id;

  -- Override with tier-specific SLA if provided
  IF NEW.sla_tier = '24h' THEN
    dept_sla_hours := 24;
  ELSIF NEW.sla_tier = '48h' THEN
    dept_sla_hours := 48;
  ELSIF NEW.sla_tier = '72h' THEN
    dept_sla_hours := 72;
  END IF;

  -- Set deadline
  NEW.sla_deadline := NEW.submitted_at + (dept_sla_hours || ' hours')::INTERVAL;
  
  RETURN NEW;
END;
$$;

-- Trigger to set SLA deadline
CREATE TRIGGER on_request_created_set_sla
  BEFORE INSERT ON legal_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_sla_deadline();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Auth triggers and functions created successfully!';
  RAISE NOTICE '🔄 Auto-profile creation on signup enabled';
  RAISE NOTICE '📝 Auto-audit logging on status change enabled';
  RAISE NOTICE '🔔 Auto-notifications on status change enabled';
  RAISE NOTICE '⏰ Auto-SLA deadline calculation enabled';
  RAISE NOTICE '⏭️  Next step: Run 04_storage_setup.sql';
END $$;
