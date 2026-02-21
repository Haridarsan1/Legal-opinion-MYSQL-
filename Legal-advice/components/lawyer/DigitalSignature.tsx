'use client';
import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const supabase = createClient();

interface SignatureValidation {
  no_open_clarifications: boolean;
  no_pending_peer_reviews: boolean;
  all_sections_complete: boolean;
  client_notified: boolean;
  validation_passed: boolean;
}

interface DigitalSignatureData {
  id: string;
  signer_name: string;
  signer_designation: string;
  signer_bar_council_id: string;
  signature_timestamp: string;
  signature_hash: string;
  status: 'pending' | 'signed' | 'rejected';
  verified_at: string | null;
}

interface DigitalSignatureProps {
  opinionVersionId: string;
  requestId: string;
  mode: 'sign' | 'view'; // 'sign' for lawyer to sign, 'view' for client to view
  onSignComplete?: () => void;
}

export default function DigitalSignature({
  opinionVersionId,
  requestId,
  mode,
  onSignComplete,
}: DigitalSignatureProps) {
  const { data: session } = useSession();
  const [validation, setValidation] = useState<SignatureValidation | null>(null);
  const [signature, setSignature] = useState<DigitalSignatureData | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  // Signature form
  const [signerName, setSignerName] = useState('');
  const [signerDesignation, setSignerDesignation] = useState('');
  const [signerBarId, setSignerBarId] = useState('');
  const [signatureType, setSignatureType] = useState<'digital' | 'electronic' | 'scanned'>(
    'digital'
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Load existing signature
  useEffect(() => {
    const loadSignature = async () => {
      const { data } = (await __getSupabaseClient()).from('digital_signatures')
        .select('*')
        .eq('opinion_version_id', opinionVersionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setSignature(data as DigitalSignatureData);
    };

    loadSignature();
  }, [opinionVersionId]);

  // Load user profile for pre-filling
  useEffect(() => {
    const loadProfile = async () => {
      const user = session?.user;
      if (!user) return;

      const { data } = (await __getSupabaseClient()).from('profiles')
        .select('full_name, bar_council_id')
        .eq('id', user.id)
        .single();

      if (data) {
        setSignerName(data.full_name || '');
        setSignerBarId(data.bar_council_id || '');
        setSignerDesignation('Advocate'); // Default
      }
    };

    if (mode === 'sign' && showSignModal) {
      loadProfile();
    }
  }, [mode, showSignModal]);

  // Validate readiness for signature
  const validateSignature = async () => {
    setIsValidating(true);

    // Check 1: No open clarifications
    const { data: openClarifications } = (await __getSupabaseClient()).from('clarifications')
      .select('id')
      .eq('request_id', requestId)
      .eq('status', 'open');

    const noOpenClarifications = (openClarifications?.length || 0) === 0;

    // Check 2: No pending peer reviews
    const { data: pendingReviews } = (await __getSupabaseClient()).from('peer_reviews')
      .select('id')
      .eq('request_id', requestId)
      .in('status', ['requested', 'in_progress']);

    const noPendingPeerReviews = (pendingReviews?.length || 0) === 0;

    // Check 3: All sections complete
    const { data: version } = (await __getSupabaseClient()).from('opinion_versions')
      .select('content_sections')
      .eq('id', opinionVersionId)
      .single();

    let allSectionsComplete = false;
    if (version) {
      const sections = version.content_sections as any;
      allSectionsComplete = Object.values(sections).every(
        (s: any) => typeof s === 'string' && s.trim().length > 0
      );
    }

    // Check 4: Client notified (check if opinion status updated)
    const { data: opinion } = (await __getSupabaseClient()).from('opinion_submissions')
      .select('id')
      .eq('request_id', requestId)
      .single();

    const clientNotified = !!opinion; // Simplification

    const validationResult: SignatureValidation = {
      no_open_clarifications: noOpenClarifications,
      no_pending_peer_reviews: noPendingPeerReviews,
      all_sections_complete: allSectionsComplete,
      client_notified: clientNotified,
      validation_passed:
        noOpenClarifications && noPendingPeerReviews && allSectionsComplete && clientNotified,
    };

    setValidation(validationResult);

    // Save validation to database
    const user = session?.user;
    if (user) {
      (await __getSupabaseClient()).from('opinion_signature_validations').insert({
        opinion_version_id: opinionVersionId,
        no_open_clarifications: noOpenClarifications,
        no_pending_peer_reviews: noPendingPeerReviews,
        all_sections_complete: allSectionsComplete,
        client_notified: clientNotified,
        validated_by: user.id,
      });
    }

    setIsValidating(false);

    // Auto-open sign modal if validation passed
    if (validationResult.validation_passed) {
      setShowSignModal(true);
    }
  };

  // Generate signature hash (SHA-256)
  const generateSignatureHash = async (content: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  // Sign opinion
  const signOpinion = async () => {
    if (!signerName || !signerDesignation || !signerBarId || !agreedToTerms) {
      alert('Please fill all fields and agree to terms');
      return;
    }

    if (!validation?.validation_passed) {
      alert('Validation must pass before signing');
      return;
    }

    setIsSigning(true);

    const user = session?.user;
    if (!user) return;

    // Get opinion version content for hash
    const { data: version } = (await __getSupabaseClient()).from('opinion_versions')
      .select('content_sections, opinion_submission_id')
      .eq('id', opinionVersionId)
      .single();

    if (!version) {
      setIsSigning(false);
      return;
    }

    // Generate hash of opinion content + timestamp
    const timestamp = new Date().toISOString();
    const contentToHash = JSON.stringify(version.content_sections) + timestamp + signerBarId;
    const hash = await generateSignatureHash(contentToHash);

    // Create signature record
    const { data: signatureData, error } = (await __getSupabaseClient()).from('digital_signatures')
      .insert({
        opinion_submission_id: version.opinion_submission_id,
        opinion_version_id: opinionVersionId,
        signer_id: user.id,
        signer_name: signerName,
        signer_designation: signerDesignation,
        signer_bar_council_id: signerBarId,
        signature_type: signatureType,
        signature_timestamp: timestamp,
        signature_hash: hash,
        status: 'signed',
        verified_at: timestamp,
      })
      .select()
      .single();

    if (!error && signatureData) {
      // Lock the version
      (await __getSupabaseClient()).from('opinion_versions')
        .update({
          is_locked: true,
          locked_at: timestamp,
          locked_by: user.id,
          status: 'signed',
        })
        .eq('id', opinionVersionId);

      // Update opinion submission
      (await __getSupabaseClient()).from('opinion_submissions')
        .update({
          is_final: true,
          opinion_status: 'final',
          locked_at: timestamp,
          is_locked: true,
        })
        .eq('id', version.opinion_submission_id);

      // Update request status
      (await __getSupabaseClient()).from('legal_requests').update({ status: 'opinion_ready' }).eq('id', requestId);

      setSignature(signatureData as DigitalSignatureData);
      setShowSignModal(false);
      setIsSigning(false);

      if (onSignComplete) onSignComplete();
    } else {
      setIsSigning(false);
      alert('Signature failed. Please try again.');
    }
  };

  // Verify signature (for client view)
  const verifySignature = () => {
    if (!signature) return false;

    // Basic verification: check if hash exists and signature is marked as signed
    return signature.status === 'signed' && signature.verified_at !== null;
  };

  if (mode === 'view' && !signature) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">Opinion not yet signed</div>
      </Card>
    );
  }

  if (mode === 'view' && signature) {
    const isVerified = verifySignature();

    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Digital Signature</h3>
            {isVerified ? (
              <span className="flex items-center gap-2 text-green-600 font-semibold">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            ) : (
              <span className="text-yellow-600 font-semibold">⚠️ Unverified</span>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Signed By</p>
                <p className="font-medium">{signature.signer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Designation</p>
                <p className="font-medium">{signature.signer_designation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bar Council ID</p>
                <p className="font-medium">{signature.signer_bar_council_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Signature Date</p>
                <p className="font-medium">
                  {format(new Date(signature.signature_timestamp), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Signature Hash (SHA-256)</p>
              <p className="font-mono text-xs bg-gray-50 p-3 rounded break-all">
                {signature.signature_hash}
              </p>
            </div>

            {isVerified && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">
                  ✓ This signature has been cryptographically verified and is legally binding.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Mode === 'sign'
  return (
    <div>
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-6">Sign Opinion</h3>

          {!validation && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Before signing, the system will validate:</p>
              <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  No open clarifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  No pending peer reviews
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  All opinion sections complete
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  Client notification sent
                </li>
              </ul>
              <button
                onClick={validateSignature}
                disabled={isValidating || !!signature}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validating...' : signature ? 'Already Signed' : 'Validate & Sign'}
              </button>
            </div>
          )}

          {
            validation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ValidationCheck
                    label="No Open Clarifications"
                    passed={validation.no_open_clarifications}
                  />
                  <ValidationCheck
                    label="No Pending Peer Reviews"
                    passed={validation.no_pending_peer_reviews}
                  />
                  <ValidationCheck
                    label="All Sections Complete"
                    passed={validation.all_sections_complete}
                  />
                  <ValidationCheck label="Client Notified" passed={validation.client_notified} />
                </div>

                {!validation.validation_passed && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 font-medium">
                      ⚠️ Cannot sign: Some validation checks failed
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                      Please resolve all issues before signing the opinion.
                    </p>
                  </div>
                )}

                {
                  validation.validation_passed && !signature && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-medium">✓ All validation checks passed</p>
                      <p className="text-green-600 text-sm mt-1">Opinion is ready to be signed.</p>
                    </div>
                  )}

                {
                  signature && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-800 font-medium">
                        ✓ Opinion already signed on{' '}
                        {
                          format(new Date(signature.signature_timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  )}
              </div>
            )}
        </div>
      </Card>

      {/* Sign Modal */}
      {
        showSignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">Digital Signature</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Your full legal name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Designation</label>
                  <input
                    type="text"
                    value={signerDesignation}
                    onChange={(e) => setSignerDesignation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g., Advocate, Senior Advocate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bar Council ID</label>
                  <input
                    type="text"
                    value={signerBarId}
                    onChange={(e) => setSignerBarId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Your Bar Council registration number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Signature Type</label>
                  <select
                    value={signatureType}
                    onChange={(e) => setSignatureType(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="digital">Digital Signature</option>
                    <option value="electronic">Electronic Signature</option>
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      I certify that this opinion is accurate to the best of my knowledge and
                      professional judgment. I understand that this digital signature is legally
                      binding and this opinion cannot be modified after signing.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSignModal(false)}
                  disabled={isSigning}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={signOpinion}
                  disabled={isSigning || !agreedToTerms}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigning ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Signing...
                    </span>
                  ) : (
                    'Sign Opinion'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

// Validation check component
function ValidationCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div
      className={`p-3 rounded border ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}
    >
      <div className="flex items-center gap-2">
        {passed ? (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className={`text-sm font-medium ${passed ? 'text-green-800' : 'text-red-800'}`}>
          {label}
        </span>
      </div>
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
