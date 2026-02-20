
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runVerification() {
  console.log('Starting Workflow Verification...');
  console.log('--------------------------------');

  try {
    // 0. Get a valid user and department
    const { data: profile } = await supabase.from('profiles').select('id, user_role').eq('user_role', 'client').limit(1).single();
    // If no client profile, try any profile
    const clientId = profile?.id || (await supabase.from('profiles').select('id').limit(1).single()).data?.id;
    
    // Get a valid department ID
    const { data: dept } = await supabase.from('departments').select('id').limit(1).single();
    const departmentId = dept?.id;

    if (!clientId || !departmentId) {
        console.error('❌ Error: Missing required test data (client or department)');
        return;
    }
    console.log(`✅ Using Client ID: ${clientId}`);
    console.log(`✅ Using Department ID: ${departmentId}`);

    // 1. Create Private Request
    console.log('\nTesting Private Request Creation...');
    const { data: privateReq, error: privateError } = await supabase
      .from('legal_requests')
      .insert({
        title: 'Test Private Request ' + Date.now(),
        description: 'Test Description',
        status: 'pending_lawyer_response', 
        visibility: 'private',
        client_id: clientId, 
        department_id: departmentId
      })
      .select()
      .single(); 

    if (privateError) {
       console.error(`❌ Failed: ${privateError.message}`);
       if (privateError.message.includes('invalid input value for enum')) {
           console.log('   -> Hint: Database migration has not been applied yet.');
       }
    } else {
       console.log(`✅ Success: Created Private Request with status '${privateReq.status}'`);
    }

    // 2. Create Public Request
    console.log('\nTesting Public Request Creation...');
    const { data: publicReq, error: publicError } = await supabase
      .from('legal_requests')
      .insert({
        title: 'Test Public Request ' + Date.now(),
        description: 'Test Description',
        status: 'open',
        visibility: 'public',
        client_id: clientId,
        department_id: departmentId
      })
      .select()
      .single();

    if (publicError) {
       console.error(`❌ Failed: ${publicError.message}`);
    } else {
       console.log(`✅ Success: Created Public Request with status '${publicReq.status}'`);
    }

    // 4. Test Proposal Acceptance -> New Case Logic
    console.log('\nTesting Proposal Acceptance Logic...');
    
    // 4a. Create a public request
    console.log('   Creating initial public request...');
    const { data: proposalReq, error: propReqError } = await supabase
      .from('legal_requests')
      .insert({
        title: 'Proposal Test Request ' + Date.now(),
        description: 'Testing Proposal Acceptance',
        status: 'open',
        visibility: 'public',
        client_id: clientId,
        department_id: departmentId
      })
      .select()
      .single();

    if (propReqError || !proposalReq) {
       console.error(`❌ Failed to create public request: ${propReqError?.message}`);
    } else {
       console.log(`   Created public request: ${proposalReq.id}`);
       
       // 4b. Create a proposal for this request (simulating a lawyer)
       const { data: lawyer } = await supabase.from('profiles').select('id').eq('role', 'lawyer').limit(1).single();
       if (lawyer) {
           console.log(`   Using Lawyer ID: ${lawyer.id}`);
           // Corrected columns based on app/actions/proposals.ts
           const { data: proposal, error: propError } = await supabase
            .from('request_proposals')
            .insert({
                request_id: proposalReq.id,
                lawyer_id: lawyer.id,
                proposal_message: 'This is a test proposal message that is definitely longer than fifty characters to satisfy the database check constraint.', 
                proposed_fee: 1000,
                timeline_days: 5,
                status: 'submitted' // 'submitted' is the initial status, not 'pending'
            })
            .select()
            .single();

           if (propError) {
               console.error(`❌ Failed to create proposal: ${propError.message}`);
           } else {
               console.log(`   Created proposal: ${proposal.id}`);
               
               // 4c. Simulate Acceptance (This logic mimics createCaseFromProposal)
               console.log('   Simulating Acceptance -> Forking to New Case...');
               
               const { data: newCase, error: newCaseError } = await supabase
                .from('legal_requests')
                .insert({
                    client_id: clientId,
                    assigned_lawyer_id: lawyer.id,
                    department_id: proposalReq.department_id,
                    title: proposalReq.title,
                    description: proposalReq.description,
                    status: 'awaiting_payment', // Correct status per action
                    visibility: 'private',
                    request_type: 'direct',
                    origin_request_id: proposalReq.id, // Correct column name
                    proposal_id: proposal.id, // Correct column name
                    // loan_amount: 1000 // Optional, purely based on action logic
                })
                .select()
                .single();

                if (newCaseError) {
                    console.error(`❌ Failed to fork case: ${newCaseError.message}`);
                } else {
                    console.log(`✅ Success: Created new private case ${newCase.id} from proposal.`);
                    console.log(`   Status: ${newCase.status}`);
                    console.log(`   Parent Request: ${newCase.origin_request_id}`);
                }
           }
       } else {
           console.log('⚠️ Skipping proposal test: No lawyer profiles found.');
       }
    }

  } catch (error: any) {
    console.error('Unexpected Error:', error);
  }
}

runVerification();
