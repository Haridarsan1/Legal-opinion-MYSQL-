-- =====================================================
-- Legal Opinion Portal - Seed Data (Data Only - No Profiles)
-- =====================================================
-- INSTRUCTIONS:
-- 1. First, sign up test users via the app UI (see TEST_USERS.md for credentials)
-- 2. Then run this SQL file to populate sample data
-- =====================================================

-- NOTE: This file assumes you've already created test users with these IDs:
-- You'll need to update the UUIDs below with actual user IDs from your auth.users table

-- =====================================================
-- LEGAL REQUESTS (Sample requests using existing user IDs)
-- =====================================================

-- First, let's get the actual user IDs (you'll need to update these manually)
-- Run this query first to see your user IDs:
-- SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users;

-- Then replace the UUIDs below with real ones from your database

-- Example: Assuming you have signed up users, update their IDs here
DO $$
DECLARE
    client_user_id UUID;
    lawyer_user_id UUID;
    firm_user_id UUID;
    bank_user_id UUID;
    dept_corporate UUID;
    dept_ip UUID;
    dept_realestate UUID;
    dept_employment UUID;
    dept_banking UUID;
    dept_litigation UUID;
BEGIN
    -- Get existing user IDs (ACTUAL USER EMAILS - Updated Jan 19, 2026)
    SELECT id INTO client_user_id FROM auth.users WHERE email = 'pixelfactory11@gmail.com' LIMIT 1;
    SELECT id INTO lawyer_user_id FROM auth.users WHERE email = 'haridarsan18@gmail.com' LIMIT 1;
    SELECT id INTO firm_user_id FROM auth.users WHERE email = 'firm@legalfirm.com' LIMIT 1; -- Optional: Create if needed
    SELECT id INTO bank_user_id FROM auth.users WHERE email = 'haridarsan01@gmail.com' LIMIT 1;

    -- Get department IDs
    SELECT id INTO dept_corporate FROM departments WHERE name = 'Corporate & Tax Law' LIMIT 1;
    SELECT id INTO dept_ip FROM departments WHERE name = 'Intellectual Property' LIMIT 1;
    SELECT id INTO dept_realestate FROM departments WHERE name = 'Real Estate & Property' LIMIT 1;
    SELECT id INTO dept_employment FROM departments WHERE name = 'Employment Law' LIMIT 1;
    SELECT id INTO dept_banking FROM departments WHERE name = 'Banking & Finance' LIMIT 1;
    SELECT id INTO dept_litigation FROM departments WHERE name = 'Litigation Support' LIMIT 1;

    -- Only proceed if we have at least a client and lawyer
    IF client_user_id IS NOT NULL AND lawyer_user_id IS NOT NULL THEN
        
        -- Insert legal requests
        INSERT INTO legal_requests (id, request_number, client_id, department_id, assigned_lawyer_id, assigned_firm_id, title, description, property_address, loan_amount, status, priority, sla_tier, sla_deadline, submitted_at, assigned_at, completed_at) VALUES
        
        -- Completed Requests
        (gen_random_uuid(), '#1001', client_user_id, dept_corporate, lawyer_user_id, NULL, 'Corporate Tax Review FY2023', 'Comprehensive tax compliance review for fiscal year 2023 including GST, income tax, and TDS verification.', NULL, NULL, 'completed', 'medium', '48h', NOW() - INTERVAL '10 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days', NOW() - INTERVAL '10 days'),
        
        (gen_random_uuid(), '#1002', client_user_id, dept_realestate, lawyer_user_id, NULL, 'Property Title Verification - Mumbai Plot', 'Title deed verification for 2000 sq ft commercial plot in Andheri West, Mumbai.', 'Plot No. 45, Andheri West, Mumbai - 400053', NULL, 'completed', 'high', '48h', NOW() - INTERVAL '5 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '5 days'),
        
        -- In Progress Requests
        (gen_random_uuid(), '#1005', client_user_id, dept_corporate, lawyer_user_id, NULL, 'Merger & Acquisition Due Diligence', 'Legal due diligence for acquisition of competing startup. Review of financial records, contracts, and compliance.', NULL, NULL, 'in_review', 'urgent', '24h', NOW() + INTERVAL '2 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NULL),
        
        (gen_random_uuid(), '#1006', client_user_id, dept_banking, lawyer_user_id, NULL, 'Loan Documentation Review - Working Capital', 'Review of working capital loan agreement and security documents for Rs. 50 Lakhs.', NULL, 5000000.00, 'in_review', 'high', '24h', NOW() + INTERVAL '1 day', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL),
        
        -- Pending Assignment (Submitted)
        (gen_random_uuid(), '#1010', client_user_id, dept_corporate, NULL, NULL, 'Board Resolution Drafting', 'Draft board resolution for approval of annual financial statements and dividend declaration.', NULL, NULL, 'submitted', 'medium', '48h', NOW() + INTERVAL '2 days', NOW() - INTERVAL '1 day', NULL, NULL),
        
        (gen_random_uuid(), '#1011', client_user_id, dept_realestate, NULL, NULL, 'Property Lease Agreement Review', 'Review of commercial property lease agreement for 5-year term. Tenant rights verification.', 'Office Space 201, Business Park, Gurgaon - 122001', NULL, 'submitted', 'low', '48h', NOW() + INTERVAL '2 days', NOW() - INTERVAL '12 hours', NULL, NULL),
        
        -- Clarification Requested
        (gen_random_uuid(), '#1013', client_user_id, dept_banking, lawyer_user_id, NULL, 'Home Loan Documentation - Title Verification', 'Title verification for home loan of Rs. 75 Lakhs. Property in Pune.', 'Bungalow 12, Palm Heights, Pune - 411014', 7500000.00, 'clarification_requested', 'high', '48h', NOW() + INTERVAL '1 day', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NULL),
        
        -- Opinion Ready
        (gen_random_uuid(), '#1015', client_user_id, dept_ip, lawyer_user_id, NULL, 'Copyright Registration - Software Code', 'Copyright registration for proprietary software code and technical documentation.', NULL, NULL, 'opinion_ready', 'medium', '72h', NOW() - INTERVAL '1 day', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NULL);

        -- =====================================================
        -- NOTIFICATIONS (for test users)
        -- =====================================================
        
        INSERT INTO notifications (user_id, type, title, message, related_request_id, is_read) VALUES
        (client_user_id, 'status_update', 'Request #1005 In Review', 'Your merger & acquisition due diligence request is now under review.', (SELECT id FROM legal_requests WHERE request_number = '#1005'), false),
        (client_user_id, 'clarification', 'Clarification Needed - #1013', 'Lawyer has requested additional documents for your home loan verification.', (SELECT id FROM legal_requests WHERE request_number = '#1013'), false),
        (client_user_id, 'status_update', 'Opinion Ready - #1015', 'Legal opinion for your copyright registration request is ready for review.', (SELECT id FROM legal_requests WHERE request_number = '#1015'), true);

        IF lawyer_user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, title, message, related_request_id, is_read) VALUES
            (lawyer_user_id, 'case_assigned', 'New Case Assigned - #1010', 'You have been assigned a board resolution drafting request.', (SELECT id FROM legal_requests WHERE request_number = '#1010'), false),
            (lawyer_user_id, 'reminder', 'Deadline Approaching - #1005', 'SLA deadline for request #1005 is in 2 days.', (SELECT id FROM legal_requests WHERE request_number = '#1005'), true);
        END IF;

        -- =====================================================
        -- RATINGS (for completed requests)
        -- =====================================================
        
        INSERT INTO ratings (request_id, client_id, lawyer_id, overall_rating, feedback)
        SELECT 
            lr.id,
            lr.client_id,
            lr.assigned_lawyer_id,
            5,
            'Excellent service! Very professional and timely delivery.'
        FROM legal_requests lr
        WHERE lr.status = 'completed' AND lr.assigned_lawyer_id IS NOT NULL
        LIMIT 2;

        -- =====================================================
        -- CLARIFICATIONS
        -- =====================================================
        
        INSERT INTO clarifications (request_id, requester_id, subject, message, priority, is_resolved, response, responded_at) VALUES
        ((SELECT id FROM legal_requests WHERE request_number = '#1013'), lawyer_user_id, 'Additional Documents Required', 'Please provide the latest property tax receipt and approved building plan for title verification.', 'high', false, NULL, NULL);

        -- =====================================================
        -- AUDIT LOGS
        -- =====================================================
        
        INSERT INTO audit_logs (user_id, request_id, action, details, ip_address, user_agent) VALUES
        (client_user_id, (SELECT id FROM legal_requests WHERE request_number = '#1010'), 'created', '{"request_number": "#1010", "title": "Board Resolution Drafting", "priority": "medium"}', '103.12.34.56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        (lawyer_user_id, (SELECT id FROM legal_requests WHERE request_number = '#1005'), 'status_changed', '{"old_status": "assigned", "new_status": "in_review"}', '203.45.67.89', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

        RAISE NOTICE '✅ Seed data inserted successfully!';
        RAISE NOTICE '📊 Created sample data for existing users';
        RAISE NOTICE '   - Legal requests: 8';
        RAISE NOTICE '   - Notifications: 5';
        RAISE NOTICE '   - Ratings: 2';
        RAISE NOTICE '   - Clarifications: 1';
        RAISE NOTICE '   - Audit logs: 2';
    ELSE
        RAISE NOTICE '⚠️  No users found! Please sign up test users first.';
        RAISE NOTICE '   Expected emails: pixelfactory11@gmail.com (client), haridarsan18@gmail.com (lawyer)';
        RAISE NOTICE '   See TEST_USERS.md for all test credentials';
    END IF;
END $$;
