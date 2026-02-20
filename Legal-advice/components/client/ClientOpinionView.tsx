'use client';

import { useState, useEffect } from 'react';

import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { requestOpinionClarification, closeRequest } from '@/app/actions/phase3_opinion_lifecycle';

interface OpinionVersion {
  id: string;
  version_number: number;
  content_sections: {
    facts: string;
    issues: string;
    analysis: string;
    conclusion: string;
    references: string;
  };
  status: string;
  created_at: string;
}

interface DigitalSignature {
  id: string;
  signer_name: string;
  signer_designation: string;
  signer_bar_council_id: string;
  signature_timestamp: string;
  signature_hash: string;
  status: 'signed' | 'pending' | 'rejected';
  verified_at: string | null;
}

interface OpinionClarification {
  id: string;
  section_reference: string;
  client_question: string;
  lawyer_response: string | null;
  status: 'open' | 'answered' | 'closed';
  created_at: string;
  responded_at: string | null;
}

interface ClientOpinionViewProps {
  opinionSubmissionId: string;
  requestId: string;
  canClose?: boolean; // Whether client can close the request
}

export default function ClientOpinionView({
  opinionSubmissionId,
  requestId,
  canClose = true,
}: ClientOpinionViewProps) {
    const [opinion, setOpinion] = useState<OpinionVersion | null>(null);
  const [signature, setSignature] = useState<DigitalSignature | null>(null);
  const [clarifications, setClarifications] = useState<OpinionClarification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    'facts' | 'issues' | 'analysis' | 'conclusion' | 'references'
  >('facts');

  // Clarification modal
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationSection, setClarificationSection] = useState('facts');
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);

  // Closure modal
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [closureReason, setClosureReason] = useState('');
  const [satisfactionRating, setSatisfactionRating] = useState(5);
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // Load opinion (ONLY signed/published versions visible to client via RLS)
  useEffect(() => {
    const loadOpinion = async () => {
      setIsLoading(true);

      // Get signed version
      const { data: version } = await supabase
        .from('opinion_versions')
        .select('*')
        .eq('opinion_submission_id', opinionSubmissionId)
        .in('status', ['signed', 'published'])
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (version) setOpinion(version as OpinionVersion);

      // Get signature
      const { data: sig } = await supabase
        .from('digital_signatures')
        .select('*')
        .eq('opinion_submission_id', opinionSubmissionId)
        .eq('status', 'signed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sig) setSignature(sig as DigitalSignature);

      // Check if request is closed
      const { data: closure } = await supabase
        .from('request_closures')
        .select('id')
        .eq('request_id', requestId)
        .maybeSingle();

      setIsClosed(!!closure);

      setIsLoading(false);
    };

    loadOpinion();
  }, [opinionSubmissionId, requestId]);

  // Load clarifications
  useEffect(() => {
    const loadClarifications = async () => {
      const { data } = await supabase
        .from('opinion_clarification_requests')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (data) setClarifications(data as OpinionClarification[]);
    };

    loadClarifications();
  }, [requestId]);

  // Submit clarification request
  const submitClarification = async () => {
    if (!clarificationQuestion.trim()) {
      alert('Please enter your question');
      return;
    }

    setIsSubmittingClarification(true);

    const result = await requestOpinionClarification(
      opinionSubmissionId,
      requestId,
      clarificationSection,
      clarificationQuestion
    );

    setIsSubmittingClarification(false);

    if (result.success) {
      // Reload clarifications
      const { data } = await supabase
        .from('opinion_clarification_requests')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (data) setClarifications(data as OpinionClarification[]);

      setShowClarificationModal(false);
      setClarificationQuestion('');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  // Close request
  const handleCloseRequest = async () => {
    if (!closureReason.trim()) {
      alert('Please provide a closure reason');
      return;
    }

    setIsClosing(true);

    const result = await closeRequest(requestId, closureReason, satisfactionRating);

    setIsClosing(false);

    if (result.success) {
      setIsClosed(true);
      setShowClosureModal(false);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!opinion || !signature) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Opinion Not Yet Available</h3>
          <p className="text-gray-600">
            Your lawyer is preparing the legal opinion. You'll be notified once it's ready.
          </p>
        </div>
      </Card>
    );
  }

  const sectionLabels: Record<keyof typeof opinion.content_sections, string> = {
    facts: 'Statement of Facts',
    issues: 'Legal Issues',
    analysis: 'Legal Analysis',
    conclusion: 'Conclusion & Recommendation',
    references: 'Legal References & Citations',
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Legal Opinion</h2>
          <p className="text-sm text-gray-600 mt-1">
            Version {opinion.version_number} • Signed on{' '}
            {
  format(new Date(signature.signature_timestamp), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex gap-3">
          {!isClosed && (
            <>
              <button
                onClick={() => setShowClarificationModal(true)}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
              >
                Request Clarification
              </button>
              {canClose && (
                <button
                  onClick={() => setShowClosureModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Close Request
                </button>
              )}
            </>
          )}
          {
  isClosed && (
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-medium">
              ✓ Request Closed
            </span>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Print Opinion
          </button>
        </div>
      </div>

      {/* Digital Signature Verification */}
      <Card>
        <div className="p-6 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-green-800">Digitally Signed & Verified</h3>
              <p className="text-sm text-green-700">
                Signed by {signature.signer_name} ({signature.signer_designation}) • Bar ID:{' '}
                {
  signature.signer_bar_council_id}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50">
          <p className="text-xs text-gray-600">
            Signature Hash:{' '}
            <span className="font-mono">{signature.signature_hash.substring(0, 40)}...</span>
          </p>
        </div>
      </Card>

      {/* Opinion Content */}
      <Card>
        <div className="p-6">
          {/* Section Tabs */}
          <div className="flex gap-2 border-b mb-6 overflow-x-auto">
            {(Object.keys(sectionLabels) as Array<keyof typeof opinion.content_sections>).map(
              (section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                    activeSection === section
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {sectionLabels[section]}
                </button>
              )
            )}
          </div>

          {/* Active Section Content */}
          <div className="prose max-w-none">
            <h3 className="text-xl font-bold mb-4">{sectionLabels[activeSection]}</h3>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {opinion.content_sections[activeSection]}
            </div>
          </div>
        </div>
      </Card>

      {/* Clarifications Section */}
      {
  clarifications.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Clarifications</h3>
            <div className="space-y-4">
              {clarifications.map((clarification) => (
                <div
                  key={clarification.id}
                  className={`p-4 rounded border ${
                    clarification.status === 'answered'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm text-gray-700">
                        Section: {clarification.section_reference}
                      </span>
                      <span
                        className={`ml-3 text-xs px-2 py-1 rounded ${
                          clarification.status === 'answered'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {clarification.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(clarification.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Your Question:</p>
                      <p className="text-sm text-gray-600 mt-1">{clarification.client_question}</p>
                    </div>

                    {clarification.lawyer_response && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium text-gray-700">Lawyer's Response:</p>
                        <p className="text-sm text-gray-800 mt-1">
                          {clarification.lawyer_response}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Responded:{' '}
                          {
  clarification.responded_at &&
                            format(new Date(clarification.responded_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Clarification Request Modal */}
      {
  showClarificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Request Clarification</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section</label>
                <select
                  value={clarificationSection}
                  onChange={(e) => setClarificationSection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="facts">Statement of Facts</option>
                  <option value="issues">Legal Issues</option>
                  <option value="analysis">Legal Analysis</option>
                  <option value="conclusion">Conclusion</option>
                  <option value="references">References</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Question</label>
                <textarea
                  value={clarificationQuestion}
                  onChange={(e) => setClarificationQuestion(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={5}
                  placeholder="What would you like clarified?"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowClarificationModal(false)}
                disabled={isSubmittingClarification}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitClarification}
                disabled={isSubmittingClarification}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmittingClarification ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Closure Modal */}
      {
  showClosureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Close Request</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Satisfaction Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSatisfactionRating(rating)}
                      className={`w-12 h-12 rounded ${
                        satisfactionRating >= rating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Closure Reason</label>
                <textarea
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                  placeholder="Why are you closing this request? (Optional feedback)"
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ Once closed, this request becomes read-only and cannot be reopened.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowClosureModal(false)}
                disabled={isClosing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseRequest}
                disabled={isClosing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isClosing ? 'Closing...' : 'Close Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
