import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  resolveLifecycleStatus,
  calculateLifecycleSLA,
  getLifecycleAction,
  getLifecycleProgress,
  getCaseBucket,
  getUrgencyScore,
  resolveCaseWorkflow, // NEW IMPORT
  ExtendedRequest,
  LifecycleStatus,
} from '@/app/domain/lifecycle/LifecycleResolver';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  console.log('[API] Entered lifecycle-summary route handler.');
  
  // NOTE: Next.js 16 requires params to be a Promise. 
  // We must await it to get the ID.
  let id: string | undefined;
  
  try {
    const params = await props.params;
    id = params?.id;

    if (!id) {
        return NextResponse.json({ error: 'Request ID is missing' }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('[API] Supabase client created.');
    console.log('[API] Processing request:', id);

    // 1. Fetch Request with all necessary relations
    // Using .maybeSingle() to prevent exceptions on "No rows found"
    const { data: requestData, error } = await supabase
      .from('legal_requests')
      .select(
        `
                *,
                lawyer:assigned_lawyer_id(id, full_name, avatar_url),
                department:departments(name, sla_hours),
                audit_events(action, created_at, details),
                documents(id, status),
                legal_opinions(
                    id,
                    status,
                    opinion_versions(is_draft, created_at, version_number)
                )
            `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[API] Supabase query error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    if (!requestData) {
      console.error('[API] Request not found for ID:', id);
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // 2. Prepare Extended Request
    // Defensive access to nested properties
    const opinions = requestData.legal_opinions || [];
    const opinion = opinions.length > 0 ? opinions[0] : null;

    let latestOpinion = null;
    if (opinion?.opinion_versions?.length > 0) {
      try {
        const versions = opinion.opinion_versions.map((v: any) => ({
          ...v,
          submitted_at: v.created_at, // Map created_at to submitted_at
        }));

        // Sort versions by version_number descending
        versions.sort((a: any, b: any) => (b.version_number || 0) - (a.version_number || 0));
        latestOpinion = versions[0];
      } catch (err) {
        console.error('[API] Error processing opinion versions:', err);
      }
    }

    const extendedRequest: ExtendedRequest = {
      ...requestData,
      latest_opinion_version: latestOpinion,
      audit_events: requestData.audit_events || [],
      documents: requestData.documents || [],
      department: requestData.department || null,
      lawyer: requestData.lawyer || null,
    };

    // 3. Resolve Lifecycle (Legacy + New)
    let lifecycleState: LifecycleStatus;
    let workflow: any; // CaseWorkflowState

    try {
      lifecycleState = resolveLifecycleStatus(extendedRequest);
    } catch (err) {
      console.error('[API] Error in resolveLifecycleStatus:', err);
      lifecycleState = 'submitted'; // Fallback
    }

    try {
        workflow = resolveCaseWorkflow(extendedRequest);
    } catch (err) {
        console.error('[API] Error in resolveCaseWorkflow:', err);
        // Minimal fallback workflow
        workflow = {
            stage: requestData.status,
            progress: 0,
            health: 'active',
            next_action: { title: 'Error', description: 'Could not resolve workflow', type: 'none', priority: 'low' },
            sla_status: { status: 'none', text: 'N/A', color: '', bgColor: '', borderColor: '', isOverdue: false, isAtRisk: false, dueDate: null },
            timeline: []
        };
    }

    // 4. Compute Derived Props
    let sla: any;
    try {
      sla = calculateLifecycleSLA(extendedRequest, lifecycleState);
    } catch (e) {
      console.error('[API] SLA Calc Failed:', e);
      sla = { status: 'none', text: 'N/A', color: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', dueDate: null, isOverdue: false, isAtRisk: false };
    }

    let nextStep: any;
    try {
      nextStep = getLifecycleAction(extendedRequest, lifecycleState);
    } catch (e) {
      console.error('[API] NextStep Calc Failed:', e);
      nextStep = { type: 'none', priority: 'low', title: 'Info', description: 'Available' };
    }

    let progress: any;
    try {
      progress = getLifecycleProgress(extendedRequest, lifecycleState);
    } catch (e) {
      console.error('[API] Progress Calc Failed:', e);
      progress = { currentStep: 1, totalSteps: 5, progress: 0, label: 'Loading...', steps: [] };
    }

    let bucket: any = 'ACTIVE';
    let urgencyScore = 0;
    try {
      bucket = getCaseBucket(extendedRequest, lifecycleState, sla.status || 'none');
      urgencyScore = getUrgencyScore(extendedRequest, lifecycleState, sla.status || 'none');
    } catch (e) {
      console.error('[API] Bucket/Score Calc Failed:', e);
    }

    // 5. Return Summary
    const response = {
      id: requestData.id,
      title: requestData.title || 'Untitled Request',
      request_number: requestData.request_number,
      created_at: requestData.created_at,
      updated_at: requestData.updated_at,
      visibility: extendedRequest.visibility || 'private',
      lawyer: requestData.lawyer,
      department: requestData.department,

      // New Workflow
      workflow,

      // Legacy
      lifecycleState,
      dashboardBucket: bucket,
      urgencyScore,

      sla,
      nextStep,
      progress,

      meta: {
        lastUpdated: new Date().toISOString(),
        isTerminal:
          lifecycleState === 'completed' ||
          lifecycleState === 'archived' ||
          lifecycleState === 'cancelled',
      },
    };

    return NextResponse.json(response);

  } catch (globalError: any) {
    console.error('[API] Unhandled Exception:', globalError);
    console.error('[API] Stack:', globalError?.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'An unexpected error occurred while processing the request summary.',
        // Only exposing message in prod usually, but helpful for debug now
        debug: globalError.message 
      }, 
      { status: 500 }
    );
  }
}
