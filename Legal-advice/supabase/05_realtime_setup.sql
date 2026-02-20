-- =====================================================
-- Legal Opinion Portal - Realtime Configuration
-- =====================================================
-- Run this AFTER all tables and policies are set up
-- =====================================================

-- =====================================================
-- ENABLE REALTIME on specific tables
-- =====================================================

-- Enable Realtime for legal_requests (status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE legal_requests;

-- Enable Realtime for documents (new uploads)
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

-- Enable Realtime for notifications (new messages)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable Realtime for audit_logs (activity tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- Enable Realtime for clarifications (new questions/answers)
ALTER PUBLICATION supabase_realtime ADD TABLE clarifications;

-- =====================================================
-- VERIFY REALTIME CONFIGURATION
-- =====================================================

-- Check which tables are enabled for Realtime
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- =====================================================
-- REALTIME USAGE INSTRUCTIONS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📡 REALTIME SETUP COMPLETE';
  RAISE NOTICE '================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Realtime enabled for tables:';
  RAISE NOTICE '  ✅ legal_requests - Live status updates';
  RAISE NOTICE '  ✅ documents - New file uploads';
  RAISE NOTICE '  ✅ notifications - Instant notifications';
  RAISE NOTICE '  ✅ audit_logs - Activity tracking';
  RAISE NOTICE '  ✅ clarifications - Q&A updates';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Next.js Usage Example:';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'import { createClient } from ''@/lib/supabase/client''';
  RAISE NOTICE '';
  RAISE NOTICE 'const supabase = createClient()';
  RAISE NOTICE '';
  RAISE NOTICE '// Subscribe to status changes';
  RAISE NOTICE 'supabase';
  RAISE NOTICE '  .channel(''request-updates'')';
  RAISE NOTICE '  .on(';
  RAISE NOTICE '    ''postgres_changes'',';
  RAISE NOTICE '    {';
  RAISE NOTICE '      event: ''UPDATE'',';
  RAISE NOTICE '      schema: ''public'',';
  RAISE NOTICE '      table: ''legal_requests'',';
  RAISE NOTICE '      filter: `id=eq.${requestId}`';
  RAISE NOTICE '    },';
  RAISE NOTICE '    (payload) => {';
  RAISE NOTICE '      console.log(''Status changed:'', payload.new)';
  RAISE NOTICE '      // Update UI with new status';
  RAISE NOTICE '    }';
  RAISE NOTICE '  )';
  RAISE NOTICE '  .subscribe()';
  RAISE NOTICE '';
  RAISE NOTICE '// Subscribe to new notifications';
  RAISE NOTICE 'supabase';
  RAISE NOTICE '  .channel(''notifications'')';
  RAISE NOTICE '  .on(';
  RAISE NOTICE '    ''postgres_changes'',';
  RAISE NOTICE '    {';
  RAISE NOTICE '      event: ''INSERT'',';
  RAISE NOTICE '      schema: ''public'',';
  RAISE NOTICE '      table: ''notifications'',';
  RAISE NOTICE '      filter: `user_id=eq.${userId}`';
  RAISE NOTICE '    },';
  RAISE NOTICE '    (payload) => {';
  RAISE NOTICE '      console.log(''New notification:'', payload.new)';
  RAISE NOTICE '      // Show notification toast';
  RAISE NOTICE '    }';
  RAISE NOTICE '  )';
  RAISE NOTICE '  .subscribe()';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '⏭️  Next: Update .env.local with Supabase credentials';
END $$;
