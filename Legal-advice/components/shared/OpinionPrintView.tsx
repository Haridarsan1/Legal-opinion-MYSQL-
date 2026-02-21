'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface OpinionPrintViewProps {
  opinionVersionId: string;
  requestId: string;
}

interface OpinionData {
  version_number: number;
  content_sections: {
    facts: string;
    issues: string;
    analysis: string;
    conclusion: string;
    references: string;
  };
  created_at: string;
  status: string;
}

interface SignatureData {
  signer_name: string;
  signer_designation: string;
  signer_bar_council_id: string;
  signature_timestamp: string;
  signature_hash: string;
  status?: string;
}

interface RequestData {
  request_number: string;
  title: string;
  client: {
    full_name: string;
  };
  lawyer: {
    full_name: string;
    bar_council_id: string;
    firm_name: string | null;
  };
}

export default function OpinionPrintView({ opinionVersionId, requestId }: OpinionPrintViewProps) {
    const [opinion, setOpinion] = useState<OpinionData | null>(null);
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [request, setRequest] = useState<RequestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Load opinion version
      const { data: opinionData } = (await __getSupabaseClient()).from('opinion_versions')
        .select('version_number, content_sections, created_at, status')
        .eq('id', opinionVersionId)
        .single();

      if (opinionData) setOpinion(opinionData as OpinionData);

      // Load signature
      const { data: sigData } = (await __getSupabaseClient()).from('digital_signatures')
        .select(
          'signer_name, signer_designation, signer_bar_council_id, signature_timestamp, signature_hash'
        )
        .eq('opinion_version_id', opinionVersionId)
        .eq('status', 'signed')
        .single();

      if (sigData) setSignature(sigData as SignatureData);

      // Load request details
      const { data: reqData } = (await __getSupabaseClient()).from('legal_requests')
        .select(
          `
          request_number,
          title,
          client:profiles!legal_requests_client_id_fkey(full_name),
          lawyer:profiles!legal_requests_assigned_lawyer_id_fkey(full_name, bar_council_id, firm_name)
        `
        )
        .eq('id', requestId)
        .single();

      if (reqData) setRequest(reqData as any);

      setIsLoading(false);
    };

    loadData();
  }, [opinionVersionId, requestId]);

  if (isLoading || !opinion || !signature || !request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading opinion...</div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Page Container */}
      <div className="print-container bg-white min-h-screen p-8">
        {/* Watermark */}
        <div className="watermark">
          {signature.status === 'signed' ? 'LEGALLY BINDING' : 'DRAFT'}
        </div>

        {/* Header */}
        <div className="header border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide">Legal Opinion</h1>
              <p className="text-sm text-gray-600 mt-1">Request No: {request.request_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">Version {opinion.version_number}</p>
              <p className="text-xs text-gray-600">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* Case Details */}
        <div className="case-details mb-8 p-4 bg-gray-50 border border-gray-200">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="font-semibold py-2 w-32">Matter Title:</td>
                <td className="py-2">{request.title}</td>
              </tr>
              <tr>
                <td className="font-semibold py-2">Client:</td>
                <td className="py-2">{request.client.full_name}</td>
              </tr>
              <tr>
                <td className="font-semibold py-2">Counsel:</td>
                <td className="py-2">
                  {request.lawyer.full_name} ({request.lawyer.bar_council_id})
                  {request.lawyer.firm_name && ` - ${request.lawyer.firm_name}`}
                </td>
              </tr>
              <tr>
                <td className="font-semibold py-2">Opinion Date:</td>
                <td className="py-2">
                  {new Date(signature.signature_timestamp).toLocaleDateString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Opinion Content */}
        <div className="opinion-content space-y-8">
          {/* Section 1: Facts */}
          <section className="section">
            <h2 className="section-title">1. STATEMENT OF FACTS</h2>
            <div className="section-content">{opinion.content_sections.facts}</div>
          </section>

          {/* Section 2: Issues */}
          <section className="section page-break-before">
            <h2 className="section-title">2. LEGAL ISSUES</h2>
            <div className="section-content">{opinion.content_sections.issues}</div>
          </section>

          {/* Section 3: Analysis */}
          <section className="section page-break-before">
            <h2 className="section-title">3. LEGAL ANALYSIS</h2>
            <div className="section-content">{opinion.content_sections.analysis}</div>
          </section>

          {/* Section 4: Conclusion */}
          <section className="section page-break-before">
            <h2 className="section-title">4. CONCLUSION & RECOMMENDATION</h2>
            <div className="section-content">{opinion.content_sections.conclusion}</div>
          </section>

          {/* Section 5: References */}
          <section className="section page-break-before">
            <h2 className="section-title">5. LEGAL REFERENCES & CITATIONS</h2>
            <div className="section-content">{opinion.content_sections.references}</div>
          </section>
        </div>

        {/* Signature Block */}
        <div className="signature-block mt-12 pt-8 border-t-2 border-gray-300 page-break-before">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">DIGITAL SIGNATURE VERIFICATION</h3>
            <div className="bg-green-50 border-2 border-green-600 p-6 rounded">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-800 font-bold text-lg">VERIFIED & LEGALLY BINDING</span>
              </div>

              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-semibold py-2 w-48">Signed By:</td>
                    <td className="py-2">{signature.signer_name}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-2">Designation:</td>
                    <td className="py-2">{signature.signer_designation}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-2">Bar Council ID:</td>
                    <td className="py-2">{signature.signer_bar_council_id}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-2">Signature Timestamp:</td>
                    <td className="py-2">
                      {new Date(signature.signature_timestamp).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-2 align-top">Signature Hash (SHA-256):</td>
                    <td className="py-2 font-mono text-xs break-all">{signature.signature_hash}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer mt-12 pt-6 border-t border-gray-300 text-xs text-gray-600">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-semibold">Legal Opinion Portal</p>
              <p>Confidential & Privileged</p>
            </div>
            <div className="text-center">
              <p>Page 1 of 1</p>
            </div>
            <div className="text-right">
              <p>Generated: {currentDate}</p>
              <p>Version {opinion.version_number}</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="font-semibold">DISCLAIMER</p>
            <p className="mt-1">
              This legal opinion is provided based on the facts presented and applicable laws as of
              the date mentioned. It is intended solely for the addressee and shall not be relied
              upon by any third party without express written consent.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        .print-container {
          max-width: 210mm; /* A4 width */
          margin: 0 auto;
          font-family: 'Georgia', 'Times New Roman', serif;
          position: relative;
        }

        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.05);
          z-index: -1;
          pointer-events: none;
          white-space: nowrap;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          color: #1a1a1a;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .section-content {
          font-size: 12px;
          line-height: 1.8;
          text-align: justify;
          color: #374151;
          white-space: pre-wrap;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print-container {
            margin: 0;
            padding: 20mm;
            max-width: none;
          }

          .watermark {
            position: fixed;
            opacity: 1;
          }

          .page-break-before {
            page-break-before: always;
          }

          .header {
            border-bottom: 2px solid #000;
          }

          .signature-block {
            border-top: 2px solid #000;
          }

          /* Footer on every page */
          @page {
            margin: 20mm;
            @bottom-center {
              content: counter(page) ' of ' counter(pages);
            }
          }

          /* Hide screen-only elements */
          button,
          .no-print {
            display: none !important;
          }
        }

        @media screen {
          .print-container {
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </>
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
